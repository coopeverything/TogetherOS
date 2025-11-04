/**
 * Activity Matching Logic
 * Phase 2: Simple matching algorithm to suggest appropriate activities
 */

import type {
  UserContext,
  CityContext,
  ActivityRecommendation,
} from '@togetheros/types';
import { getActivitiesForCitySize } from './activities-data';

export interface ActivityMatch {
  activity: ActivityRecommendation;
  relevanceScore: number;
  matchReasons: string[];
}

/**
 * Match activities to user based on context
 * Returns activities sorted by relevance score (highest first)
 */
export function matchActivities(
  userContext: UserContext,
  cityContext: CityContext,
  maxResults: number = 3
): ActivityMatch[] {
  // Get activities appropriate for city size
  const activities = getActivitiesForCitySize(cityContext.totalGroupMembers);

  // Score each activity
  const matches = activities.map((activity) => {
    const { score, reasons } = scoreActivity(activity, userContext, cityContext);
    return {
      activity,
      relevanceScore: score,
      matchReasons: reasons,
    };
  });

  // Sort by relevance and return top N
  return matches
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxResults);
}

/**
 * Score an activity based on user and city context
 * Returns score (0-100) and reasons for the match
 */
function scoreActivity(
  activity: ActivityRecommendation,
  userContext: UserContext,
  cityContext: CityContext
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Base score: All activities start at 20
  score += 20;

  // Interest matching (max 30 points)
  const interestMatch = checkInterestMatch(
    activity,
    userContext.explicitInterests,
    userContext.implicitInterests
  );
  if (interestMatch.matched) {
    score += interestMatch.score;
    reasons.push(interestMatch.reason);
  }

  // Engagement level matching (max 20 points)
  const engagementMatch = checkEngagementMatch(activity, userContext.engagementScore);
  if (engagementMatch.matched) {
    score += engagementMatch.score;
    reasons.push(engagementMatch.reason);
  }

  // City trends matching (max 15 points)
  const trendMatch = checkCityTrendMatch(activity, cityContext.trendingTopics);
  if (trendMatch.matched) {
    score += trendMatch.score;
    reasons.push(trendMatch.reason);
  }

  // Prerequisites check (max 15 points)
  const prereqMatch = checkPrerequisites(activity, userContext, cityContext);
  if (prereqMatch.matched) {
    score += prereqMatch.score;
    reasons.push(prereqMatch.reason);
  }

  return { score: Math.min(score, 100), reasons };
}

/**
 * Check if activity matches user's interests
 */
function checkInterestMatch(
  activity: ActivityRecommendation,
  explicitInterests: string[],
  implicitInterests: { topic: string; score: number }[]
): { matched: boolean; score: number; reason: string } {
  const activityName = activity.name.toLowerCase();
  const activityDesc = activity.description.toLowerCase();

  // Check explicit interests
  for (const interest of explicitInterests) {
    if (activityName.includes(interest.toLowerCase()) || activityDesc.includes(interest.toLowerCase())) {
      return {
        matched: true,
        score: 30,
        reason: `Matches your interest in ${interest}`,
      };
    }
  }

  // Check implicit interests
  for (const interest of implicitInterests) {
    const topic = interest.topic.toLowerCase();
    if (activityName.includes(topic) || activityDesc.includes(topic)) {
      const score = Math.round((interest.score / 100) * 25); // Scale 0-100 to 0-25
      return {
        matched: true,
        score,
        reason: `Aligns with your demonstrated interest in ${interest.topic}`,
      };
    }
  }

  return { matched: false, score: 0, reason: '' };
}

/**
 * Check if activity difficulty matches user's engagement level
 */
function checkEngagementMatch(
  activity: ActivityRecommendation,
  engagementScore: number
): { matched: boolean; score: number; reason: string } {
  // High engagement users (70+) → prefer medium/hard activities
  if (engagementScore >= 70) {
    if (activity.difficulty === 'hard') {
      return {
        matched: true,
        score: 20,
        reason: "You're an active member ready for bigger challenges",
      };
    }
    if (activity.difficulty === 'medium') {
      return {
        matched: true,
        score: 15,
        reason: 'A good next step given your active participation',
      };
    }
  }

  // Medium engagement users (40-69) → prefer easy/medium activities
  if (engagementScore >= 40 && engagementScore < 70) {
    if (activity.difficulty === 'medium') {
      return {
        matched: true,
        score: 20,
        reason: 'A manageable challenge for your involvement level',
      };
    }
    if (activity.difficulty === 'easy') {
      return {
        matched: true,
        score: 15,
        reason: 'An accessible way to stay engaged',
      };
    }
  }

  // Low engagement users (<40) → prefer easy activities
  if (engagementScore < 40) {
    if (activity.difficulty === 'easy') {
      return {
        matched: true,
        score: 20,
        reason: 'A great starting point for building connections',
      };
    }
  }

  return { matched: false, score: 0, reason: '' };
}

/**
 * Check if activity aligns with city's trending topics
 */
function checkCityTrendMatch(
  activity: ActivityRecommendation,
  trendingTopics: string[]
): { matched: boolean; score: number; reason: string } {
  const activityName = activity.name.toLowerCase();
  const activityDesc = activity.description.toLowerCase();

  for (const topic of trendingTopics) {
    if (activityName.includes(topic.toLowerCase()) || activityDesc.includes(topic.toLowerCase())) {
      return {
        matched: true,
        score: 15,
        reason: `${topic} is trending in your city`,
      };
    }
  }

  return { matched: false, score: 0, reason: '' };
}

/**
 * Check if user/city likely has prerequisites
 * Simple heuristic based on context
 */
function checkPrerequisites(
  activity: ActivityRecommendation,
  userContext: UserContext,
  cityContext: CityContext
): { matched: boolean; score: number; reason: string } {
  // If no prerequisites, automatic match
  if (activity.prerequisites.length === 0) {
    return {
      matched: true,
      score: 15,
      reason: 'No prerequisites needed',
    };
  }

  // Simple heuristics for common prerequisites
  const prereqs = activity.prerequisites.map((p) => p.toLowerCase());

  // "coordinator" prerequisite → check if user is engaged enough
  if (prereqs.includes('coordinator') && userContext.engagementScore >= 60) {
    return {
      matched: true,
      score: 10,
      reason: 'Your engagement level suggests you could coordinate this',
    };
  }

  // "venue_access" → check if city has active groups (proxy for venue access)
  if (prereqs.includes('venue_access') && cityContext.activeGroups.length > 0) {
    return {
      matched: true,
      score: 10,
      reason: 'Your community likely has venue access through existing groups',
    };
  }

  // "storage_space" → similar to venue_access
  if (prereqs.includes('storage_space') && cityContext.activeGroups.length > 0) {
    return {
      matched: true,
      score: 10,
      reason: 'Storage space may be available through community connections',
    };
  }

  // Default: prerequisites may be a barrier but not blocking
  return {
    matched: true,
    score: 5,
    reason: `May require: ${activity.prerequisites.join(', ')}`,
  };
}

/**
 * Get top N activities for a user
 */
export function getTopActivities(
  userContext: UserContext,
  cityContext: CityContext,
  count: number = 3
): ActivityMatch[] {
  return matchActivities(userContext, cityContext, count);
}
