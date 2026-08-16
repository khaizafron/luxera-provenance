import { NextRequest, NextResponse } from 'next/server';
import { dbStore, SoWCase } from '@/lib/db/store';
import { runSoWEvaluation } from '@/lib/compliance/sow-engine';
import { getAuthSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let sowCase: SoWCase | undefined = undefined;
  try {
    const { id } = await params;
    
    const session = await getAuthSession(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    dbStore.syncFromDisk(true);
    sowCase = dbStore.cases.get(id);

    if (!sowCase) {
      console.error(`[CRITICAL DIAGNOSTIC] Case retrieval failed at Processing stage.`, {
        requested_case_id: id,
        endpoint: `/api/cases/${id}/process`,
        request_stage: 'CASE_PROCESSING_LOOKUP',
        persistence_lookup_result: 'NOT_FOUND_IN_STORE',
        total_cases_in_store: dbStore.cases.size,
      });
      return NextResponse.json({ error: `Case '${id}' not found in active database.` }, { status: 404 });
    }

    if (sowCase.organization_id !== session.organization.id) {
      console.warn(`[SECURITY ALERT] Cross-organization case processing attempt blocked.`, {
        user_id: session.user.id,
        user_org: session.organization.id,
        case_id: id,
        case_org: sowCase.organization_id,
      });
      return NextResponse.json({ error: 'Access denied: Tenant isolation is active.' }, { status: 403 });
    }

    const docs = Array.from(dbStore.documents.values()).filter((d) => d.case_id === id);

    // Update case status to processing and persist it
    const processingCase: SoWCase = {
      ...sowCase,
      status: 'PROCESSING',
      updated_at: new Date().toISOString(),
    };
    dbStore.cases.set(id, processingCase);

    // Run real SoW Evaluation Engine
    const result = await runSoWEvaluation(processingCase, docs, {
      enablePiiRedaction: true,
    });

    dbStore.syncFromDisk(true);
    const activeCase = dbStore.cases.get(id) || processingCase;

    return NextResponse.json(
      { result, case: activeCase },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (sowCase) {
      const activeCase = dbStore.cases.get(sowCase.id) || sowCase;
      const failedCase: SoWCase = {
        ...activeCase,
        status: 'FAILED',
        updated_at: new Date().toISOString(),
      };
      dbStore.cases.set(failedCase.id, failedCase);
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
