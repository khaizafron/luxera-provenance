import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db/store';
import { verifyAuditChainIntegrity } from '@/lib/audit/hash-chain';
import { getAuthSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized session' }, { status: 401 });
  }

  const allBlocks = dbStore.auditBlocks;
  // Verify the entire chain's mathematical integrity globally first
  const verification = verifyAuditChainIntegrity(allBlocks);

  // Filter so we only expose blocks belonging to the active organization
  const orgBlocks = allBlocks.filter((b) => b.organization_id === session.organization.id);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    total_blocks: orgBlocks.length,
    verification_result: {
      isValid: verification.isValid,
      message: verification.message,
    },
    blocks: orgBlocks.map((b) => ({
      seq: b.sequence_id,
      case_id: b.case_id,
      event_type: b.event_type,
      actor_email: b.actor_email,
      timestamp: b.timestamp,
      prev_hash: b.previous_block_hash.substring(0, 16) + '...',
      block_hash: b.block_hash.substring(0, 16) + '...',
    })),
  });
}
