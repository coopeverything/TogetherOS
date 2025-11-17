/**
 * Bridge Rating Repository Interface
 * Stores Bridge AI auto-ratings for proposals
 */

import type { BridgeProposalRating } from '@togetheros/types/governance'

export interface IBridgeRatingRepo {
  /**
   * Save a Bridge AI rating
   */
  save(rating: BridgeProposalRating): Promise<BridgeProposalRating>

  /**
   * Get Bridge rating for a proposal
   */
  getByProposalId(proposalId: string): Promise<BridgeProposalRating | null>

  /**
   * Get all flagged proposals needing moderation review
   */
  getFlaggedProposals(): Promise<BridgeProposalRating[]>

  /**
   * Delete Bridge rating
   */
  delete(id: string): Promise<boolean>
}
