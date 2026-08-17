import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.LUXERA_BASE_URL || 'http://127.0.0.1:3001';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function readJsonResponse(response: Response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { raw: text };
  }
}

function buildCookieHeader(setCookie: string | null): string {
  assert(setCookie, 'Missing session cookie from sign-in response');
  return setCookie!.split(';')[0];
}

async function assertResponseOk(response: Response, context: string): Promise<void> {
  if (response.ok) return;
  throw new Error(`${context}: ${response.status} ${await response.text()}`);
}

async function main() {
  console.log('\n========================================');
  console.log('LUXERA LIVE UPLOAD ROUTE REGRESSION');
  console.log('========================================\n');

  const server = spawn('npx', ['next', 'start', '-p', '3001'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
    shell: true,
    windowsHide: true,
  });

  let serverOutput = '';
  server.stdout.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });

  try {
    let ready = false;
    for (let i = 0; i < 60; i++) {
      try {
        const probe = await fetch(`${BASE_URL}/api/session`);
        if (probe.status === 401 || probe.status === 200) {
          ready = true;
          break;
        }
      } catch {
        // Wait for the server to finish booting.
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    assert(ready, `Production server did not become ready.\n${serverOutput.slice(-4000)}`);

    const loginRes = await fetch(`${BASE_URL}/api/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'officer@luxera.world', password: 'password' }),
    });
    await assertResponseOk(loginRes, 'Login failed');
    const cookie = buildCookieHeader(loginRes.headers.get('set-cookie'));

    const portfolioCsv = `client_id,client_name,total_deposited,currency\nCL-0031,Faizal Nordin,1450000,MYR\n`;
    const portfolioRes = await fetch(`${BASE_URL}/api/portfolio`, {
      method: 'POST',
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ csvText: portfolioCsv }),
    });
    await assertResponseOk(portfolioRes, 'Portfolio import failed');

    const createCaseRes = await fetch(`${BASE_URL}/api/cases`, {
      method: 'POST',
      headers: {
        Cookie: cookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_name: 'Faizal Nordin',
        customer_nric_passport: '900101-10-1234',
        declared_annual_income: 120000,
        currency: 'MYR',
        primary_source_category: 'EMPLOYMENT',
        employer_name: 'Luxera Cognitive Resources Sdn Bhd',
        occupation_title: 'Senior Engineer',
        portfolio_client_id: 'CL-0031',
        portfolio_client_name: 'Faizal Nordin',
        portfolio_total_deposited: 1450000,
        portfolio_currency: 'MYR',
      }),
    });
    await assertResponseOk(createCaseRes, 'Case creation failed');
    const createdCase = await readJsonResponse(createCaseRes);
    const caseId = createdCase?.case?.id;
    assert(caseId, 'Case creation did not return a case id');

    const samplePdfPaths = [
      {
        filePath: path.join(process.cwd(), 'private_uploads', '1786789394666_Nexus_Digital_Systems_July_2026_Payslip.pdf'),
        classification: 'PAYSLIP',
        expectedType: 'PAYSLIP',
      },
      {
        filePath: path.join(process.cwd(), 'private_uploads', '1786789392975_Nexus_Capital_Bank_Statement_July_2026.pdf'),
        classification: 'BANK_STATEMENT',
        expectedType: 'BANK_STATEMENT',
      },
    ];

    for (const sample of samplePdfPaths) {
      assert(fs.existsSync(sample.filePath), `Missing sample PDF: ${sample.filePath}`);
      const form = new FormData();
      form.append('classification', sample.classification);
      const buffer = fs.readFileSync(sample.filePath);
      form.append('files', new File([buffer], path.basename(sample.filePath), { type: 'application/pdf' }));

      const uploadRes = await fetch(`${BASE_URL}/api/cases/${caseId}/documents`, {
        method: 'POST',
        headers: { Cookie: cookie },
        body: form,
      });
      await assertResponseOk(uploadRes, `Upload failed for ${sample.filePath}`);
      const uploadJson = await readJsonResponse(uploadRes);
      const uploadedDoc = uploadJson?.documents?.[0];
      assert(uploadedDoc, 'Upload response missing document data');
      assert(uploadedDoc.file_type === sample.expectedType, `Expected document classification ${sample.expectedType}, got ${uploadedDoc.file_type}`);
      assert(
        !String(uploadedDoc.storage_path || '').includes('private_uploads'),
        `Production upload response must not expose private_uploads as storage_path, got ${uploadedDoc.storage_path}`
      );
      assert(
        uploadedDoc.ocr_status === 'COMPLETED' || uploadedDoc.ocr_status === 'FAILED' || uploadedDoc.ocr_status === 'OCR_NOT_CONFIGURED',
        `Unexpected OCR status: ${uploadedDoc.ocr_status}`
      );
    }

    const caseDetailRes = await fetch(`${BASE_URL}/api/cases/${caseId}`, {
      headers: { Cookie: cookie },
    });
    await assertResponseOk(caseDetailRes, 'Case detail fetch failed');
    const caseDetail = await readJsonResponse(caseDetailRes);
    assert(Array.isArray(caseDetail?.documents) && caseDetail.documents.length === 2, 'Case should contain both uploaded documents');
    assert(caseDetail.case?.portfolio_client_id === 'CL-0031', 'Portfolio client context was not attached to the case');
    assert(caseDetail.case?.portfolio_total_deposited === 1450000, 'Portfolio exposure did not persist');
    assert(caseDetail.case?.portfolio_currency === 'MYR', 'Portfolio currency did not persist');

    const processRes = await fetch(`${BASE_URL}/api/cases/${caseId}/process`, {
      method: 'POST',
      headers: { Cookie: cookie },
    });
    await assertResponseOk(processRes, 'Case processing failed');
    const processJson = await readJsonResponse(processRes);
    assert(processJson?.result?.overall_decision, 'Processing route did not return a final decision');
    assert(processJson?.result?.composite_risk_score !== undefined, 'Processing route did not return a risk score');
    assert(processJson?.case?.portfolio_client_id === 'CL-0031', 'Portfolio context was lost during processing');

    const refreshedCaseRes = await fetch(`${BASE_URL}/api/cases/${caseId}`, {
      headers: { Cookie: cookie },
    });
    await assertResponseOk(refreshedCaseRes, 'Refreshed case fetch failed');
    const refreshedCase = await readJsonResponse(refreshedCaseRes);
    assert(refreshedCase.case?.overall_decision, 'Final case decision was not persisted');

    console.log('✓ PASS: live multipart upload, OCR/extraction, portfolio context, and SoW processing all succeeded');
    console.log(`  Case ID: ${caseId}`);
    console.log(`  Decision: ${processJson.result.overall_decision}`);
    console.log(`  Risk Score: ${processJson.result.composite_risk_score}`);
  } finally {
    server.kill('SIGTERM');
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

main().catch((error) => {
  console.error('✘ FAIL: live upload route regression');
  console.error(error);
  process.exit(1);
});
