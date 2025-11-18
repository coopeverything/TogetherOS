/**
 * PostgreSQL Proposal Rating Repository
 * Production implementation using @togetheros/db package
 */

import { ProposalRating } from '../entities/ProposalRating';
import type { IProposalRatingRepo } from './ProposalRatingRepo';
import type { ClarityRating, ConstructivenessRating } from '@togetheros/types/governance';
import {
  submitRating as submitRatingDb,
  getRating as getRatingDb,
  getProposalRatings,
} from '@togetheros/db';
import { query } from '@togetheros/db';

/**
 * PostgreSQL-backed proposal rating repository
 */
export class PostgresProposalRatingRepo implements IProposalRatingRepo {
  async submitRating(
    proposalId: string,
    memberId: string,
    clarity: ClarityRating,
    importance: number,
    urgency: number,
    isInnovative: boolean,
    constructiveness: ConstructivenessRating,
    feedback?: string
  ): Promise<ProposalRating> {
    const ratingData = await submitRatingDb(
      proposalId,
      memberId,
      clarity,
      importance,
      urgency,
      isInnovative,
      constructiveness,
      feedback
    );
    return new ProposalRating(ratingData);
  }

  async getRating(proposalId: string, memberId: string): Promise<ProposalRating | null> {
    const ratingData = await getRatingDb(proposalId, memberId);
    return ratingData ? new ProposalRating(ratingData) : null;
  }

  async getRatingsByProposal(proposalId: string): Promise<ProposalRating[]> {
    const ratingsData = await getProposalRatings(proposalId);
    return ratingsData.map((rating) => new ProposalRating(rating));
  }

  async deleteRating(proposalId: string, memberId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM proposal_ratings WHERE proposal_id = $1 AND member_id = $2',
      [proposalId, memberId]
    );

    return (result.rowCount || 0) > 0;
  }
}

// Singleton instance
export const proposalRatingRepo = new PostgresProposalRatingRepo();
