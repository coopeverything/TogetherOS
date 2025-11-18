/**
 * PostgreSQL Vote Repository
 * Production implementation using @togetheros/db package
 */

import { Vote } from '../entities/Vote';
import type { IVoteRepo } from './VoteRepo';
import type { VoteType } from '@togetheros/types/governance';
import { castVote as castVoteDb, getVote as getVoteDb } from '@togetheros/db';
import { query } from '@togetheros/db';

/**
 * PostgreSQL-backed vote repository
 */
export class PostgresVoteRepo implements IVoteRepo {
  async castVote(
    proposalId: string,
    memberId: string,
    voteType: VoteType,
    reasoning?: string
  ): Promise<Vote> {
    const voteData = await castVoteDb(proposalId, memberId, voteType, reasoning);
    return new Vote(voteData);
  }

  async getVote(proposalId: string, memberId: string): Promise<Vote | null> {
    const voteData = await getVoteDb(proposalId, memberId);
    return voteData ? new Vote(voteData) : null;
  }

  async getVotesByProposal(proposalId: string): Promise<Vote[]> {
    const result = await query<{
      id: string;
      proposal_id: string;
      member_id: string;
      vote_type: VoteType;
      reasoning?: string;
      voted_at: Date;
      updated_at: Date;
    }>('SELECT * FROM proposal_votes WHERE proposal_id = $1', [proposalId]);

    return result.rows.map(
      (row) =>
        new Vote({
          id: row.id,
          proposalId: row.proposal_id,
          memberId: row.member_id,
          voteType: row.vote_type,
          reasoning: row.reasoning,
          votedAt: row.voted_at,
          updatedAt: row.updated_at,
        })
    );
  }

  async deleteVote(proposalId: string, memberId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM proposal_votes WHERE proposal_id = $1 AND member_id = $2',
      [proposalId, memberId]
    );

    return (result.rowCount || 0) > 0;
  }

  async countVotesByType(proposalId: string): Promise<{ [key in VoteType]: number }> {
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

    return counts;
  }
}

// Singleton instance
export const voteRepo = new PostgresVoteRepo();
