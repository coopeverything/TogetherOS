/**
 * Proposal Votes database operations
 * Handles voting on proposals (consent-based decision making)
 */

import { query } from './index';
import type { Vote, VoteType, VoteTally } from '@togetheros/types/governance';

/**
 * Database row type (snake_case from database)
 */
interface VoteRow {
  id: string;
  proposal_id: string;
  member_id: string;
  vote_type: VoteType;
  reasoning?: string;
  voted_at: Date;
  updated_at: Date;
}

/**
 * Convert database row to domain entity (snake_case → camelCase)
 */
function toVote(row: VoteRow): Vote {
  return {
    id: row.id,
    proposalId: row.proposal_id,
    memberId: row.member_id,
    voteType: row.vote_type,
    reasoning: row.reasoning,
    votedAt: row.voted_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Cast or update a vote
 */
export async function castVote(
  proposalId: string,
  memberId: string,
  voteType: VoteType,
  reasoning?: string
): Promise<Vote> {
  const result = await query<VoteRow>(
    `INSERT INTO proposal_votes (proposal_id, member_id, vote_type, reasoning)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (proposal_id, member_id)
     DO UPDATE SET
       vote_type = EXCLUDED.vote_type,
       reasoning = EXCLUDED.reasoning,
       updated_at = NOW()
     RETURNING *`,
    [proposalId, memberId, voteType, reasoning]
  );

  return toVote(result.rows[0]);
}

/**
 * Get a member's vote on a proposal
 */
export async function getVote(proposalId: string, memberId: string): Promise<Vote | null> {
  const result = await query<VoteRow>(
    'SELECT * FROM proposal_votes WHERE proposal_id = $1 AND member_id = $2',
    [proposalId, memberId]
  );

  return result.rows[0] ? toVote(result.rows[0]) : null;
}

/**
 * Get vote tally for a proposal
 */
export async function getVoteTally(proposalId: string): Promise<VoteTally> {
  const result = await query<{ vote_type: VoteType; count: string }>(
    `SELECT vote_type, COUNT(*) as count
     FROM proposal_votes
     WHERE proposal_id = $1
     GROUP BY vote_type`,
    [proposalId]
  );

  const counts: Record<VoteType, number> = {
    consent: 0,
    concern: 0,
    abstain: 0,
    block: 0,
  };

  result.rows.forEach((row) => {
    counts[row.vote_type] = parseInt(row.count, 10);
  });

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const hasBlocks = counts.block > 0;

  // Simple threshold: >50% consent and no blocks
  const thresholdMet = total > 0 && counts.consent > total / 2 && !hasBlocks;

  return {
    total,
    consent: counts.consent,
    concern: counts.concern,
    abstain: counts.abstain,
    block: counts.block,
    thresholdMet,
    hasBlocks,
  };
}
