import { dbStore } from '../lib/db/store';
import fs from 'fs';
import path from 'path';

async function testIsolation() {
  console.log('========================================================');
  console.log('LUXERA PROVENANCE — PERSISTENCE & REQUEST ISOLATION TEST');
  console.log('========================================================');

  // Clean up previous runs if any
  const dbFile = path.join(process.cwd(), 'luxera_db.json');
  if (fs.existsSync(dbFile)) {
    fs.unlinkSync(dbFile);
    console.log('Deleted old database file.');
  }

  // 1. Initial State (Seeds)
  console.log('\n[STAGE 1] Testing Initial State & Seeds...');
  dbStore.loadState();
  const casesCountBefore = dbStore.cases.size;
  console.log(`Initialized database store. Total cases seeded: ${casesCountBefore}`);
  if (!dbStore.cases.has('CASE-2026-001')) {
    throw new Error('Seed CASE-2026-001 is missing!');
  }
  console.log('✔ Initial state seed check passed.');

  // 2. Request A: Create Case
  console.log('\n[STAGE 2] Request A: Creating Case-2026-002...');
  const newCaseId = 'CASE-2026-002';
  dbStore.cases.set(newCaseId, {
    id: newCaseId,
    case_number: 'LX-SOW-2026-9999',
    organization_id: 'ORG-WAHED-01',
    customer_name: 'Faisal Kamal Audit',
    customer_nric_passport: '900812-14-5500',
    declared_annual_income: 120000,
    currency: 'MYR',
    primary_source_category: 'EMPLOYMENT',
    employer_name: 'Luxera Cognitive Resources Sdn Bhd',
    occupation_title: 'Senior Engineer',
    status: 'QUEUED',
    created_by_user_id: 'USR-OFFICER-01',
    assigned_officer_id: 'USR-OFFICER-01',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  console.log(`Created case: ${newCaseId} successfully.`);

  // 3. Request B: Simulating a separate server worker process
  console.log('\n[STAGE 3] Request B: Simulating a separate HTTP process lookup...');
  // Force delete cached require to get a completely fresh Store module instance
  const freshStoreModule = (await import('../lib/db/store?nocache=' + Date.now())) as any;
  const freshDbStore = freshStoreModule.dbStore;

  const retrievedCase = freshDbStore.cases.get(newCaseId);
  if (!retrievedCase) {
    throw new Error(`FAIL: Case ${newCaseId} could not be retrieved by the separate process!`);
  }
  console.log(`✔ SUCCESS: Separate process successfully retrieved case: ${newCaseId}`);
  console.log(`  Customer Name: ${retrievedCase.customer_name}`);
  console.log(`  Employer: ${retrievedCase.employer_name}`);

  // 4. Request C: Simulate document upload in another worker
  console.log('\n[STAGE 4] Request C: Uploading & linking document in another worker...');
  const docId = 'DOC-9999-PAYSLIP';
  freshDbStore.documents.set(docId, {
    id: docId,
    case_id: newCaseId,
    organization_id: 'ORG-WAHED-01',
    filename: 'payslip_faisal.pdf',
    file_type: 'PAYSLIP',
    file_size: 10240,
    mime_type: 'application/pdf',
    sha256_hash: 'abcdef1234567890',
    url: '/uploads/payslip_faisal.pdf',
    ocr_extracted_text: 'Luxera Cognitive Resources Sdn Bhd\nBasic Salary: MYR 10,000.00\nEmployee: Faisal Kamal',
    pii_redacted_text: 'Luxera Cognitive Resources Sdn Bhd\nBasic Salary: MYR 10,000.00\nEmployee: Faisal Kamal',
    upload_status: 'COMPLETED',
    ocr_status: 'COMPLETED',
    uploaded_by: 'USR-OFFICER-01',
    created_at: new Date().toISOString(),
  });
  console.log(`Linked document ${docId} to case ${newCaseId} in freshDbStore.`);

  // 5. Request D: Verify persistence across third process
  console.log('\n[STAGE 5] Request D: Verifying persistence across third process...');
  const finalStoreModule = (await import('../lib/db/store?nocache_final=' + Date.now())) as any;
  const finalDbStore = finalStoreModule.dbStore;

  const finalCase = finalDbStore.cases.get(newCaseId);
  const associatedDocs = Array.from(finalDbStore.documents.values()).filter((d: any) => d.case_id === newCaseId) as any[];

  if (!finalCase) {
    throw new Error('FAIL: Case disappeared on third process lookup!');
  }
  if (associatedDocs.length !== 1 || associatedDocs[0].id !== docId) {
    throw new Error('FAIL: Associated documents were not persisted or linked!');
  }
  console.log('✔ SUCCESS: Document successfully persisted and linked across worker lifecycles!');
  console.log(`  Persisted Document: ${associatedDocs[0].filename} (Size: ${associatedDocs[0].file_size} bytes)`);

  console.log('\n========================================================');
  console.log('      ALL REQUEST ISOLATION TESTS PASSED PERFECTLY!');
  console.log('========================================================');
}

testIsolation().catch(err => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
