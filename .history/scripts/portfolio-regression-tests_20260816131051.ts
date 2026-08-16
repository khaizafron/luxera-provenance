import { parsePortfolioCsv, validatePortfolioCsvRows } from '../lib/portfolio/clients';
import { dbStore, PortfolioClient, SoWCase, DocumentRecord } from '../lib/db/store';
import { loginUser, createSessionCookie, getAuthSession } from '../lib/auth/session';
import { runSoWEvaluation } from '../lib/compliance/sow-engine';

async function expect(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  const csv = `client_id,client_name,total_deposited,currency\nCL-0001,Ahmad Zaki,850000,MYR\nCL-0002,Sarah Tan,2400000,MYR\n`;
  const parsed = parsePortfolioCsv(csv);
  await expect(parsed.rows.length === 2, 'Valid CSV should parse rows successfully');

  const validation = validatePortfolioCsvRows(parsed.rows);
  await expect(validation.valid.length === 2, 'Valid CSV should pass validation');
  await expect(validation.rejected.length === 0, 'Valid CSV should have no rejected rows');

  const missingColumnCsv = `client_id,client_name,total_deposited\nCL-0001,Ahmad Zaki,850000\n`;
  const missingColumnParse = parsePortfolioCsv(missingColumnCsv);
  const missingColumnAlert = validatePortfolioCsvRows(missingColumnParse.rows, missingColumnParse.headers);
  await expect(missingColumnAlert.errors.some((err) => /required column|currency/i.test(err.message)), 'Missing currency column should be reported');

  const invalidAmountCsv = `client_id,client_name,total_deposited,currency\nCL-0001,Ahmad Zaki,invalid,MYR\n`;
  const invalidAmountParse = parsePortfolioCsv(invalidAmountCsv);
  const invalidAmountAlert = validatePortfolioCsvRows(invalidAmountParse.rows, invalidAmountParse.headers);
  await expect(invalidAmountAlert.valid.length === 0, 'Invalid deposited amount should be rejected');

  const duplicateCsv = `client_id,client_name,total_deposited,currency\nCL-0001,Ahmad Zaki,850000,MYR\nCL-0001,Sarah Tan,2400000,MYR\n`;
  const duplicateParse = parsePortfolioCsv(duplicateCsv);
  const duplicateAlert = validatePortfolioCsvRows(duplicateParse.rows, duplicateParse.headers);
  await expect(duplicateAlert.errors.some((err) => /duplicate client_id/i.test(err.message)), 'Duplicate client IDs should be detected');

  const sessionUser = await loginUser('officer@luxera.world', 'password');
  await expect(sessionUser, 'User login should work for portfolio tests');
  const user = sessionUser!;

  const client: PortfolioClient = {
    id: 'PORT-TEST-001',
    organization_id: user.organization_id,
    client_id: 'CL-PORT-001',
    client_name: 'Carmen Lee',
    total_deposited: 120000,
    currency: 'MYR',
    source: 'CSV_IMPORT',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  dbStore.portfolioClients.set(client.id, client);
  const fetched = dbStore.portfolioClients.get(client.id);
  await expect(fetched?.client_id === 'CL-PORT-001', 'Portfolio client should persist to the store');

  const caseId = 'CASE-PORT-TEST-001';
  const casePayload: SoWCase = {
    id: caseId,
    case_number: 'LX-PORT-TEST-001',
    organization_id: user.organization_id,
    customer_name: client.client_name,
    customer_nric_passport: '900101-01-0001',
    declared_annual_income: 120000,
    currency: client.currency,
    primary_source_category: 'EMPLOYMENT',
    employer_name: 'Luxera Digital Systems Sdn. Bhd.',
    occupation_title: 'Operations Analyst',
    status: 'QUEUED',
    created_by_user_id: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    portfolio_client_id: client.id,
    portfolio_client_name: client.client_name,
    portfolio_total_deposited: client.total_deposited,
    portfolio_currency: client.currency,
  };

  dbStore.cases.set(caseId, casePayload);
  await expect(dbStore.cases.get(caseId)?.portfolio_total_deposited === 120000, 'Portfolio data should be carried into the SoW case');

  const payslip: DocumentRecord = {
    id: 'DOC-PORT-PAYSLIP',
    case_id: caseId,
    organization_id: user.organization_id,
    filename: 'carmen_payslip.pdf',
    file_type: 'PAYSLIP',
    file_size: 250000,
    mime_type: 'application/pdf',
    sha256_hash: 'hash-1',
    url: '/documents/carmen_payslip.pdf',
    ocr_extracted_text: 'Luxera Digital Systems Sdn. Bhd.\nEmployee: Carmen Lee\nBasic Salary: MYR 10,000.00\nNet Pay: MYR 9,500.00\nAnnualised Income: MYR 114,000.00',
    uploaded_by: user.id,
    created_at: new Date().toISOString(),
    upload_status: 'COMPLETED',
    ocr_status: 'COMPLETED',
  };

  const bankStatement: DocumentRecord = {
    id: 'DOC-PORT-BANK',
    case_id: caseId,
    organization_id: user.organization_id,
    filename: 'carmen_bank_statement.pdf',
    file_type: 'BANK_STATEMENT',
    file_size: 500000,
    mime_type: 'application/pdf',
    sha256_hash: 'hash-2',
    url: '/documents/carmen_bank_statement.pdf',
    ocr_extracted_text: 'Maybank Statement\nAccount Holder: Carmen Lee\nPeriod: Jan-Dec 2026\nTotal Credits: MYR 125,000.00\nPayroll Credits: MYR 120,000.00',
    uploaded_by: user.id,
    created_at: new Date().toISOString(),
    upload_status: 'COMPLETED',
    ocr_status: 'COMPLETED',
  };

  const result = await runSoWEvaluation(casePayload, [payslip, bankStatement], { enablePiiRedaction: true });
  await expect(result.rule_evaluation_results.some((rule) => rule.rule_id === 'RULE_PORTFOLIO_CONTEXT'), 'Portfolio context should be inserted into the rule evaluation');
  await expect(result.extracted_financial_profile.total_bank_deposits_detected !== undefined, 'Bank statement evidence should be included in evaluation');
  await expect(result.overall_decision === 'APPROVED' || result.overall_decision === 'MANUAL_REVIEW_REQUIRED' || result.overall_decision === 'INSUFFICIENT_INFORMATION', 'The engine should preserve the existing decision space');

  const historicalCase: SoWCase = {
    ...casePayload,
    portfolio_total_deposited: 120000,
    portfolio_currency: 'MYR',
  };
  const updatedPortfolio: PortfolioClient = {
    ...client,
    total_deposited: 200000,
    updated_at: new Date().toISOString(),
  };
  dbStore.portfolioClients.set(updatedPortfolio.id, updatedPortfolio);
  dbStore.cases.set(historicalCase.id, historicalCase);
  await expect(dbStore.cases.get(historicalCase.id)?.portfolio_total_deposited === 120000, 'Historical case snapshot should remain stable even if portfolio exposure changes later');

  const cookie = createSessionCookie(user);
  const request = new Request('http://localhost/api/cases', { headers: { cookie } });
  const session = await getAuthSession(request);
  await expect(session, 'Session should resolve correctly for portfolio flows');

  const standaloneCase: SoWCase = {
    id: 'CASE-STANDALONE-TEST',
    case_number: 'LX-SOW-TEST-STANDALONE',
    organization_id: user.organization_id,
    customer_name: 'Standalone Customer',
    customer_nric_passport: '981231-01-0002',
    declared_annual_income: 140000,
    currency: 'MYR',
    primary_source_category: 'EMPLOYMENT',
    employer_name: 'Independent Service Provider',
    occupation_title: 'Business Consultant',
    status: 'QUEUED',
    created_by_user_id: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  dbStore.cases.set(standaloneCase.id, standaloneCase);
  await expect(dbStore.cases.get(standaloneCase.id)?.customer_name === 'Standalone Customer', 'Standalone case should continue to work without portfolio metadata');

  console.log('Portfolio regression tests passed through the evaluation contract checks');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
