/**
 * Recommendation Generator Service
 * Phase 3: Dynamic recommendation generation with interest inference
 */

import type {
  UserContext,
  CityContext,
  Recommendation,
  GroupSummary,
  EventSummary,
  InterestScore,
} from '@togetheros/types';
import { matchActivities } from './activity-matcher';
import { generateRecommendation } from './recommendation-templates';
import { nanoid } from 'nanoid';

/**
 * Generate all recommendations for a user
 */
export async function generateRecommendations(
  userContext: UserContext,
  cityContext: CityContext,
  maxRecommendations: number = 5
): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // Infer additional interests from user behavior
  const inferredInterests = inferInterests(userContext);

  // Generate group recommendations
  const groupRecs = generateGroupRecommendations(
    userContext,
    cityContext,
    inferredInterests
  );
  recommendations.push(...groupRecs);

  // Generate event recommendations
  const eventRecs = generateEventRecommendations(
    userContext,
    cityContext,
    inferredInterests
  );
  recommendations.push(...eventRecs);

  // Generate activity recommendations
  const activityRecs = generateActivityRecommendations(
    userContext,
    cityContext
  );
  recommendations.push(...activityRecs);

  // Sort by relevance score and return top N
  return recommendations
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxRecommendations);
}

/**
 * Infer additional interests from user behavior
 * Phase 3: Interest Inference Algorithm
 */
export function inferInterests(userContext: UserContext): InterestScore[] {
  const inferred: Map<string, InterestScore> = new Map();

  // Start with explicit interests (highest confidence)
  for (const interest of userContext.explicitInterests) {
    if (!inferred.has(interest)) {
      inferred.set(interest, {
        topic: interest,
        score: 95, // High confidence for explicit interests
        derivedFrom: 'profile',
        lastUpdated: new Date(),
      });
    }
  }

  // Add implicit interests from tracked behavior
  for (const interest of userContext.implicitInterests) {
    if (!inferred.has(interest.topic)) {
      inferred.set(interest.topic, interest);
    }
  }

  // Infer from group memberships
  for (const membership of userContext.groupMemberships) {
    // Extract topics from group name (simple keyword extraction)
    const keywords = extractKeywords(membership.groupName);
    for (const keyword of keywords) {
      const existing = inferred.get(keyword);
      if (existing) {
        // Boost score if already present
        existing.score = Math.min(existing.score + 10, 100);
      } else {
        inferred.set(keyword, {
          topic: keyword,
          score: 60, // Medium confidence from group membership
          derivedFrom: 'post',
          lastUpdated: new Date(),
        });
      }
    }
  }

  // Infer from event attendance
  for (const event of userContext.eventAttendance) {
    const keywords = extractKeywords(event.eventName);
    for (const keyword of keywords) {
      const existing = inferred.get(keyword);
      if (existing) {
        existing.score = Math.min(existing.score + 8, 100);
      } else {
        inferred.set(keyword, {
          topic: keyword,
          score: 50, // Lower confidence from event attendance
          derivedFrom: 'event_attendance',
          lastUpdated: new Date(),
        });
      }
    }
  }

  // Related interest expansion (semantic clustering)
  const expanded = expandRelatedInterests(Array.from(inferred.values()));
  for (const interest of expanded) {
    if (!inferred.has(interest.topic)) {
      inferred.set(interest.topic, interest);
    }
  }

  return Array.from(inferred.values())
    .sort((a, b) => b.score - a.score); // Highest confidence first
}

/**
 * Extract keywords from text
 * Simple implementation - could be enhanced with NLP
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with']);

  return text
    .toLowerCase()
    .split(/[\s-]+/)
    .filter(word => word.length > 3 && !stopWords.has(word))
    .filter(word => /^[a-z]+$/.test(word)); // Only alphabetic words
}

/**
 * Expand interests based on semantic relationships
 * Phase 3: Semantic clustering for related interests
 */
