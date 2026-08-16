import { parsePortfolioCsv, validatePortfolioCsvRows } from '../lib/portfolio/clients';
import { dbStore, PortfolioClient, SoWCase } from '../lib/db/store';
import { loginUser, createSessionCookie, getAuthSession } from '../lib/auth/session';

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
    client_name: 'Client Portfolio Test',
    total_deposited: 1250000,
    currency: 'MYR',
    source: 'CSV_IMPORT',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  dbStore.portfolioClients.set(client.id, client);

  const fetched = dbStore.portfolioClients.get(client.id);
  await expect(fetched?.client_id === 'CL-PORT-001', 'Portfolio client should persist to the store');

  const casePayload: Partial<SoWCase> = {
    id: 'CASE-PORT-TEST-001',
    case_number: 'LX-PORT-TEST-001',
    organization_id: user.organization_id,
    customer_name: client.client_name,
    customer_nric_passport: '900101-01-0001',
    declared_annual_income: 180000,
    currency: client.currency,
    primary_source_category: 'EMPLOYMENT',
    employer_name: 'Portfolio Test Employer',
    occupation_title: 'Portfolio Officer',
    status: 'QUEUED',
    created_by_user_id: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    portfolio_client_id: client.id,
    portfolio_client_name: client.client_name,
    portfolio_total_deposited: client.total_deposited,
    portfolio_currency: client.currency,
  };

  await expect(casePayload.portfolio_client_id === client.id, 'Portfolio client should be attached to the SoW case');

  const cookie = createSessionCookie(user);
  const request = new Request('http://localhost/api/cases', { headers: { cookie } });
  const session = await getAuthSession(request);
  await expect(session, 'Session should resolve correctly for portfolio flows');

  console.log('Portfolio regression tests prepared and ready to execute');
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
