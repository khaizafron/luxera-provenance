import { NextRequest, NextResponse } from 'next/server';
import { dbStore, SoWCase } from '@/lib/db/store';
import { getAuthSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
  }

  dbStore.syncFromDisk(true);
  const cases = Array.from(dbStore.cases.values()).filter(
    (c) => c.organization_id === session.organization.id
  );
  
  return NextResponse.json(
    { cases },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      customer_name,
      customer_nric_passport,
      declared_annual_income,
      currency = 'MYR',
      primary_source_category = 'EMPLOYMENT',
      employer_name,
      occupation_title,
    } = body;

    if (!customer_name || !customer_nric_passport || !declared_annual_income || !employer_name) {
      return NextResponse.json({ error: 'Missing required customer case fields.' }, { status: 400 });
    }

    dbStore.syncFromDisk(true);

    // Monotonically find highest sequence number to guarantee absolute zero collision and prevent accidental overwrites
    let maxSeq = 0;
    for (const [id] of dbStore.cases.entries()) {
      const match = id.match(/^CASE-2026-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxSeq) maxSeq = num;
      }
    }
    let nextSeq = Math.max(maxSeq + 1, dbStore.cases.size + 1);
    let caseId = `CASE-2026-${String(nextSeq).padStart(3, '0')}`;
    while (dbStore.cases.has(caseId)) {
      nextSeq++;
      caseId = `CASE-2026-${String(nextSeq).padStart(3, '0')}`;
    }

    const caseNumber = `LX-SOW-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCase: SoWCase = {
      id: caseId,
      case_number: caseNumber,
      organization_id: session.organization.id,
      customer_name,
      customer_nric_passport,
      declared_annual_income: Number(declared_annual_income),
      currency,
      primary_source_category,
      employer_name,
      occupation_title: occupation_title || 'General Professional',
      status: 'QUEUED',
      created_by_user_id: session.user.id,
      assigned_officer_id: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbStore.cases.set(newCase.id, newCase);

    // Record Digital Consent Receipt (PDPA Act 709 Sec 6)
    const consentId = `CNS-${Date.now()}`;
    dbStore.consents.set(consentId, {
      id: consentId,
      organization_id: session.organization.id,
      user_id: session.user.id,
      case_id: newCase.id,
      purpose: 'Source of Wealth (SoW) & AML/CFT Compliance Verification',
      policy_version: 'PDPA-2010-v2.4',
      status: 'GRANTED',
      ip_address: req.headers.get('x-forwarded-for') || '127.0.0.1',
      user_agent: req.headers.get('user-agent') || 'Luxera Gateway',
      created_at: new Date().toISOString(),
    });

    // Add Audit Block
    dbStore.addAuditBlock(
      newCase.id,
      session.organization.id,
      'CASE_CREATED',
      session.user.id,
      session.user.email,
      {
        case_number: newCase.case_number,
        customer_name: newCase.customer_name,
        declared_income: newCase.declared_annual_income,
        currency: newCase.currency,
      }
    );

    return NextResponse.json(
      { case: newCase },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
