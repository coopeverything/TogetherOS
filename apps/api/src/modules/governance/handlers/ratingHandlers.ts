/**
 * Rating Handlers
 * Business logic for proposal quality ratings
 */

import { proposalRatingRepo } from '../repos/InMemoryProposalRatingRepo'
import { ProposalRating } from '../entities/ProposalRating'
import type { ProposalRatingAggregate } from '@togetheros/types/governance'
import type { SubmitRatingInput } from '@togetheros/validators/governance'

/**
 * Submit or update a rating on a proposal
 * @throws Error if validation fails
 */
export async function submitRating(
  input: SubmitRatingInput
): Promise<{ rating: ReturnType<typeof ProposalRating.prototype.toJSON> }> {
  const {
    proposalId,
    memberId,
    clarity,
    importance,
    urgency,
    isInnovative,
    constructiveness,
    feedback,
  } = input

  const rating = await proposalRatingRepo.submitRating(
    proposalId,
    memberId,
    clarity,
    importance,
    urgency,
    isInnovative,
    constructiveness,
    feedback
  )

  return { rating: rating.toJSON() }
}

/**
 * Get a member's rating for a proposal
 */
export async function getMyRating(
  proposalId: string,
  memberId: string
): Promise<{ rating: ReturnType<typeof ProposalRating.prototype.toJSON> | null }> {
  const rating = await proposalRatingRepo.getRating(proposalId, memberId)

  return { rating: rating ? rating.toJSON() : null }
}

/**
 * Get all ratings for a proposal
 */
export async function getProposalRatings(
  proposalId: string
): Promise<{ ratings: ReturnType<typeof ProposalRating.prototype.toJSON>[] }> {
  const ratings = await proposalRatingRepo.getRatingsByProposal(proposalId)

  return { ratings: ratings.map((r) => r.toJSON()) }
}

/**
 * Get aggregate ratings for a proposal
 */
export async function getRatingAggregate(
  proposalId: string
): Promise<{ aggregate: ProposalRatingAggregate }> {
  const ratings = await proposalRatingRepo.getRatingsByProposal(proposalId)
  const aggregate = ProposalRating.calculateAggregate(ratings)

  // Set proposalId in case of no ratings
  if (aggregate.proposalId === '') {
    aggregate.proposalId = proposalId
  }

  return { aggregate }
}

/**
 * Delete a member's rating
 */
export async function deleteRating(
  proposalId: string,
  memberId: string
): Promise<{ success: boolean }> {
  const success = await proposalRatingRepo.deleteRating(proposalId, memberId)

  return { success }
}
