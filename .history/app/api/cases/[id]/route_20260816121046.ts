import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { getAuthSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const session = await getAuthSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
  }

  dbStore.syncFromDisk(true);
  const sowCase = dbStore.cases.get(id);

  if (!sowCase) {
    console.error(`[CRITICAL DIAGNOSTIC] Case retrieval failed at Detail View stage.`, {
      requested_case_id: id,
      endpoint: `/api/cases/${id}`,
      request_stage: 'CASE_DETAIL_LOOKUP',
      persistence_lookup_result: 'NOT_FOUND_IN_STORE',
      total_cases_in_store: dbStore.cases.size,
    });
    return NextResponse.json({ error: `Case '${id}' not found in active database.` }, { status: 404 });
  }

  // Enforce Tenant Isolation
  if (sowCase.organization_id !== session.organization.id) {
    console.warn(`[SECURITY ALERT] Cross-organization case access attempt blocked.`, {
      user_id: session.user.id,
      user_org: session.organization.id,
      case_id: id,
      case_org: sowCase.organization_id,
    });
    return NextResponse.json({ error: 'Access denied: Tenant isolation is active.' }, { status: 403 });
  }

  // Get associated documents
  const documents = Array.from(dbStore.documents.values()).filter((d) => d.case_id === id);

  // Get processing jobs
  const jobs = Array.from(dbStore.jobs.values()).filter((j) => j.case_id === id);

  // Get audit trail blocks
  const auditBlocks = dbStore.auditBlocks.filter((b) => b.case_id === id);

  // Get consent record
  const consent = Array.from(dbStore.consents.values()).find((c) => c.case_id === id);

  return NextResponse.json(
    {
      case: sowCase,
      documents,
      jobs,
      auditBlocks,
      consent,
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}
