/**
 * In-Memory Proposal Rating Repository
 * Fixture implementation for development and testing
 */

import { ProposalRating } from '../entities/ProposalRating'
import type { IProposalRatingRepo } from './ProposalRatingRepo'
import type { ClarityRating, ConstructivenessRating } from '@togetheros/types/governance'

export class InMemoryProposalRatingRepo implements IProposalRatingRepo {
  private ratings: Map<string, ProposalRating> = new Map()

  /**
   * Generate a composite key for member rating
   */
  private getRatingKey(proposalId: string, memberId: string): string {
    return `${proposalId}:${memberId}`
  }

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
    const key = this.getRatingKey(proposalId, memberId)
    const existing = this.ratings.get(key)

    if (existing) {
      // Update existing rating
      existing.updateRating(
        clarity,
        importance,
        urgency,
        isInnovative,
        constructiveness,
        feedback
      )
      return existing
    }

    // Create new rating
    const rating = new ProposalRating({
      proposalId,
      memberId,
      clarity,
      importance,
      urgency,
      isInnovative,
      constructiveness,
      feedback,
    })

    this.ratings.set(key, rating)
    return rating
  }

  async getRating(proposalId: string, memberId: string): Promise<ProposalRating | null> {
    const key = this.getRatingKey(proposalId, memberId)
    return this.ratings.get(key) || null
  }

  async getRatingsByProposal(proposalId: string): Promise<ProposalRating[]> {
    return Array.from(this.ratings.values()).filter(
      (rating) => rating.proposalId === proposalId
    )
  }

  async deleteRating(proposalId: string, memberId: string): Promise<boolean> {
    const key = this.getRatingKey(proposalId, memberId)
    return this.ratings.delete(key)
  }

  /**
   * Clear all ratings (for testing)
   */
  clear(): void {
    this.ratings.clear()
  }
}

// Singleton instance
export const proposalRatingRepo = new InMemoryProposalRatingRepo()
