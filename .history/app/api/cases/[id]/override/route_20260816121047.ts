import { NextRequest, NextResponse } from 'next/server';
import { dbStore, SoWCase } from '@/lib/db/store';
import { getAuthSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession(req);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    dbStore.syncFromDisk(true);
    const sowCase = dbStore.cases.get(id);
    if (!sowCase) return NextResponse.json({ error: 'Case not found' }, { status: 404 });

    // Enforce Tenant Isolation
    if (sowCase.organization_id !== session.organization.id) {
      console.warn(`[SECURITY ALERT] Cross-organization override attempt blocked.`, {
        user_id: session.user.id,
        user_org: session.organization.id,
        case_id: id,
        case_org: sowCase.organization_id,
      });
      return NextResponse.json({ error: 'Access denied: Tenant isolation is active.' }, { status: 403 });
    }

    const body = await req.json();
    const { decision_override, override_reason } = body;

    if (!decision_override || !['APPROVED', 'REJECTED'].includes(decision_override)) {
      return NextResponse.json({ error: 'Valid decision_override (APPROVED or REJECTED) is required.' }, { status: 400 });
    }

    if (!override_reason || override_reason.trim().length < 10) {
      return NextResponse.json({ error: 'Mandatory override_reason with minimum 10 characters required for audit trail.' }, { status: 400 });
    }

    const previousDecision = sowCase.overall_decision;
    const automatedDecision = sowCase.automated_decision || previousDecision;
    const updatedCase: SoWCase = {
      ...sowCase,
      overall_decision: decision_override,
      status: decision_override,
      automated_decision: automatedDecision,
      override_reason,
      assigned_officer_id: session.user.id,
      updated_at: new Date().toISOString(),
    };
    
    // Explicitly write updated case back to Map to trigger persistence
    dbStore.cases.set(updatedCase.id, updatedCase);

    // Create Audit Block for Human Override
    const auditBlock = dbStore.addAuditBlock(
      updatedCase.id,
      updatedCase.organization_id,
      'COMPLIANCE_OFFICER_OVERRIDE',
      session.user.id,
      session.user.email,
      {
        previous_decision: previousDecision,
        new_decision: decision_override,
        override_reason,
        officer_name: session.user.full_name,
      }
    );

    return NextResponse.json(
      {
        case: updatedCase,
        auditBlock,
      },
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
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
