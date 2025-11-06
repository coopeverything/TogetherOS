// apps/api/src/modules/groups/services/GroupRewardsService.ts
// Group-related Rewards and Badges Service

import type { CreateRewardEventInput } from '@togetheros/types/rewards'
import { SP_WEIGHTS } from '@togetheros/types/rewards'

/**
 * Service for managing rewards for group-related actions
 */
export class GroupRewardsService {
  /**
   * Award RP for creating a new group (not city group)
   * Returns the reward event ID
   */
  async awardGroupCreation(groupId: string, creatorId: string): Promise<string | null> {
    const eventInput: CreateRewardEventInput = {
      memberId: creatorId,
      event_type: 'group_created',
      context: {
        group_id: groupId,
      },
      source: 'groups',
      timestamp: new Date(),
    }

    // Create reward event
    // const event = await rewardEventsRepo.create(eventInput)

    // Award SP (15 points)
    // await supportPointsService.awardPoints(creatorId, SP_WEIGHTS.group_created, event.id)

    // Check for "Group Founder" badge
    // await this.checkGroupFounderBadge(creatorId)

    return null // event.id (placeholder)
  }

  /**
   * Award RP for joining an existing group (not city group)
   * Returns the reward event ID
   */
  async awardGroupJoin(groupId: string, memberId: string): Promise<string | null> {
    const eventInput: CreateRewardEventInput = {
      memberId,
      event_type: 'group_joined',
      context: {
        group_id: groupId,
      },
      source: 'groups',
      timestamp: new Date(),
    }

    // Create reward event
    // const event = await rewardEventsRepo.create(eventInput)

    // Award SP (3 points)
    // await supportPointsService.awardPoints(memberId, SP_WEIGHTS.group_joined, event.id)

    // Check for "Community Builder" badge (5+ groups joined)
    // await this.checkCommunityBuilderBadge(memberId)

    return null // event.id (placeholder)
  }

  /**
   * Log city group join (no reward, just tracking)
   */
  async logCityGroupJoin(groupId: string, memberId: string): Promise<void> {
    const eventInput: CreateRewardEventInput = {
      memberId,
      event_type: 'city_group_joined',
      context: {
        group_id: groupId,
      },
      source: 'groups',
      timestamp: new Date(),
    }

    // Create tracking event (no SP awarded)
    // await rewardEventsRepo.create(eventInput)
  }

  /**
   * Award "City Pioneer" badge for becoming a moderator (first 5 members)
   */
  async awardCityPioneerBadge(memberId: string, groupId: string): Promise<void> {
    // Check if user already has the badge
    // const hasBadge = await badgeRepo.userHasBadge(memberId, 'city-pioneer')

    // if (!hasBadge) {
    //   await badgeRepo.awardBadge({
    //     memberId,
    //     badgeId: 'city-pioneer',
    //     earnedAt: new Date(),
    //     context: { group_id: groupId }
    //   })
    // }
  }

  /**
   * Check if user has earned "Group Founder" badge
   */
  private async checkGroupFounderBadge(memberId: string): Promise<void> {
    // Count group_created events for this user
    // const createdCount = await rewardEventsRepo.countByType(memberId, 'group_created')

    // if (createdCount >= 1) {
    //   await badgeRepo.awardBadge({
    //     memberId,
    //     badgeId: 'group-founder',
    //     earnedAt: new Date()
    //   })
    // }
  }

  /**
   * Check if user has earned "Community Builder" badge
   */
  private async checkCommunityBuilderBadge(memberId: string): Promise<void> {
    // Count group_joined events for this user
    // const joinedCount = await rewardEventsRepo.countByType(memberId, 'group_joined')

    // if (joinedCount >= 5) {
    //   await badgeRepo.awardBadge({
    //     memberId,
    //     badgeId: 'community-builder',
    //     earnedAt: new Date()
    //   })
    // }
  }
}

// Singleton instance
export const groupRewardsService = new GroupRewardsService()
