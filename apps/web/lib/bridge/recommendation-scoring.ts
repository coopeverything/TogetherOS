/**
 * Recommendation Scoring Algorithm
 * Calculates relevance scores with improved weighting
 */

import type { UserContext, CityContext, Recommendation } from '@togetheros/types';

export interface ScoringFactors {
  interestMatch: number; // 0-40 points
  engagementLevel: number; // 0-20 points
  urgency: number; // 0-15 points
  cityRelevance: number; // 0-15 points
  recency: number; // 0-10 points
}

/**
 * Calculate comprehensive relevance score
 */
export function calculateRelevanceScore(
  recommendation: Partial<Recommendation>,
  userContext: UserContext,
  cityContext: CityContext
): { score: number; factors: ScoringFactors } {
  const factors: ScoringFactors = {
    interestMatch: 0,
    engagementLevel: 0,
    urgency: 0,
    cityRelevance: 0,
    recency: 0,
  };

  // 1. Interest Match (0-40 points) - Most important factor
  const matched = recommendation.matchedInterests || [];
  const explicit = userContext.explicitInterests || [];
  const implicit = userContext.implicitInterests || [];

  // Explicit interests are worth more (2x)
  const explicitMatches = matched.filter(i => explicit.includes(i)).length;
  factors.interestMatch += explicitMatches * 10;

  // Implicit interests weighted by score
  const implicitMatches = matched.filter(i =>
    implicit.some(ii => ii.topic === i && ii.score > 50)
  );
  factors.interestMatch += implicitMatches.length * 5;

  // Cap at 40
  factors.interestMatch = Math.min(40, factors.interestMatch);

  // 2. Engagement Level (0-20 points)
  // More engaged users get slightly higher scores for active opportunities
  const engagementScore = userContext.engagementScore || 0;
  if (recommendation.type === 'event' || recommendation.type === 'activity') {
    factors.engagementLevel = Math.round((engagementScore / 100) * 20);
  } else {
    // Groups and discussions benefit less engaged users
    factors.engagementLevel = Math.round(((100 - engagementScore) / 100) * 10);
  }

  // 3. Urgency (0-15 points)
  const urgencyMap = {
    high: 15,
    medium: 8,
    low: 3,
  };
  factors.urgency = urgencyMap[recommendation.urgency || 'medium'];

  // 4. City Relevance (0-15 points)
  const inUserCity = recommendation.cityContext === userContext.city;
  factors.cityRelevance = inUserCity ? 15 : 5;

  // 5. Recency (0-10 points)
  // Boost newer recommendations slightly
  const now = Date.now();
  const created = recommendation.createdAt ? new Date(recommendation.createdAt).getTime() : now;
  const ageHours = (now - created) / (1000 * 60 * 60);
  factors.recency = Math.max(0, 10 - Math.floor(ageHours / 24));

  // Calculate total score
  const score = Math.min(100,
    factors.interestMatch +
    factors.engagementLevel +
    factors.urgency +
    factors.cityRelevance +
    factors.recency
  );

  return { score, factors };
}

/**
 * Apply diversity filtering to recommendations
 * Ensures variety in recommendation types
 */
export function applyDiversityFilter(
  recommendations: Recommendation[],
  maxPerType: number = 2
): Recommendation[] {
  const typeCounts: Record<string, number> = {};
  const diverse: Recommendation[] = [];

  // Sort by relevance first
  const sorted = [...recommendations].sort((a, b) => b.relevanceScore - a.relevanceScore);

  for (const rec of sorted) {
    const count = typeCounts[rec.type] || 0;

    if (count < maxPerType) {
      diverse.push(rec);
      typeCounts[rec.type] = count + 1;
    }

    // Stop when we have enough
    if (diverse.length >= 10) break;
  }

  return diverse;
}

/**
 * Boost scores for trending topics in user's city
 */
export function boostTrendingTopics(
  recommendations: Recommendation[],
  cityContext: CityContext,
  boostAmount: number = 5
): Recommendation[] {
  const trending = new Set(cityContext.trendingTopics || []);

  return recommendations.map(rec => {
    const hasTrendingTopic = rec.matchedInterests.some(i => trending.has(i));

    if (hasTrendingTopic) {
      return {
        ...rec,
        relevanceScore: Math.min(100, rec.relevanceScore + boostAmount),
      };
    }

    return rec;
  });
}
