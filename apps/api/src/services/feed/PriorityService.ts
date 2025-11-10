// apps/api/src/services/feed/PriorityService.ts
// Service for managing user priorities and community priority aggregation (Phase 4)

import type { Priority, TopicSentiment } from '@togetheros/types'

/**
 * Community priority statistics (anonymous aggregate)
 */
export interface CommunityPriorityStats {
  topic: string
  userCount: number              // # of users who prioritized this
  percentageOfCommunity: number  // % of total users
  averageWeight: number          // Average care weight (1-10)
  averageRank: number            // Average ranking position
  trendDirection: 'up' | 'down' | 'stable'  // Trend vs last week
  trendPercentage: number        // % change vs last week
}

/**
 * Feed sorting mode
 */
export type FeedSortMode = 'recent' | 'for-you' | 'trending'

/**
 * Priority management service
 */
export class PriorityService {
  /**
   * Calculate community priority statistics (anonymous aggregates)
   */
  static calculateCommunityStats(
    allPriorities: Priority[],
    totalUsers: number
  ): CommunityPriorityStats[] {
    // Group priorities by topic
    const topicGroups = new Map<string, Priority[]>()

    for (const priority of allPriorities) {
      if (!topicGroups.has(priority.topic)) {
        topicGroups.set(priority.topic, [])
      }
      topicGroups.get(priority.topic)!.push(priority)
    }

    // Calculate stats for each topic
    const stats: CommunityPriorityStats[] = []

    for (const [topic, priorities] of topicGroups.entries()) {
      const userCount = new Set(priorities.map(p => p.userId)).size
      const percentageOfCommunity = (userCount / totalUsers) * 100

      const averageWeight = priorities.reduce((sum, p) => sum + p.weight, 0) / priorities.length
      const averageRank = priorities.reduce((sum, p) => sum + p.rank, 0) / priorities.length

      // For MVP, trends are mock data (would need historical data)
      const trendDirection = Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable'
      const trendPercentage = trendDirection === 'stable' ? 0 : Math.floor(Math.random() * 20)

      stats.push({
        topic,
        userCount,
        percentageOfCommunity,
        averageWeight,
        averageRank,
        trendDirection,
        trendPercentage,
      })
    }

    // Sort by percentage of community (most popular first)
    return stats.sort((a, b) => b.percentageOfCommunity - a.percentageOfCommunity)
  }

  /**
   * Get user's personal priority list
   */
  static getUserPriorities(userId: string, allPriorities: Priority[]): Priority[] {
    return allPriorities
      .filter(p => p.userId === userId)
      .sort((a, b) => a.rank - b.rank)  // Sort by rank ascending
  }

  /**
   * Upsert a user's priority
   */
  static upsertPriority(
    userId: string,
    topic: string,
    rank: number,
    weight: number,
    existingPriorities: Priority[]
  ): Priority[] {
    const priorities = [...existingPriorities]

    // Find existing priority for this user/topic
    const existingIndex = priorities.findIndex(
      p => p.userId === userId && p.topic === topic
    )

    const now = new Date()

    if (existingIndex >= 0) {
      // Update existing
      priorities[existingIndex] = {
        ...priorities[existingIndex],
        rank,
        weight,
        updatedAt: now,
      }
    } else {
      // Create new
      const newPriority: Priority = {
        id: `priority-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        topic,
        rank,
        weight,
        updatedAt: now,
      }
      priorities.push(newPriority)
    }

    return priorities
  }

  /**
   * Remove a priority
   */
  static removePriority(
    userId: string,
    topic: string,
    existingPriorities: Priority[]
  ): Priority[] {
    return existingPriorities.filter(
      p => !(p.userId === userId && p.topic === topic)
    )
  }

  /**
   * Get topics user has engaged with (from posts, reactions, etc.)
   */
  static getEngagedTopics(userId: string, posts: any[]): string[] {
    const topics = new Set<string>()

    // Get topics from posts user created
    posts
      .filter(p => p.authorId === userId)
      .forEach(p => p.topics.forEach((t: string) => topics.add(t)))

    // TODO: Also consider topics from reactions, discussions when those are implemented

    return Array.from(topics).sort()
  }

  /**
   * Calculate user's interest percentages (PRIVATE)
   */
  static calculateInterestPercentages(
    userId: string,
    priorities: Priority[]
  ): Record<string, number> {
    const userPriorities = this.getUserPriorities(userId, priorities)

    if (userPriorities.length === 0) {
      return {}
    }

    // Calculate weighted scores (higher rank = lower score, higher weight = higher score)
    const totalTopics = userPriorities.length
    const weightedScores: Record<string, number> = {}

    for (const priority of userPriorities) {
      // Invert rank (rank 1 = highest score)
      const rankScore = (totalTopics - priority.rank + 1) / totalTopics
      // Weight is 1-10, normalize to 0-1
      const weightScore = priority.weight / 10
      // Combined score (60% weight, 40% rank)
      weightedScores[priority.topic] = (weightScore * 0.6) + (rankScore * 0.4)
    }

    // Convert to percentages
    const totalScore = Object.values(weightedScores).reduce((sum, s) => sum + s, 0)
    const percentages: Record<string, number> = {}

    for (const [topic, score] of Object.entries(weightedScores)) {
      percentages[topic] = Math.round((score / totalScore) * 100)
    }

    return percentages
  }
}
