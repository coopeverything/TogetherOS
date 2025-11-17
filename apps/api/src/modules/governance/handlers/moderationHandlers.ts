/**
 * Moderation Handlers
 * Business logic for content moderation
 */

import { moderationRepo } from '../repos/InMemoryModerationRepo'
import type { ModerationReview, ModerationQueueItem, ModerationStatus } from '@togetheros/types/governance'

/**
 * Flag a proposal for moderation review
 */
export async function flagProposal(
  proposalId: string,
  flagReason: 'ai_flagged' | 'member_red_rating' | 'multiple_concerns' | 'manual_report'
): Promise<{ review: ModerationReview }> {
  // Check if already flagged
  const existing = await moderationRepo.getByProposalId(proposalId)
  if (existing) {
    return { review: existing }
  }

  const review = await moderationRepo.create({
    proposalId,
    flagReason,
    status: 'pending',
    authorNotified: false,
    flaggedAt: new Date(),
  })

  console.log(`[Moderation] Flagged proposal ${proposalId} for review: ${flagReason}`)

  return { review }
}

/**
 * Get moderation queue
 */
export async function getModerationQueue(
  status?: ModerationStatus
): Promise<{ queue: ModerationQueueItem[] }> {
  const queue = await moderationRepo.getQueue(status)
  return { queue }
}

/**
 * Get moderation review by ID
 */
export async function getModerationReview(id: string): Promise<{ review: ModerationReview | null }> {
  const review = await moderationRepo.getById(id)
  return { review }
}

/**
 * Review a flagged proposal (moderator action)
 */
export async function reviewProposal(
  reviewId: string,
  moderatorId: string,
  decision: 'approve' | 'reject',
  action: 'no_action' | 'edit_required' | 'hidden' | 'removed',
  moderatorNotes?: string
): Promise<{ review: ModerationReview | null }> {
  const status: ModerationStatus = decision === 'approve' ? 'approved' : 'rejected'

  const review = await moderationRepo.updateReview(reviewId, {
    status,
    moderatorId,
    moderatorNotes,
    action,
    authorNotified: true,
    reviewedAt: new Date(),
  })

  if (review) {
    console.log(
      `[Moderation] Proposal ${review.proposalId} reviewed by ${moderatorId}: ${decision} (${action})`
    )
  }

  return { review }
}

/**
 * Submit appeal against moderation decision
 */
export async function submitAppeal(
  reviewId: string,
  appealText: string
): Promise<{ review: ModerationReview | null }> {
  const review = await moderationRepo.submitAppeal(reviewId, appealText)

  if (review) {
    console.log(`[Moderation] Appeal submitted for review ${reviewId}`)
  }

  return { review }
}

/**
 * Review an appeal (moderator action)
 */
export async function reviewAppeal(
  reviewId: string,
  moderatorId: string,
  decision: 'approve' | 'reject',
  moderatorNotes?: string
): Promise<{ review: ModerationReview | null }> {
  const status: ModerationStatus = decision === 'approve' ? 'appeal_approved' : 'appeal_rejected'

  const review = await moderationRepo.updateReview(reviewId, {
    status,
    moderatorId,
    moderatorNotes,
    authorNotified: true,
    appealReviewedAt: new Date(),
  })

  if (review) {
    console.log(`[Moderation] Appeal for ${review.proposalId} reviewed by ${moderatorId}: ${decision}`)
  }

  return { review }
}

/**
 * Auto-flag proposals based on ratings
 * Called when red constructiveness ratings are submitted
 */
export async function checkAndFlagProposal(proposalId: string, redFlagCount: number): Promise<void> {
  // Flag if multiple red ratings (threshold: 2)
  if (redFlagCount >= 2) {
    await flagProposal(proposalId, 'multiple_concerns')
  }
  // Single red rating creates lower-priority flag
  else if (redFlagCount === 1) {
    await flagProposal(proposalId, 'member_red_rating')
  }
}
