/**
 * Trust Calculator for Bridge Content
 *
 * Calculates trust tiers based on community validation signals:
 * - Votes (upvotes - downvotes)
 * - Replies (engagement)
 * - Participants (unique voices)
 * - Support Points (SP) - HIGHEST WEIGHT (members put SP where their mouth is)
 *
 * SP is weighted heavily because allocating SP is a meaningful commitment.
 */

import type {
  TrustTier,
  TrustThresholds,
  ContentEngagement,
} from '@togetheros/types';
import { DEFAULT_TRUST_THRESHOLDS } from '@togetheros/types';

// Re-export default thresholds for use elsewhere
export { DEFAULT_TRUST_THRESHOLDS };

/**
 * Calculate trust tier based on engagement metrics
 *
 * @param engagement - Content engagement metrics
 * @param createdAt - When content was created
 * @param thresholds - Configurable thresholds (from admin settings)
 * @returns Calculated trust tier
 */
export function calculateTrustTier(
  engagement: ContentEngagement,
  createdAt: Date,
  thresholds: TrustThresholds = DEFAULT_TRUST_THRESHOLDS
): TrustTier {
  const {
    voteScore,
    replyCount,
    participantCount,
    totalSP,
    spAllocatorCount,
  } = engagement;

  const ageHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  const isNew = ageHours < thresholds.newContentHours;

  // Calculate effective engagement score
  // SP counts double because it represents real commitment
  const effectiveVotes = voteScore + (totalSP * 2);
  const effectiveParticipants = participantCount + spAllocatorCount;

  // CONSENSUS: Overwhelming support from many participants + significant SP
  if (
    effectiveVotes >= thresholds.consensus.minVotes &&
    effectiveParticipants >= thresholds.consensus.minParticipants &&
    totalSP >= thresholds.consensus.minSP
  ) {
    return 'consensus';
  }

  // HIGH: Strong positive engagement OR significant SP backing
  // SP alone can push to high tier (someone really believes in this)
  if (
    totalSP >= thresholds.high.minSP ||
    (effectiveVotes >= thresholds.high.minVotes &&
      replyCount >= thresholds.high.minReplies)
  ) {
    return 'high';
  }

  // MEDIUM: Positive engagement with some SP or good votes
  if (
    totalSP >= thresholds.medium.minSP ||
    effectiveVotes >= thresholds.medium.minVotes ||
    replyCount >= thresholds.medium.minReplies
  ) {
    return 'medium';
  }

  // LOW: Some engagement but not strong
  if (
    voteScore >= thresholds.low.minVotes ||
    replyCount >= thresholds.low.minReplies ||
    totalSP > 0  // Any SP at all bumps from unvalidated
  ) {
    return 'low';
  }

  // UNVALIDATED: Brand new with no engagement
  // Content less than 24h old with no votes, replies, or SP
  if (isNew && voteScore === 0 && replyCount === 0 && totalSP === 0) {
    return 'unvalidated';
  }

  // Default to low if old but no engagement (stale content)
  return voteScore === 0 && replyCount === 0 && totalSP === 0
    ? 'unvalidated'
    : 'low';
}

/**
 * Calculate a numeric trust score for sorting
 * Higher score = more trusted
 *
 * @param engagement - Content engagement metrics
 * @param createdAt - When content was created
 * @returns Numeric score (0-100+)
 */
export function calculateTrustScore(
  engagement: ContentEngagement,
  createdAt: Date
): number {
  const {
    voteScore,
    replyCount,
    participantCount,
    totalSP,
    spAllocatorCount,
    ratingAvg,
  } = engagement;

  // Base score from votes (max ~30 points from votes)
  const votePoints = Math.min(voteScore * 2, 30);

  // SP is weighted heavily (max ~40 points from SP)
  // 1 SP = 2 points, capped at 40
  const spPoints = Math.min(totalSP * 2, 40);

  // Diversity bonus: more allocators = more legitimate
  // Each unique SP allocator adds 1 point (max 10)
  const allocatorBonus = Math.min(spAllocatorCount, 10);

  // Engagement from replies (max ~15 points)
  const replyPoints = Math.min(replyCount * 1.5, 15);

  // Participant diversity bonus (max 10)
  const participantBonus = Math.min(participantCount, 10);

  // Rating bonus if available (max 5)
  const ratingBonus = ratingAvg ? (ratingAvg - 2.5) * 2 : 0;

  // Age penalty for very new content (reduces score for <6 hours)
  const ageHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  const agePenalty = ageHours < 6 ? (6 - ageHours) * 2 : 0;

  const totalScore =
    votePoints +
    spPoints +
    allocatorBonus +
    replyPoints +
    participantBonus +
    ratingBonus -
    agePenalty;

  return Math.max(0, totalScore);
}

/**
 * Get trust tier from numeric score
 * Useful for quick classification
 */
export function getTrustTierFromScore(score: number): TrustTier {
  if (score >= 80) return 'consensus';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  if (score >= 10) return 'low';
  return 'unvalidated';
}

/**
 * Format engagement for display in Bridge prompt
 */
export function formatEngagementForPrompt(
  engagement: ContentEngagement,
  trustTier: TrustTier
): string {
  const parts: string[] = [];

  if (engagement.voteScore !== 0) {
    const sign = engagement.voteScore > 0 ? '+' : '';
    parts.push(`${sign}${engagement.voteScore} votes`);
  }

  if (engagement.replyCount > 0) {
    parts.push(`${engagement.replyCount} replies`);
  }

  if (engagement.totalSP > 0) {
    parts.push(`${engagement.totalSP} SP from ${engagement.spAllocatorCount} members`);
  }

  if (engagement.participantCount > 0 && trustTier === 'consensus') {
    parts.push(`${engagement.participantCount} participants`);
  }

  return parts.length > 0 ? parts.join(', ') : 'No engagement yet';
}

/**
 * Determine if content should be highlighted based on SP
 * Content with significant SP backing should be prioritized
 */
export function hasSignificantSPBacking(
  totalSP: number,
  spAllocatorCount: number
): boolean {
  // Multiple members each putting SP = strong signal
  return totalSP >= 10 || (spAllocatorCount >= 3 && totalSP >= 5);
}
