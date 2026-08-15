import { createHash } from 'crypto';

export interface AuditBlock {
  sequence_id: number;
  case_id: string;
  organization_id: string;
  event_type: string;
  actor_id: string;
  actor_email: string;
  previous_block_hash: string;
  payload_hash: string;
  payload: Record<string, unknown>;
  timestamp: string;
  block_hash: string;
}

/**
 * Calculates SHA-256 hash of a block payload combined with previous hash
 */
export function calculateBlockHash(
  sequenceId: number,
  previousHash: string,
  caseId: string,
  eventType: string,
  actorId: string,
  timestamp: string,
  payloadHash: string
): string {
  const data = `${sequenceId}|${previousHash}|${caseId}|${eventType}|${actorId}|${timestamp}|${payloadHash}`;
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Calculates payload SHA-256 hash
 */
export function calculatePayloadHash(payload: unknown): string {
  const jsonString = JSON.stringify(payload || {});
  return createHash('sha256').update(jsonString).digest('hex');
}

/**
 * Verifies the mathematical integrity of a sequence of audit blocks
 */
export function verifyAuditChainIntegrity(blocks: AuditBlock[]): {
  isValid: boolean;
  brokenIndex: number | null;
  message: string;
} {
  if (!blocks || blocks.length === 0) {
    return { isValid: true, brokenIndex: null, message: 'Audit chain is empty.' };
  }

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const expectedPrevHash = i === 0 ? 'GENESIS_BLOCK_HASH_0000000000000000000000000000000000000000' : blocks[i - 1].block_hash;

    if (block.previous_block_hash !== expectedPrevHash) {
      return {
        isValid: false,
        brokenIndex: i,
        message: `Broken sequence link at block #${block.sequence_id}: previous hash mismatch.`,
      };
    }

    const recomputedPayloadHash = calculatePayloadHash(block.payload);
    if (block.payload_hash !== recomputedPayloadHash) {
      return {
        isValid: false,
        brokenIndex: i,
        message: `Tampered payload detected at block #${block.sequence_id}: payload hash mismatch.`,
      };
    }

    const recomputedBlockHash = calculateBlockHash(
      block.sequence_id,
      block.previous_block_hash,
      block.case_id,
      block.event_type,
      block.actor_id,
      block.timestamp,
      block.payload_hash
    );

    if (block.block_hash !== recomputedBlockHash) {
      return {
        isValid: false,
        brokenIndex: i,
        message: `Signature mismatch at block #${block.sequence_id}: calculated hash does not match block_hash.`,
      };
    }
  }

  return { isValid: true, brokenIndex: null, message: `All ${blocks.length} audit blocks verified successfully.` };
}
