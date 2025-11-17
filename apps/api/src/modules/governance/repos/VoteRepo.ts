/**
 * Vote Repository Interface
 * Data access contract for votes
 */

import type { Vote } from '../entities/Vote'
import type { VoteType } from '@togetheros/types/governance'

export interface IVoteRepo {
  /**
   * Cast or update a vote
   * If member already voted, update their vote; otherwise create new
   */
  castVote(proposalId: string, memberId: string, voteType: VoteType, reasoning?: string): Promise<Vote>

  /**
   * Get a member's vote on a proposal
   */
  getVote(proposalId: string, memberId: string): Promise<Vote | null>

  /**
   * Get all votes for a proposal
   */
  getVotesByProposal(proposalId: string): Promise<Vote[]>

  /**
   * Delete a vote
   */
  deleteVote(proposalId: string, memberId: string): Promise<boolean>

  /**
   * Count votes by type for a proposal
   */
  countVotesByType(proposalId: string): Promise<{ [key in VoteType]: number }>
}
