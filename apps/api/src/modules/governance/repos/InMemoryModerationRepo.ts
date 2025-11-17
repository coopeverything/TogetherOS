/**
 * In-Memory Moderation Repository
 * MVP implementation for moderation reviews
 */

import type { ModerationReview, ModerationQueueItem, ModerationStatus } from '@togetheros/types/governance'
import type { IModerationRepo } from './ModerationRepo'
import { v4 as uuidv4 } from 'uuid'
import { getProposalById } from '../handlers/crud'
import { bridgeRatingRepo } from './InMemoryBridgeRatingRepo'
import { getRatingAggregate } from '../handlers/ratingHandlers'

export class InMemoryModerationRepo implements IModerationRepo {
  private reviews: Map<string, ModerationReview> = new Map()

  async create(review: Omit<ModerationReview, 'id'>): Promise<ModerationReview> {
    const newReview: ModerationReview = {
      id: uuidv4(),
      ...review,
    }
    this.reviews.set(newReview.id, newReview)
    return newReview
  }

  async getById(id: string): Promise<ModerationReview | null> {
    return this.reviews.get(id) || null
  }

  async getByProposalId(proposalId: string): Promise<ModerationReview | null> {
    for (const review of this.reviews.values()) {
      if (review.proposalId === proposalId) {
        return review
      }
    }
    return null
  }

  async getQueue(status?: ModerationStatus): Promise<ModerationQueueItem[]> {
    const filteredReviews = Array.from(this.reviews.values()).filter((review) =>
      status ? review.status === status : review.status === 'pending'
    )

    // Build queue items with enriched data
    const queueItems: ModerationQueueItem[] = []

    for (const review of filteredReviews) {
      const proposal = await getProposalById(review.proposalId)
      if (!proposal) continue

      const bridgeRating = await bridgeRatingRepo.getByProposalId(review.proposalId)
      const { aggregate } = await getRatingAggregate(review.proposalId)

      // Calculate urgency score
      let urgencyScore = 0
      if (review.flagReason === 'ai_flagged') urgencyScore += 30
      if (review.flagReason === 'member_red_rating') urgencyScore += 50
      if (review.flagReason === 'multiple_concerns') urgencyScore += 70
      if (aggregate.redFlagCount > 3) urgencyScore += 20
      if (bridgeRating?.constructiveness === 1) urgencyScore += 40

      // Age penalty (older = more urgent)
      const ageHours = (Date.now() - review.flaggedAt.getTime()) / (1000 * 60 * 60)
      urgencyScore += Math.min(ageHours * 2, 50)

      queueItems.push({
        id: review.id,
        proposalId: review.proposalId,
        proposalTitle: proposal.title,
        proposalAuthorId: proposal.authorId,
        flagReason: review.flagReason,
        status: review.status,
        urgencyScore,
        flaggedAt: review.flaggedAt,
        aiAssessment: bridgeRating
          ? {
              clarity: bridgeRating.clarity,
              constructiveness: bridgeRating.constructiveness,
              issues: bridgeRating.issues || [],
            }
          : undefined,
        communityRatings:
          aggregate.totalRatings > 0
            ? {
                redFlagCount: aggregate.redFlagCount,
                totalRatings: aggregate.totalRatings,
              }
            : undefined,
      })
    }

    // Sort by urgency score descending
    return queueItems.sort((a, b) => b.urgencyScore - a.urgencyScore)
  }

  async updateReview(
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
  ): Promise<ModerationReview | null> {
    const review = this.reviews.get(id)
    if (!review) return null

    const updated: ModerationReview = {
      ...review,
      ...updates,
    }

    this.reviews.set(id, updated)
    return updated
  }

  async submitAppeal(id: string, appealText: string): Promise<ModerationReview | null> {
    const review = this.reviews.get(id)
    if (!review) return null

    const updated: ModerationReview = {
      ...review,
      status: 'appealed',
      appealText,
      appealedAt: new Date(),
    }

    this.reviews.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    return this.reviews.delete(id)
  }
}

// Singleton instance
export const moderationRepo = new InMemoryModerationRepo()