function expandRelatedInterests(interests: InterestScore[]): InterestScore[] {
  const expanded: InterestScore[] = [];

  // Interest clusters (simplified version - could use embeddings/ML in production)
  const clusters: Record<string, string[]> = {
    housing: ['cooperative', 'community', 'affordable', 'cohousing', 'shelter'],
    climate: ['environment', 'sustainability', 'ecology', 'green', 'renewable'],
    food: ['agriculture', 'garden', 'farming', 'nutrition', 'local'],
    technology: ['software', 'digital', 'open-source', 'tech', 'innovation'],
    governance: ['democracy', 'voting', 'decision', 'consensus', 'participation'],
    economy: ['cooperative', 'mutual', 'timebank', 'trade', 'exchange'],
  };

  for (const interest of interests) {
    for (const [cluster, related] of Object.entries(clusters)) {
      // If interest matches cluster topic
      if (interest.topic.includes(cluster) || cluster.includes(interest.topic)) {
        // Add related topics with reduced confidence
        for (const relatedTopic of related) {
          if (!interests.find(i => i.topic === relatedTopic)) {
            expanded.push({
              topic: relatedTopic,
              score: Math.round(interest.score * 0.6), // 60% of original confidence
              derivedFrom: interest.derivedFrom,
              lastUpdated: new Date(),
            });
          }
        }
      }
    }
  }

  return expanded;
}

/**
 * Generate group recommendations
 * Phase 3: Group discovery recommendations
 */
