/**
 * Reputation Service
 * Handles badge awarding based on member activity
 */

import { awardBadge, memberHasBadge, getBadgeById } from '../db/badges';
import { query } from '@togetheros/db';

/**
 * Badge criteria definitions
 * Maps badge IDs to their qualification criteria
 */
const BADGE_CRITERIA: Record<string, { eventType: string; threshold: number }> = {
  // Contribution badges (from migration seed)
  'first-pr': { eventType: 'pr_merged', threshold: 1 },
  'foundation-builder': { eventType: 'foundation_contribution', threshold: 1 },
  'bug-hunter': { eventType: 'bug_report_verified', threshold: 5 },
  'docs-champion': { eventType: 'docs_contribution', threshold: 10 },
  'code-reviewer': { eventType: 'review_completed', threshold: 20 },

  // Group badges
  'group-founder': { eventType: 'group_created', threshold: 1 },
  'community-builder': { eventType: 'group_joined', threshold: 5 },
  'city-pioneer': { eventType: 'city_group_moderator', threshold: 1 },

  // Governance badges
  'proposal-author': { eventType: 'proposal_submitted', threshold: 1 },
  'active-voter': { eventType: 'vote_cast', threshold: 10 },
  'deliberator': { eventType: 'deliberation_participated', threshold: 5 },

  // Social economy badges
  'sp-allocator': { eventType: 'sp_allocated', threshold: 1 },
  'supporter-5': { eventType: 'sp_allocated', threshold: 5 },
  'supporter-10': { eventType: 'sp_allocated', threshold: 10 },
};

export class ReputationService {
  /**
   * Check and award badge based on event type and count
   */
  async checkAndAwardBadge(
    memberId: string,
    eventType: string,
    eventId?: string
  ): Promise<{ badgeAwarded: string | null }> {
    // Find badges that match this event type
    const matchingBadges = Object.entries(BADGE_CRITERIA)
      .filter(([, criteria]) => criteria.eventType === eventType);

    for (const [badgeId, criteria] of matchingBadges) {
      // Check if member already has this badge
      const hasBadge = await memberHasBadge(memberId, badgeId);
      if (hasBadge) continue;

      // Count events of this type for the member
      const count = await this.countMemberEvents(memberId, eventType);

      // Award badge if threshold met
      if (count >= criteria.threshold) {
        const result = await awardBadge(memberId, badgeId, eventId);
        if (result.success) {
          return { badgeAwarded: badgeId };
        }
      }
    }

    return { badgeAwarded: null };
  }

  /**
   * Count events of a specific type for a member
   */
  private async countMemberEvents(memberId: string, eventType: string): Promise<number> {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM reward_events
       WHERE member_id = $1 AND event_type = $2 AND processed = TRUE`,
      [memberId, eventType]
    );
    return parseInt(result.rows[0]?.count || '0', 10);
  }

  /**
   * Award a specific badge to a member
   * Use for manual awards or special events
   */
  async awardSpecificBadge(
    memberId: string,
    badgeId: string,
    eventId?: string
  ): Promise<{ success: boolean; alreadyHad: boolean }> {
    // Verify badge exists
    const badge = await getBadgeById(badgeId);
    if (!badge) {
      return { success: false, alreadyHad: false };
    }

    return awardBadge(memberId, badgeId, eventId);
  }

  /**
   * Check badges for group creation
   */
  async checkGroupCreationBadges(memberId: string, eventId?: string): Promise<void> {
    await this.checkAndAwardBadge(memberId, 'group_created', eventId);
  }

  /**
   * Check badges for group join
   */
  async checkGroupJoinBadges(memberId: string, eventId?: string): Promise<void> {
    await this.checkAndAwardBadge(memberId, 'group_joined', eventId);
  }

  /**
   * Check badges for proposal submission
   */
  async checkProposalBadges(memberId: string, eventId?: string): Promise<void> {
    await this.checkAndAwardBadge(memberId, 'proposal_submitted', eventId);
  }

  /**
   * Check badges for voting
   */
  async checkVotingBadges(memberId: string, eventId?: string): Promise<void> {
    await this.checkAndAwardBadge(memberId, 'vote_cast', eventId);
  }

  /**
   * Check badges for SP allocation
   */
  async checkSPAllocationBadges(memberId: string, eventId?: string): Promise<void> {
    await this.checkAndAwardBadge(memberId, 'sp_allocated', eventId);
  }

  /**
   * Check badges for PR merge (contribution)
   */
  async checkContributionBadges(memberId: string, eventId?: string): Promise<void> {
    await this.checkAndAwardBadge(memberId, 'pr_merged', eventId);
  }
}

// Singleton instance
export const reputationService = new ReputationService();
