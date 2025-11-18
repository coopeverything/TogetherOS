/**
 * Rating Handlers
 * Business logic for proposal quality ratings
 */

import { proposalRatingRepo } from '../repos/PostgresProposalRatingRepo'
import { ProposalRating } from '../entities/ProposalRating'
import type { ProposalRatingAggregate } from '@togetheros/types/governance'
import type { SubmitRatingInput } from '@togetheros/validators/governance'
// import { ratingRewardsService } from '../services/RatingRewardsService' // TODO: Fix path alias issue
import { bridgeRatingRepo } from '../repos/InMemoryBridgeRatingRepo'
import { checkAndFlagProposal } from './moderationHandlers'

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

  // Award SP/RP for rating submission (async, don't block response)
  // TODO: Re-enable when path alias issue is fixed
  // ratingRewardsService
  //   .awardRatingSubmission(proposalId, rating.id, memberId, rating)
  //   .catch((err) => console.error('[submitRating] Reward error:', err))

  // Check for red constructiveness rating and flag for moderation
  if (constructiveness === 1) {
    // Get current aggregate to check red flag count
    const { aggregate } = await getRatingAggregate(proposalId)
    checkAndFlagProposal(proposalId, aggregate.redFlagCount).catch((err) =>
      console.error('[submitRating] Moderation flag error:', err)
    )
  }

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
 * Also triggers rewards for highly-rated proposals and validated innovative markers
 */
export async function getRatingAggregate(
  proposalId: string,
  authorId?: string
): Promise<{ aggregate: ProposalRatingAggregate }> {
  const ratings = await proposalRatingRepo.getRatingsByProposal(proposalId)
  const aggregate = ProposalRating.calculateAggregate(ratings)

  // Set proposalId in case of no ratings
  if (aggregate.proposalId === '') {
    aggregate.proposalId = proposalId
  }

  // Award author bonus if proposal is highly rated (async, don't block)
  // TODO: Re-enable when path alias issue is fixed
  // if (authorId && aggregate.totalRatings >= 5) {
  //   ratingRewardsService
  //     .awardHighlyRatedProposal(
  //       proposalId,
  //       authorId,
  //       aggregate.avgClarity,
  //       aggregate.avgConstructiveness,
  //       aggregate.totalRatings
  //     )
  //     .catch((err) => console.error('[getRatingAggregate] Author bonus error:', err))
  // }

  // Award innovative marker bonuses if community validated (>50% marked as innovative)
  // TODO: Re-enable when path alias issue is fixed
  // if (aggregate.innovativePercentage > 0.5 && aggregate.totalRatings >= 3) {
  //   // Find all members who marked it as innovative
  //   const innovativeRaters = ratings.filter((r) => r.isInnovative)
  //   for (const rating of innovativeRaters) {
  //     ratingRewardsService
  //       .awardInnovativeMarker(proposalId, rating.memberId, rating.id)
  //       .catch((err) => console.error('[getRatingAggregate] Innovative marker error:', err))
  //   }
  // }

  // Include Bridge AI rating if available
  const bridgeRating = await bridgeRatingRepo.getByProposalId(proposalId)
  if (bridgeRating) {
    aggregate.bridgeRating = bridgeRating
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
