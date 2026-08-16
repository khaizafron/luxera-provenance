import { NextRequest, NextResponse } from 'next/server';
import { dbStore, PortfolioClient } from '@/lib/db/store';
import { getAuthSession } from '@/lib/auth/session';
import { parsePortfolioCsv, validatePortfolioCsvRows } from '@/lib/portfolio/clients';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function buildClientStatus(client: PortfolioClient) {
  const matchingCases = Array.from(dbStore.cases.values()).filter(
    (caseItem) => caseItem.organization_id === client.organization_id && caseItem.portfolio_client_id === client.id
  );

  const latest = matchingCases.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
  if (!latest) {
    return 'NO_CASE';
  }

  return latest.overall_decision || latest.status || 'NO_CASE';
}

export async function GET() {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
  }

  dbStore.syncFromDisk(true);
  const clients = dbStore
    .getOrganizationPortfolioClients(session.organization.id)
    .sort((a, b) => a.client_name.localeCompare(b.client_name));

  return NextResponse.json({
    clients: clients.map((client) => ({
      ...client,
      current_status: buildClientStatus(client),
    })),
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
    }

    const body = await req.json();
    const csvText = typeof body?.csvText === 'string' ? body.csvText : '';
    if (!csvText || !csvText.trim()) {
      return NextResponse.json({ error: 'CSV content is required for portfolio import.' }, { status: 400 });
    }

    const parsed = parsePortfolioCsv(csvText);
    if (parsed.errors.length > 0 && parsed.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid CSV content.', validation: parsed, status: 'rejected' }, { status: 400 });
    }

    const validation = validatePortfolioCsvRows(parsed.rows, parsed.headers);
    if (validation.valid.length === 0 && validation.rejected.length > 0) {
      return NextResponse.json({
        error: 'Portfolio CSV contains invalid records and requires correction before import.',
        validation,
        status: 'rejected',
      }, { status: 400 });
    }

    const created: string[] = [];
    const updated: string[] = [];
    const rejected: Array<{ client_id: string; message: string }> = [];
    const importedClients: PortfolioClient[] = [];
    const now = new Date().toISOString();

    for (const row of validation.valid) {
      const existing = dbStore.getPortfolioClient(session.organization.id, row.client_id);
      const payload: PortfolioClient = {
        id: existing?.id ?? `PORT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        organization_id: session.organization.id,
        client_id: row.client_id,
        client_name: row.client_name,
        total_deposited: row.total_deposited,
        currency: row.currency,
        source: 'CSV_IMPORT',
        created_at: existing?.created_at ?? now,
        updated_at: now,
        last_case_id: existing?.last_case_id,
        last_case_status: existing?.last_case_status ?? 'NO_CASE',
      };

      dbStore.portfolioClients.set(payload.id, payload);
      importedClients.push(payload);

      if (existing) {
        updated.push(payload.client_id);
      } else {
        created.push(payload.client_id);
      }

      dbStore.addAuditBlock(
        payload.id,
        session.organization.id,
        existing ? 'CLIENT_UPDATED' : 'CLIENT_CREATED',
        session.user.id,
        session.user.email,
        {
          client_id: payload.client_id,
          client_name: payload.client_name,
          total_deposited: payload.total_deposited,
          currency: payload.currency,
        }
      );
    }

    for (const issue of validation.rejected) {
      if (!issue.row?.client_id) continue;
      rejected.push({ client_id: String(issue.row.client_id), message: issue.message });
    }

    dbStore.addAuditBlock(
      'PORTFOLIO_IMPORT',
      session.organization.id,
      'PORTFOLIO_IMPORT',
      session.user.id,
      session.user.email,
      {
        batch_summary: {
          created: created.length,
          updated: updated.length,
          rejected: rejected.length,
        },
        imported_client_ids: importedClients.map((client) => client.client_id),
      }
    );

    return NextResponse.json({
      created,
      updated,
      rejected,
      clients: importedClients,
      validation,
    }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
