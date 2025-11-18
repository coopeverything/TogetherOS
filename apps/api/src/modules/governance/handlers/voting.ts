/**
 * Voting Handlers
 * Business logic for consent-based voting
 */

import { voteRepo } from '../repos/PostgresVoteRepo'
import { Vote } from '../entities/Vote'
import type { VoteType, VoteTally } from '@togetheros/types/governance'
import type { CastVoteInput } from '@togetheros/validators/governance'

/**
 * Cast or update a vote on a proposal
 * @throws Error if validation fails
 */
export async function castVote(input: CastVoteInput): Promise<{ vote: ReturnType<typeof Vote.prototype.toJSON> }> {
  const { proposalId, memberId, voteType, reasoning } = input

  const vote = await voteRepo.castVote(proposalId, memberId, voteType, reasoning)

  return { vote: vote.toJSON() }
}

/**
 * Get a member's vote on a proposal
 */
export async function getMyVote(
  proposalId: string,
  memberId: string
): Promise<{ vote: ReturnType<typeof Vote.prototype.toJSON> | null }> {
  const vote = await voteRepo.getVote(proposalId, memberId)

  return { vote: vote ? vote.toJSON() : null }
}

/**
 * Get all votes for a proposal
 */
export async function getProposalVotes(
  proposalId: string
): Promise<{ votes: ReturnType<typeof Vote.prototype.toJSON>[] }> {
  const votes = await voteRepo.getVotesByProposal(proposalId)

  return { votes: votes.map((v) => v.toJSON()) }
}

/**
 * Get vote tally for a proposal
 */
export async function getVoteTally(
  proposalId: string,
  thresholdPercentage = 0.5
): Promise<{ tally: VoteTally }> {
  const votes = await voteRepo.getVotesByProposal(proposalId)
  const tally = Vote.calculateTally(votes, thresholdPercentage)

  return { tally }
}

/**
 * Delete a member's vote
 */
export async function deleteVote(
  proposalId: string,
  memberId: string
): Promise<{ success: boolean }> {
  const success = await voteRepo.deleteVote(proposalId, memberId)

  return { success }
}
