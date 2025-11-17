/**
 * In-Memory Bridge Rating Repository
 * MVP implementation for Bridge AI ratings
 */

import type { BridgeProposalRating } from '@togetheros/types/governance'
import type { IBridgeRatingRepo } from './BridgeRatingRepo'

export class InMemoryBridgeRatingRepo implements IBridgeRatingRepo {
  private ratings: Map<string, BridgeProposalRating> = new Map()

  async save(rating: BridgeProposalRating): Promise<BridgeProposalRating> {
    // Use proposalId as key (one rating per proposal)
    this.ratings.set(rating.proposalId, rating)
    return rating
  }

  async getByProposalId(proposalId: string): Promise<BridgeProposalRating | null> {
    return this.ratings.get(proposalId) || null
  }

  async getFlaggedProposals(): Promise<BridgeProposalRating[]> {
    return Array.from(this.ratings.values()).filter((r) => r.flaggedForReview)
  }

  async delete(id: string): Promise<boolean> {
    // Find rating by ID
    for (const [proposalId, rating] of this.ratings.entries()) {
      if (rating.id === id) {
        this.ratings.delete(proposalId)
        return true
      }
    }
    return false
  }
}

// Singleton instance
export const bridgeRatingRepo = new InMemoryBridgeRatingRepo()
