import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { getAuthSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const session = await getAuthSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
  }

  dbStore.syncFromDisk(true);
  const client = Array.from(dbStore.portfolioClients.values()).find(
    (record) => record.organization_id === session.organization.id && record.client_id === clientId
  );

  if (!client) {
    return NextResponse.json({ error: 'Client not found.' }, { status: 404 });
  }

  const cases = Array.from(dbStore.cases.values()).filter(
    (caseItem) => caseItem.organization_id === session.organization.id && caseItem.portfolio_client_id === client.id
  );

  return NextResponse.json({ client, cases });
}
