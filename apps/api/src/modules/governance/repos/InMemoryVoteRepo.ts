/**
 * In-Memory Vote Repository
 * Fixture implementation for development and testing
 */

import { Vote } from '../entities/Vote'
import type { IVoteRepo } from './VoteRepo'
import type { VoteType } from '@togetheros/types/governance'

export class InMemoryVoteRepo implements IVoteRepo {
  private votes: Map<string, Vote> = new Map()

  /**
   * Generate a composite key for member vote
   */
  private getVoteKey(proposalId: string, memberId: string): string {
    return `${proposalId}:${memberId}`
  }

  async castVote(
    proposalId: string,
    memberId: string,
    voteType: VoteType,
    reasoning?: string
  ): Promise<Vote> {
    const key = this.getVoteKey(proposalId, memberId)
    const existing = this.votes.get(key)

    if (existing) {
      // Update existing vote
      existing.updateVote(voteType, reasoning)
      return existing
    }

    // Create new vote
    const vote = new Vote({
      proposalId,
      memberId,
      voteType,
      reasoning,
    })

    this.votes.set(key, vote)
    return vote
  }

  async getVote(proposalId: string, memberId: string): Promise<Vote | null> {
    const key = this.getVoteKey(proposalId, memberId)
    return this.votes.get(key) || null
  }

  async getVotesByProposal(proposalId: string): Promise<Vote[]> {
    return Array.from(this.votes.values()).filter(
      (vote) => vote.proposalId === proposalId
    )
  }

  async deleteVote(proposalId: string, memberId: string): Promise<boolean> {
    const key = this.getVoteKey(proposalId, memberId)
    return this.votes.delete(key)
  }

  async countVotesByType(proposalId: string): Promise<{ [key in VoteType]: number }> {
    const votes = await this.getVotesByProposal(proposalId)

    return {
      consent: votes.filter((v) => v.voteType === 'consent').length,
      concern: votes.filter((v) => v.voteType === 'concern').length,
      abstain: votes.filter((v) => v.voteType === 'abstain').length,
      block: votes.filter((v) => v.voteType === 'block').length,
    }
  }

  /**
   * Clear all votes (for testing)
   */
  clear(): void {
    this.votes.clear()
  }
}

// Singleton instance
export const voteRepo = new InMemoryVoteRepo()
