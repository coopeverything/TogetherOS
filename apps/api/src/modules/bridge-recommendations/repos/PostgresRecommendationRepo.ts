/**
 * PostgreSQL Recommendation Repository
 * Production implementation using real database
 */

import type { Recommendation } from '@togetheros/types';
import type {
  RecommendationRepo,
  RecommendationFilters,
} from './RecommendationRepo';
import { query } from '../../../../../../lib/db';

export class PostgresRecommendationRepo implements RecommendationRepo {
  async saveRecommendations(recommendations: Recommendation[]): Promise<void> {
    if (recommendations.length === 0) return;

    // Build bulk insert query
    const values: any[] = [];
    const placeholders = recommendations.map((rec, i) => {
      const base = i * 14;
      values.push(
        rec.id,
        rec.userId,
        rec.type,
        rec.title,
        rec.description,
        rec.matchedInterests,
        rec.cityContext || null,
        rec.relevanceScore,
        rec.urgency || 'medium',
        rec.status,
        rec.nudgeCount,
        rec.maxNudges,
        rec.createdAt,
        JSON.stringify({
          targetId: rec.targetId,
          targetUrl: rec.targetUrl,
          rewardPoints: rec.rewardPoints,
        })
      );

      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}, $${base + 11}, $${base + 12}, $${base + 13}, $${base + 14})`;
    }).join(', ');

    const sql = `
      INSERT INTO bridge_recommendations (
        id, user_id, type, title, description, matched_interests,
        city_context, relevance_score, urgency, status,
        nudge_count, max_nudges, created_at, metadata
      )
      VALUES ${placeholders}
      ON CONFLICT (id) DO UPDATE SET
        updated_at = NOW(),
        status = EXCLUDED.status,
        nudge_count = EXCLUDED.nudge_count,
        shown_at = EXCLUDED.shown_at,
        acted_on_at = EXCLUDED.acted_on_at,
        dismissed_at = EXCLUDED.dismissed_at
    `;

    await query(sql, values);
  }

  async getRecommendations(filters: RecommendationFilters): Promise<Recommendation[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.userId) {
      conditions.push(`user_id = $${paramIndex++}`);
      values.push(filters.userId);
    }

    if (filters.status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(filters.status);
    }

    if (filters.type) {
      conditions.push(`type = $${paramIndex++}`);
      values.push(filters.type);
    }

    if (filters.minRelevance !== undefined) {
      conditions.push(`relevance_score >= $${paramIndex++}`);
      values.push(filters.minRelevance);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = filters.offset || 0;
    const limit = filters.limit || 10;

    const sql = `
      SELECT
        id, user_id as "userId", type, title, description,
        matched_interests as "matchedInterests", city_context as "cityContext",
        relevance_score as "relevanceScore", urgency, status,
        nudge_count as "nudgeCount", max_nudges as "maxNudges",
        created_at as "createdAt", updated_at as "updatedAt",
        shown_at as "shownAt", acted_on_at as "actedOnAt",
        dismissed_at as "dismissedAt", metadata
      FROM bridge_recommendations
      ${whereClause}
      ORDER BY relevance_score DESC
      LIMIT $${paramIndex++}
      OFFSET $${paramIndex++}
    `;

    values.push(limit, offset);

    const result = await query<any>(sql, values);

    return result.rows.map(this.rowToRecommendation);
  }

  async getById(id: string): Promise<Recommendation | null> {
    const sql = `
      SELECT
        id, user_id as "userId", type, title, description,
        matched_interests as "matchedInterests", city_context as "cityContext",
        relevance_score as "relevanceScore", urgency, status,
        nudge_count as "nudgeCount", max_nudges as "maxNudges",
        created_at as "createdAt", updated_at as "updatedAt",
        shown_at as "shownAt", acted_on_at as "actedOnAt",
        dismissed_at as "dismissedAt", metadata
      FROM bridge_recommendations
      WHERE id = $1
    `;

    const result = await query<any>(sql, [id]);

    return result.rows.length > 0 ? this.rowToRecommendation(result.rows[0]) : null;
  }

  async markAsShown(recommendationId: string): Promise<void> {
    const sql = `
      UPDATE bridge_recommendations
      SET status = 'shown',
          shown_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
    `;

    await query(sql, [recommendationId]);
  }

  async markAsActedOn(recommendationId: string): Promise<void> {
    const sql = `
      UPDATE bridge_recommendations
      SET status = 'acted_on',
          acted_on_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
    `;

    await query(sql, [recommendationId]);
  }

  async markAsDismissed(recommendationId: string): Promise<void> {
    const sql = `
      UPDATE bridge_recommendations
      SET status = 'dismissed',
          dismissed_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
    `;

    await query(sql, [recommendationId]);
  }

  async incrementNudgeCount(recommendationId: string): Promise<void> {
    const sql = `
      UPDATE bridge_recommendations
      SET nudge_count = nudge_count + 1,
          updated_at = NOW()
      WHERE id = $1
    `;

    await query(sql, [recommendationId]);
  }

  async getActiveRecommendations(userId: string, limit: number = 5): Promise<Recommendation[]> {
    const sql = `
      SELECT
        id, user_id as "userId", type, title, description,
        matched_interests as "matchedInterests", city_context as "cityContext",
        relevance_score as "relevanceScore", urgency, status,
        nudge_count as "nudgeCount", max_nudges as "maxNudges",
        created_at as "createdAt", updated_at as "updatedAt",
        shown_at as "shownAt", acted_on_at as "actedOnAt",
        dismissed_at as "dismissedAt", metadata
      FROM bridge_recommendations
      WHERE user_id = $1
        AND status = 'pending'
        AND nudge_count < max_nudges
      ORDER BY relevance_score DESC
      LIMIT $2
    `;

    const result = await query<any>(sql, [userId, limit]);

    return result.rows.map(this.rowToRecommendation);
  }

  async cleanupOldRecommendations(olderThanDays: number): Promise<number> {
    const sql = `
      DELETE FROM bridge_recommendations
      WHERE created_at < NOW() - INTERVAL '${olderThanDays} days'
        AND status IN ('acted_on', 'dismissed')
      RETURNING id
    `;

    const result = await query(sql);

    return result.rowCount || 0;
  }

  /**
   * Convert database row to Recommendation type
   */
  private rowToRecommendation(row: any): Recommendation {
    const metadata = row.metadata || {};
    return {
      id: row.id,
      userId: row.userId,
      type: row.type,
      title: row.title,
      description: row.description,
      targetId: metadata.targetId || '',
      targetUrl: metadata.targetUrl,
      matchedInterests: row.matchedInterests || [],
      cityContext: row.cityContext,
      relevanceScore: row.relevanceScore,
      rewardPoints: metadata.rewardPoints,
      urgency: row.urgency,
      status: row.status,
      nudgeCount: row.nudgeCount,
      maxNudges: row.maxNudges,
      shownAt: row.shownAt,
      actedOnAt: row.actedOnAt,
      dismissedAt: row.dismissedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

// Singleton instance
export const recommendationRepo = new PostgresRecommendationRepo();
