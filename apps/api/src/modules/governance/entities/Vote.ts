/**
 * Vote Entity
 * Domain model for consent-based voting
 */

import type { Vote as IVote, VoteType, VoteTally } from '@togetheros/types/governance'
import { v4 as uuidv4 } from 'uuid'

/**
 * Vote Entity
 * Represents an individual member's vote on a proposal
 */
export class Vote implements IVote {
  id: string
  proposalId: string
  memberId: string
  voteType: VoteType
  reasoning?: string
  votedAt: Date
  updatedAt: Date

  constructor(data: Omit<IVote, 'id' | 'votedAt' | 'updatedAt'> & { id?: string; votedAt?: Date; updatedAt?: Date }) {
    this.id = data.id || uuidv4()
    this.proposalId = data.proposalId
    this.memberId = data.memberId
    this.voteType = data.voteType
    this.reasoning = data.reasoning
    this.votedAt = data.votedAt || new Date()
    this.updatedAt = data.updatedAt || new Date()
  }

  /**
   * Update vote
   */
  updateVote(voteType: VoteType, reasoning?: string): void {
    this.voteType = voteType
    this.reasoning = reasoning
    this.updatedAt = new Date()
  }

  /**
   * Convert to plain object
   */
  toJSON(): IVote {
    return {
      id: this.id,
      proposalId: this.proposalId,
      memberId: this.memberId,
      voteType: this.voteType,
      reasoning: this.reasoning,
      votedAt: this.votedAt,
      updatedAt: this.updatedAt,
    }
  }

  /**
   * Calculate vote tally from array of votes
   */
  static calculateTally(votes: Vote[], thresholdPercentage = 0.5): VoteTally {
    const total = votes.length
    const consent = votes.filter((v) => v.voteType === 'consent').length
    const concern = votes.filter((v) => v.voteType === 'concern').length
    const abstain = votes.filter((v) => v.voteType === 'abstain').length
    const block = votes.filter((v) => v.voteType === 'block').length

    // Threshold met if consent percentage exceeds threshold (excluding abstentions)
    const eligibleVotes = total - abstain
    const consentPercentage = eligibleVotes > 0 ? consent / eligibleVotes : 0
    const thresholdMet = consentPercentage >= thresholdPercentage && block === 0

    return {
      total,
      consent,
      concern,
      abstain,
      block,
      thresholdMet,
      hasBlocks: block > 0,
    }
  }
}
