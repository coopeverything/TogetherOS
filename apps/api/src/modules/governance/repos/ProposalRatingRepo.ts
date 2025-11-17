/**
 * Proposal Rating Repository Interface
 * Data access contract for proposal ratings
 */

import type { ProposalRating } from '../entities/ProposalRating'
import type { ClarityRating, ConstructivenessRating } from '@togetheros/types/governance'

export interface IProposalRatingRepo {
  /**
   * Submit or update a rating
   * If member already rated, update their rating; otherwise create new
   */
  submitRating(
    proposalId: string,
    memberId: string,
    clarity: ClarityRating,
    importance: number,
    urgency: number,
    isInnovative: boolean,
    constructiveness: ConstructivenessRating,
    feedback?: string
  ): Promise<ProposalRating>

  /**
   * Get a member's rating for a proposal
   */
  getRating(proposalId: string, memberId: string): Promise<ProposalRating | null>

  /**
   * Get all ratings for a proposal
   */
  getRatingsByProposal(proposalId: string): Promise<ProposalRating[]>

  /**
   * Delete a rating
   */
  deleteRating(proposalId: string, memberId: string): Promise<boolean>
}
