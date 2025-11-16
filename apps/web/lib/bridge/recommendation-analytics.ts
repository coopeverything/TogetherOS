/**
 * Recommendation Analytics Tracking
 * Tracks impressions, clicks, actions, and dismissals
 */

import { query } from '@togetheros/db';

export type MetricEventType = 'impression' | 'click' | 'action' | 'dismiss';

export interface TrackMetricInput {
  recommendationId: string;
  userId: string;
  eventType: MetricEventType;
  source?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  metadata?: Record<string, any>;
}

export interface RecommendationPerformance {
  recommendationId: string;
  type: string;
  relevanceScore: number;
  urgency: string;
  impressions: number;
  clicks: number;
  actions: number;
  dismissals: number;
  clickThroughRate: number; // Percentage
  conversionRate: number; // Percentage
}

/**
 * Track a metric event
 */
export async function trackMetric(input: TrackMetricInput): Promise<void> {
  try {
    await query(
      `
      INSERT INTO recommendation_metrics (
        recommendation_id, user_id, event_type,
        source, device_type, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        input.recommendationId,
        input.userId,
        input.eventType,
        input.source || null,
        input.deviceType || null,
        input.metadata ? JSON.stringify(input.metadata) : '{}',
      ]
    );
  } catch (error) {
    console.error('Failed to track metric:', error);
    // Don't throw - analytics failures shouldn't break user experience
  }
}

/**
 * Track impression (recommendation shown to user)
 */
export async function trackImpression(
  recommendationId: string,
  userId: string,
  source?: string
): Promise<void> {
  await trackMetric({
    recommendationId,
    userId,
    eventType: 'impression',
    source,
  });
}

/**
 * Track click (user clicked on recommendation)
 */
export async function trackClick(
  recommendationId: string,
  userId: string,
  source?: string
): Promise<void> {
  await trackMetric({
    recommendationId,
    userId,
    eventType: 'click',
    source,
  });
}

/**
 * Track action (user took action on recommendation)
 */
export async function trackAction(
  recommendationId: string,
  userId: string,
  source?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await trackMetric({
    recommendationId,
    userId,
    eventType: 'action',
    source,
    metadata,
  });
}

/**
 * Track dismissal (user dismissed recommendation)
 */
export async function trackDismissal(
  recommendationId: string,
  userId: string,
  source?: string
): Promise<void> {
  await trackMetric({
    recommendationId,
    userId,
    eventType: 'dismiss',
    source,
  });
}

/**
 * Get performance metrics for a recommendation
 */
export async function getRecommendationPerformance(
  recommendationId: string
): Promise<RecommendationPerformance | null> {
  try {
    const result = await query<{
      recommendation_id: string;
      type: string;
      relevance_score: number;
      urgency: string;
      impressions: number;
      clicks: number;
      actions: number;
      dismissals: number;
      click_through_rate: number;
      conversion_rate: number;
    }>(
      `
      SELECT * FROM recommendation_performance
      WHERE recommendation_id = $1
      `,
      [recommendationId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      recommendationId: row.recommendation_id,
      type: row.type,
      relevanceScore: row.relevance_score,
      urgency: row.urgency,
      impressions: Number(row.impressions),
      clicks: Number(row.clicks),
      actions: Number(row.actions),
      dismissals: Number(row.dismissals),
      clickThroughRate: Number(row.click_through_rate),
      conversionRate: Number(row.conversion_rate),
    };
  } catch (error) {
    console.error('Failed to get recommendation performance:', error);
    return null;
  }
}

/**
 * Get top performing recommendations by type
 */
export async function getTopPerformingRecommendations(
  type?: string,
  limit: number = 10
): Promise<RecommendationPerformance[]> {
  try {
    const typeFilter = type ? 'WHERE type = $1' : '';
    const params = type ? [type, limit] : [limit];
    const limitParam = type ? '$2' : '$1';

    const result = await query<{
      recommendation_id: string;
      type: string;
      relevance_score: number;
      urgency: string;
      impressions: number;
      clicks: number;
      actions: number;
      dismissals: number;
      click_through_rate: number;
      conversion_rate: number;
    }>(
      `
      SELECT * FROM recommendation_performance
      ${typeFilter}
      ORDER BY conversion_rate DESC, click_through_rate DESC
      LIMIT ${limitParam}
      `,
      params
    );

    return result.rows.map(row => ({
      recommendationId: row.recommendation_id,
      type: row.type,
      relevanceScore: row.relevance_score,
      urgency: row.urgency,
      impressions: Number(row.impressions),
      clicks: Number(row.clicks),
      actions: Number(row.actions),
      dismissals: Number(row.dismissals),
      clickThroughRate: Number(row.click_through_rate),
      conversionRate: Number(row.conversion_rate),
    }));
  } catch (error) {
    console.error('Failed to get top performing recommendations:', error);
    return [];
  }
}

/**
 * Refresh performance materialized view
 * Call this periodically (e.g., hourly) to update analytics
 */
export async function refreshPerformanceView(): Promise<void> {
  try {
    await query('SELECT refresh_recommendation_performance()');
  } catch (error) {
    console.error('Failed to refresh performance view:', error);
  }
}
