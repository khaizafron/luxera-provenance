import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { getAuthSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const caseId = searchParams.get('case_id');

  if (!caseId) {
    return NextResponse.json({ error: 'case_id parameter is required for DSAR export' }, { status: 400 });
  }

  const sowCase = dbStore.cases.get(caseId);
  if (!sowCase) {
    return NextResponse.json({ error: 'Case not found' }, { status: 404 });
  }

  if (sowCase.organization_id !== session.organization.id) {
    console.warn(`[SECURITY ALERT] Cross-organization DSAR export attempt blocked.`, {
      user_id: session.user.id,
      user_org: session.organization.id,
      case_id: caseId,
      case_org: sowCase.organization_id,
    });
    return NextResponse.json({ error: 'Access denied: Tenant isolation is active.' }, { status: 403 });
  }

  const docs = Array.from(dbStore.documents.values()).filter((d) => d.case_id === caseId);
  const audit = dbStore.auditBlocks.filter((b) => b.case_id === caseId);
  const consent = Array.from(dbStore.consents.values()).find((c) => c.case_id === caseId);

  return NextResponse.json({
    dsar_export_metadata: {
      generated_at: new Date().toISOString(),
      governing_statute: 'Personal Data Protection Act 2010 (Act 709) Section 12',
      data_controller: 'Luxera Cognitive Resources',
      data_processor: 'Luxera Provenance Platform',
    },
    data_subject: {
      name: sowCase.customer_name,
      identifier: sowCase.customer_nric_passport,
    },
    case_summary: sowCase,
    supporting_documents: docs.map((d) => ({
      id: d.id,
      filename: d.filename,
      type: d.file_type,
      sha256_checksum: d.sha256_hash,
      pii_redacted_text: d.pii_redacted_text,
    })),
    consent_record: consent,
    audit_trail: audit,
  });
}
