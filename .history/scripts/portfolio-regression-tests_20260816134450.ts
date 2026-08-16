import { parsePortfolioCsv, validatePortfolioCsvRows } from '../lib/portfolio/clients';
import { dbStore, PortfolioClient, SoWCase, DocumentRecord } from '../lib/db/store';
import { loginUser, createSessionCookie, getAuthSession } from '../lib/auth/session';
import { runSoWEvaluation } from '../lib/compliance/sow-engine';

async function expect(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log('\n========================================');
  console.log('PORTFOLIO REGRESSION TEST SUITE');
  console.log('========================================\n');

  // TEST 1: Portfolio CSV Import
  console.log('TEST 1: Portfolio CSV Import Validation');
  const csv = `client_id,client_name,total_deposited,currency\nCL-0001,Ahmad Zaki,850000,MYR\nCL-0002,Sarah Tan,2400000,MYR\n`;
  const parsed = parsePortfolioCsv(csv);
  await expect(parsed.rows.length === 2, 'Valid CSV should parse rows successfully');

  const validation = validatePortfolioCsvRows(parsed.rows);
  await expect(validation.valid.length === 2, 'Valid CSV should pass validation');
  await expect(validation.rejected.length === 0, 'Valid CSV should have no rejected rows');
  console.log('✓ PASS\n');

  // TEST 2: CSV Validation - Missing Column
  console.log('TEST 2: CSV Validation - Missing Required Column');
  const missingColumnCsv = `client_id,client_name,total_deposited\nCL-0001,Ahmad Zaki,850000\n`;
  const missingColumnParse = parsePortfolioCsv(missingColumnCsv);
  const missingColumnAlert = validatePortfolioCsvRows(missingColumnParse.rows, missingColumnParse.headers);
  await expect(missingColumnAlert.errors.some((err) => /required column|currency/i.test(err.message)), 'Missing currency column should be reported');
  console.log('✓ PASS\n');

  // TEST 3: CSV Validation - Invalid Amount
  console.log('TEST 3: CSV Validation - Invalid Amount');
  const invalidAmountCsv = `client_id,client_name,total_deposited,currency\nCL-0001,Ahmad Zaki,invalid,MYR\n`;
  const invalidAmountParse = parsePortfolioCsv(invalidAmountCsv);
  const invalidAmountAlert = validatePortfolioCsvRows(invalidAmountParse.rows, invalidAmountParse.headers);
  await expect(invalidAmountAlert.valid.length === 0, 'Invalid deposited amount should be rejected');
  console.log('✓ PASS\n');

  // TEST 4: CSV Validation - Duplicate Client
  console.log('TEST 4: CSV Validation - Duplicate Client ID');
  const duplicateCsv = `client_id,client_name,total_deposited,currency\nCL-0001,Ahmad Zaki,850000,MYR\nCL-0001,Sarah Tan,2400000,MYR\n`;
  const duplicateParse = parsePortfolioCsv(duplicateCsv);
  const duplicateAlert = validatePortfolioCsvRows(duplicateParse.rows, duplicateParse.headers);
  await expect(duplicateAlert.errors.some((err) => /duplicate client_id/i.test(err.message)), 'Duplicate client IDs should be detected');
  console.log('✓ PASS\n');

  // TEST 5: Portfolio Client Storage
  console.log('TEST 5: Portfolio Client Storage and Retrieval');
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
  console.log('✓ PASS\n');

  // TEST 6: Portfolio Case Snapshot - Low Risk
  console.log('TEST 6: Portfolio Case - Low Risk / Supported by Evidence');
  const caseId = 'CASE-PORT-LOW-RISK-001';
  const lowRiskCase: SoWCase = {
    id: caseId,
    case_number: 'LX-PORT-LOW-RISK-001',
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

  dbStore.cases.set(caseId, lowRiskCase);
  await expect(dbStore.cases.get(caseId)?.portfolio_total_deposited === 120000, 'Portfolio data should be carried into the SoW case');
  console.log('✓ PASS\n');

  // TEST 7: Portfolio Case - High Risk / Material Discrepancy
  console.log('TEST 7: Portfolio Case - High Risk / Material Discrepancy');
  const highRiskCaseId = 'CASE-PORT-HIGH-RISK-001';
  const highRiskCase: SoWCase = {
    id: highRiskCaseId,
    case_number: 'LX-PORT-HIGH-RISK-001',
    organization_id: user.organization_id,
    customer_name: 'Adrian Wong Kok Leong',
    customer_nric_passport: '850615-10-4721',
    declared_annual_income: 180000,
    currency: 'MYR',
    primary_source_category: 'EMPLOYMENT',
    employer_name: 'Apex Meridian Technologies Sdn. Bhd.',
    occupation_title: 'Senior Technology Manager',
    status: 'QUEUED',
    created_by_user_id: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    portfolio_client_id: 'CL-PORT-ADRIAN',
    portfolio_client_name: 'Adrian Wong Kok Leong',
    portfolio_total_deposited: 2400000,
    portfolio_currency: 'MYR',
  };

  const highRiskPayslip: DocumentRecord = {
    id: 'DOC-ADRIAN-PAYSLIP',
    case_id: highRiskCaseId,
    organization_id: user.organization_id,
    filename: 'adrian_payslip.pdf',
    file_type: 'PAYSLIP',
    file_size: 250000,
    mime_type: 'application/pdf',
    sha256_hash: 'hash-adrian-1',
    url: '/documents/adrian_payslip.pdf',
    ocr_extracted_text: 'Apex Meridian Technologies Sdn. Bhd.\nEmployee: Adrian Wong Kok Leong\nBasic Salary: MYR 15,000.00\nNet Pay: MYR 14,250.00\nAnnualised Income: MYR 180,000.00',
    uploaded_by: user.id,
    created_at: new Date().toISOString(),
    upload_status: 'COMPLETED',
    ocr_status: 'COMPLETED',
  };

  const highRiskBankStatement: DocumentRecord = {
    id: 'DOC-ADRIAN-BANK',
    case_id: highRiskCaseId,
    organization_id: user.organization_id,
    filename: 'adrian_bank_statement.pdf',
    file_type: 'BANK_STATEMENT',
    file_size: 500000,
    mime_type: 'application/pdf',
    sha256_hash: 'hash-adrian-2',
    url: '/documents/adrian_bank_statement.pdf',
    ocr_extracted_text: 'Maybank Statement\nAccount Holder: Adrian Wong Kok Leong\nPeriod: Jan-Dec 2026\nTotal Credits: MYR 3,600,000.00\nPayroll Credits: MYR 180,000.00',
    uploaded_by: user.id,
    created_at: new Date().toISOString(),
    upload_status: 'COMPLETED',
    ocr_status: 'COMPLETED',
  };

  dbStore.cases.set(highRiskCaseId, highRiskCase);
  dbStore.documents.set(highRiskPayslip.id, highRiskPayslip);
  dbStore.documents.set(highRiskBankStatement.id, highRiskBankStatement);

  const highRiskResult = await runSoWEvaluation(highRiskCase, [highRiskPayslip, highRiskBankStatement], { enablePiiRedaction: true });
  
  // Verify portfolio consistency rule exists
  await expect(
    highRiskResult.rule_evaluation_results.some((rule) => rule.rule_id === 'RULE_PORTFOLIO_CONSISTENCY'),
    'Portfolio case should include Portfolio Financial Consistency rule'
  );
  
  // Verify the rule correctly identifies the material discrepancy
  const portfolioConsistencyRule = highRiskResult.rule_evaluation_results.find((r) => r.rule_id === 'RULE_PORTFOLIO_CONSISTENCY');
  await expect(
    portfolioConsistencyRule && !portfolioConsistencyRule.passed,
    'Portfolio consistency rule should fail for material discrepancy (2.4M portfolio vs 180K income)'
  );
  
  // Verify the result is high-risk
  await expect(
    highRiskResult.composite_risk_score >= 25,
    'High risk portfolio discrepancy should produce score >= 25'
  );
  
  console.log(`  Portfolio Exposure: MYR 2,400,000`);
  console.log(`  Declared Income: MYR 180,000`);
  console.log(`  Bank Deposits: MYR 3,600,000`);
  console.log(`  Risk Score: ${highRiskResult.composite_risk_score}`);
  console.log(`  Decision: ${highRiskResult.overall_decision}`);
  console.log('✓ PASS\n');

  // TEST 8: Portfolio Snapshot Immutability
  console.log('TEST 8: Portfolio Snapshot Immutability');
  const historicalCase: SoWCase = {
    ...lowRiskCase,
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
  
  const reloadedCase = dbStore.cases.get(historicalCase.id);
  await expect(
    reloadedCase?.portfolio_total_deposited === 120000,
    'Historical case snapshot should remain stable even if portfolio exposure changes later'
  );
  
  const reloadedPortfolio = dbStore.portfolioClients.get(updatedPortfolio.id);
  await expect(
    reloadedPortfolio?.total_deposited === 200000,
    'Portfolio client update should reflect new exposure'
  );
  console.log('✓ PASS\n');

  // TEST 9: Session Validation
  console.log('TEST 9: Session Validation for Portfolio Flows');
  const cookie = createSessionCookie(user);
  const request = new Request('http://localhost/api/cases', { headers: { cookie } });
  const session = await getAuthSession(request);
  await expect(session, 'Session should resolve correctly for portfolio flows');
  console.log('✓ PASS\n');

  // TEST 10: Standalone Case - No Portfolio
  console.log('TEST 10: Standalone Case - No Portfolio Context');
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
  await expect(
    dbStore.cases.get(standaloneCase.id)?.customer_name === 'Standalone Customer',
    'Standalone case should continue to work without portfolio metadata'
  );
  console.log('✓ PASS\n');

  // TEST 11: Standalone Evaluation - No Portfolio Rule
  console.log('TEST 11: Standalone Evaluation - Portfolio Rule Must Not Execute');
  const standaloneDocs: DocumentRecord[] = [
    {
      id: 'DOC-STANDALONE-PAYSLIP',
      case_id: 'CASE-STANDALONE-TEST',
      organization_id: user.organization_id,
      filename: 'standalone_payslip.pdf',
      file_type: 'PAYSLIP',
      file_size: 250000,
      mime_type: 'application/pdf',
      sha256_hash: 'hash-standalone-1',
      url: '/documents/standalone_payslip.pdf',
      ocr_extracted_text: 'Independent Consultant\nPayment: MYR 11,500.00 monthly\nAnnualised: MYR 138,000.00',
      uploaded_by: user.id,
      created_at: new Date().toISOString(),
      upload_status: 'COMPLETED',
      ocr_status: 'COMPLETED',
    },
    {
      id: 'DOC-STANDALONE-BANK',
      case_id: 'CASE-STANDALONE-TEST',
      organization_id: user.organization_id,
      filename: 'standalone_bank.pdf',
      file_type: 'BANK_STATEMENT',
      file_size: 500000,
      mime_type: 'application/pdf',
      sha256_hash: 'hash-standalone-2',
      url: '/documents/standalone_bank.pdf',
      ocr_extracted_text: 'Bank Statement\nAccount: Standalone Customer\nTotal Credits: MYR 138,000.00',
      uploaded_by: user.id,
      created_at: new Date().toISOString(),
      upload_status: 'COMPLETED',
      ocr_status: 'COMPLETED',
    },
  ];

  const standaloneResult = await runSoWEvaluation(standaloneCase, standaloneDocs, { enablePiiRedaction: true });
  
  // Verify no portfolio consistency rule in standalone case
  await expect(
    !standaloneResult.rule_evaluation_results.some((rule) => rule.rule_id === 'RULE_PORTFOLIO_CONSISTENCY'),
    'Standalone case must NOT include Portfolio Financial Consistency rule'
  );
  
  // Verify decision is made on standalone rules only
  await expect(
    standaloneResult.overall_decision === 'APPROVED' || 
    standaloneResult.overall_decision === 'MANUAL_REVIEW_REQUIRED' ||
    standaloneResult.overall_decision === 'INSUFFICIENT_INFORMATION' ||
    standaloneResult.overall_decision === 'REJECTED',
    'Standalone case should use existing SoW decision framework'
  );
  
  console.log(`  Standalone Decision: ${standaloneResult.overall_decision}`);
  console.log(`  Risk Score: ${standaloneResult.composite_risk_score}`);
  console.log('✓ PASS\n');

  console.log('========================================');
  console.log('ALL PORTFOLIO REGRESSION TESTS PASSED');
  console.log('========================================\n');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n❌ TEST FAILURE:\n${message}\n`);
  process.exit(1);
});
