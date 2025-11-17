/**
 * Proposal Rating Entity
 * Multi-dimensional quality assessment of proposals
 */

import type {
  ProposalRating as IProposalRating,
  ProposalRatingAggregate,
  ClarityRating,
  ConstructivenessRating,
} from '@togetheros/types/governance'
import { v4 as uuidv4 } from 'uuid'

/**
 * Proposal Rating Entity
 * Represents a member's quality rating of a proposal
 */
export class ProposalRating implements IProposalRating {
  id: string
  proposalId: string
  memberId: string
  clarity: ClarityRating
  importance: number
  urgency: number
  isInnovative: boolean
  constructiveness: ConstructivenessRating
  feedback?: string
  ratedAt: Date
  updatedAt: Date

  constructor(
    data: Omit<IProposalRating, 'id' | 'ratedAt' | 'updatedAt'> & {
      id?: string
      ratedAt?: Date
      updatedAt?: Date
    }
  ) {
    this.id = data.id || uuidv4()
    this.proposalId = data.proposalId
    this.memberId = data.memberId
    this.clarity = data.clarity
    this.importance = data.importance
    this.urgency = data.urgency
    this.isInnovative = data.isInnovative
    this.constructiveness = data.constructiveness
    this.feedback = data.feedback
    this.ratedAt = data.ratedAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  /**
   * Update rating
   */
  updateRating(
    clarity: ClarityRating,
    importance: number,
    urgency: number,
    isInnovative: boolean,
    constructiveness: ConstructivenessRating,
    feedback?: string
  ): void {
    this.clarity = clarity
    this.importance = importance
    this.urgency = urgency
    this.isInnovative = isInnovative
    this.constructiveness = constructiveness
    this.feedback = feedback
    this.updatedAt = new Date()
  }

  /**
   * Convert to plain object
   */
  toJSON(): IProposalRating {
    return {
      id: this.id,
      proposalId: this.proposalId,
      memberId: this.memberId,
      clarity: this.clarity,
      importance: this.importance,
      urgency: this.urgency,
      isInnovative: this.isInnovative,
      constructiveness: this.constructiveness,
      feedback: this.feedback,
      ratedAt: this.ratedAt,
      updatedAt: this.updatedAt,
    }
  }

  /**
   * Calculate aggregate ratings from array of ratings
   */
  static calculateAggregate(ratings: ProposalRating[]): ProposalRatingAggregate {
    const total = ratings.length

    if (total === 0) {
      // Return default aggregate for no ratings
      return {
        proposalId: '',
        totalRatings: 0,
        avgClarity: 0,
        clarityDistribution: { brown: 0, yellow: 0, green: 0 },
        avgImportance: 0,
        avgUrgency: 0,
        innovativeCount: 0,
        innovativePercentage: 0,
        avgConstructiveness: 0,
        constructivenessDistribution: { red: 0, yellow: 0, green: 0 },
        hasRedFlags: false,
        redFlagCount: 0,
      }
    }

    const proposalId = ratings[0].proposalId

    // Calculate averages
    const avgClarity =
      ratings.reduce((sum, r) => sum + r.clarity, 0) / total
    const avgImportance =
      ratings.reduce((sum, r) => sum + r.importance, 0) / total
    const avgUrgency =
      ratings.reduce((sum, r) => sum + r.urgency, 0) / total
    const avgConstructiveness =
      ratings.reduce((sum, r) => sum + r.constructiveness, 0) / total

    // Calculate distributions
    const clarityDistribution = {
      brown: ratings.filter((r) => r.clarity === 1).length,
      yellow: ratings.filter((r) => r.clarity === 2).length,
      green: ratings.filter((r) => r.clarity === 3).length,
    }

    const constructivenessDistribution = {
      red: ratings.filter((r) => r.constructiveness === 1).length,
      yellow: ratings.filter((r) => r.constructiveness === 2).length,
      green: ratings.filter((r) => r.constructiveness === 3).length,
    }

    // Calculate innovation metrics
    const innovativeCount = ratings.filter((r) => r.isInnovative).length
    const innovativePercentage = innovativeCount / total

    // Calculate red flag status
    const redFlagCount = constructivenessDistribution.red
    const hasRedFlags = redFlagCount > 0

    return {
      proposalId,
      totalRatings: total,
      avgClarity,
      clarityDistribution,
      avgImportance,
      avgUrgency,
      innovativeCount,
      innovativePercentage,
      avgConstructiveness,
      constructivenessDistribution,
      hasRedFlags,
      redFlagCount,
    }
  }
}
