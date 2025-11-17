/**
 * Moderation Repository Interface
 * Manages moderation reviews for flagged proposals
 */

import type { ModerationReview, ModerationQueueItem, ModerationStatus } from '@togetheros/types/governance'

export interface IModerationRepo {
  /**
   * Create a new moderation review
   */
  create(review: Omit<ModerationReview, 'id'>): Promise<ModerationReview>

  /**
   * Get review by ID
   */
  getById(id: string): Promise<ModerationReview | null>

  /**
   * Get review for a proposal
   */
  getByProposalId(proposalId: string): Promise<ModerationReview | null>

  /**
   * Get moderation queue (pending reviews)
   */
  getQueue(status?: ModerationStatus): Promise<ModerationQueueItem[]>

  /**
   * Update review status and moderator notes
   */
  updateReview(
    id: string,
    updates: {
      status?: ModerationStatus
      moderatorId?: string
      moderatorNotes?: string
      action?: 'no_action' | 'edit_required' | 'hidden' | 'removed'
      authorNotified?: boolean
      reviewedAt?: Date
      appealedAt?: Date
      appealReviewedAt?: Date
    }
  ): Promise<ModerationReview | null>

  /**
   * Submit appeal
   */
  submitAppeal(id: string, appealText: string): Promise<ModerationReview | null>

  /**
   * Delete review
   */
  delete(id: string): Promise<boolean>
}