export function generateGroupRecommendations(
  userContext: UserContext,
  cityContext: CityContext,
  inferredInterests: InterestScore[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Find groups user hasn't joined
  const joinedGroupIds = new Set(userContext.groupMemberships.map(m => m.groupId));
  const unjoinedGroups = cityContext.activeGroups.filter(g => !joinedGroupIds.has(g.id));

  for (const group of unjoinedGroups) {
    const relevance = scoreGroupRelevance(group, inferredInterests, userContext);

    if (relevance.score >= 40) { // Only recommend if reasonably relevant
      recommendations.push({
        id: nanoid(),
        userId: userContext.userId,
        type: 'local_group',
        title: `Join "${group.name}"`,
        description: generateRecommendation('local_group', {
          interest: relevance.matchedInterests[0] || 'community building',
          city: cityContext.city,
          groupName: group.name,
          memberCount: group.memberCount,
          rewardPoints: 50,
        }),
        targetId: group.id,
        targetUrl: `/groups/${group.id}`,
        relevanceScore: relevance.score,
        matchedInterests: relevance.matchedInterests,
        cityContext: cityContext.city,
        rewardPoints: 50,
        urgency: relevance.score >= 70 ? 'high' : relevance.score >= 50 ? 'medium' : 'low',
        status: 'pending',
        nudgeCount: 0,
        maxNudges: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  return recommendations;
}

/**
 * Generate event recommendations
 * Phase 3: Event recommendations
 */
export function generateEventRecommendations(
  userContext: UserContext,
  cityContext: CityContext,
  inferredInterests: InterestScore[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  for (const event of cityContext.upcomingEvents) {
    const relevance = scoreEventRelevance(event, inferredInterests, userContext);

    if (relevance.score >= 40) {
      recommendations.push({
        id: nanoid(),
        userId: userContext.userId,
        type: 'event',
        title: `Attend "${event.title}"`,
        description: generateRecommendation('event', {
          date: event.date.toLocaleDateString(),
          eventTitle: event.title,
          location: event.location,
          topics: event.topics.join(', '),
          userInterest: relevance.matchedInterests[0] || 'community',
          rsvpCount: event.rsvpCount,
        }),
        targetId: event.id,
        targetUrl: `/events/${event.id}`,
        relevanceScore: relevance.score,
        matchedInterests: relevance.matchedInterests,
        cityContext: cityContext.city,
        rewardPoints: 25,
        urgency: getDaysUntil(event.date) <= 7 ? 'high' : 'medium',
        status: 'pending',
        nudgeCount: 0,
        maxNudges: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  return recommendations;
}

/**
 * Generate activity recommendations
 */
export function generateActivityRecommendations(
  userContext: UserContext,
  cityContext: CityContext
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const topActivities = matchActivities(userContext, cityContext, 3);

  for (const { activity, relevanceScore, matchReasons } of topActivities) {
    if (relevanceScore >= 40) {
      recommendations.push({
        id: nanoid(),
        userId: userContext.userId,
        type: 'activity',
        title: `Try "${activity.name}"`,
        description: generateRecommendation('activity', {
          memberCount: cityContext.totalGroupMembers,
          city: cityContext.city,
          activityName: activity.name,
          difficulty: activity.difficulty,
          timeCommitment: activity.timeCommitment,
          description: activity.description,
          rewardPoints: activity.rewardPoints,
        }),
        targetId: activity.name.toLowerCase().replace(/\s+/g, '-'),
        relevanceScore,
        matchedInterests: matchReasons,
        cityContext: cityContext.city,
        rewardPoints: activity.rewardPoints,
        urgency: 'low',
        status: 'pending',
        nudgeCount: 0,
        maxNudges: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  return recommendations;
}

/**
 * Score group relevance to user
 * Phase 3: Relevance scoring for groups
 */
export function scoreGroupRelevance(
  group: GroupSummary,
  interests: InterestScore[],
  userContext: UserContext
): { score: number; matchedInterests: string[] } {
  let score = 0;
  const matchedInterests: string[] = [];

  // Check topic overlap with user interests
  for (const topic of group.topics) {
    const interest = interests.find(i =>
      i.topic.toLowerCase().includes(topic.toLowerCase()) ||
      topic.toLowerCase().includes(i.topic.toLowerCase())
    );

    if (interest) {
      score += Math.round(interest.score * 0.5); // Scale interest score
      matchedInterests.push(interest.topic);
    }
  }

  // Boost if group category matches explicit interests
  for (const explicitInterest of userContext.explicitInterests) {
    if (group.category.toLowerCase().includes(explicitInterest.toLowerCase())) {
      score += 20;
      if (!matchedInterests.includes(explicitInterest)) {
        matchedInterests.push(explicitInterest);
      }
    }
  }

  // Penalize if group is very large or very small
  if (group.memberCount < 5) score -= 10; // Too small
  if (group.memberCount > 100) score -= 5; // Maybe too large

  // Boost if group is active
  const daysSinceActivity = (Date.now() - group.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceActivity < 7) score += 10;

  return {
    score: Math.min(Math.max(score, 0), 100),
    matchedInterests: matchedInterests.slice(0, 3),
  };
}

/**
 * Score event relevance to user
 * Phase 3: Relevance scoring for events
 */
export function scoreEventRelevance(
  event: EventSummary,
  interests: InterestScore[],
  userContext: UserContext
): { score: number; matchedInterests: string[] } {
  let score = 0;
  const matchedInterests: string[] = [];

  // Check topic overlap
  for (const topic of event.topics) {
    const interest = interests.find(i =>
      i.topic.toLowerCase().includes(topic.toLowerCase()) ||
      topic.toLowerCase().includes(i.topic.toLowerCase())
    );

    if (interest) {
      score += Math.round(interest.score * 0.6);
      matchedInterests.push(interest.topic);
    }
  }

  // Boost if event is soon (urgency)
  const daysUntil = getDaysUntil(event.date);
  if (daysUntil <= 3) score += 20;
  else if (daysUntil <= 7) score += 10;

  // Boost if many people are attending
  if (event.rsvpCount > 20) score += 10;
  else if (event.rsvpCount > 10) score += 5;

  return {
    score: Math.min(Math.max(score, 0), 100),
    matchedInterests: matchedInterests.slice(0, 3),
  };
}

/**
 * Helper: Get days until date
 */
function getDaysUntil(date: Date): number {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
