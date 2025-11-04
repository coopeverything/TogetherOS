/**
 * Background Job System for Recommendation Generation
 * Generates recommendations in batches for active users
 */

import { query } from '../../../../lib/db';
import { fetchUserContext, fetchCityContext } from './context-service';
import { generateRecommendations } from './recommendation-generator';
import { PostgresRecommendationRepo } from '../../../api/src/modules/bridge-recommendations/repos/PostgresRecommendationRepo';

const recommendationRepo = new PostgresRecommendationRepo();

export interface JobResult {
  success: boolean;
  usersProcessed: number;
  recommendationsGenerated: number;
  errors: number;
  duration: number;
  errorMessages?: string[];
}

/**
 * Generate recommendations for all active users
 * Active = logged in within last 30 days
 */
export async function generateRecommendationsForActiveUsers(
  batchSize: number = 100,
  maxBatches: number = 10
): Promise<JobResult> {
  const startTime = Date.now();
  let usersProcessed = 0;
  let recommendationsGenerated = 0;
  let errors = 0;
  const errorMessages: string[] = [];

  try {
    // Get active users in batches
    for (let batch = 0; batch < maxBatches; batch++) {
      const offset = batch * batchSize;

      // Query active users
      const usersResult = await query<{ id: string; city: string; state: string }>(
        `
        SELECT id, city, state
        FROM users
        WHERE deleted_at IS NULL
          AND last_seen_at > NOW() - INTERVAL '30 days'
          AND onboarding_completed_at IS NOT NULL
        ORDER BY last_seen_at DESC
        LIMIT $1 OFFSET $2
        `,
        [batchSize, offset]
      );

      // No more users to process
      if (usersResult.rows.length === 0) {
        break;
      }

      // Process each user
      for (const user of usersResult.rows) {
        try {
          // Skip if user already has pending recommendations
          const existing = await recommendationRepo.getRecommendations({
            userId: user.id,
            status: 'pending',
            limit: 1,
          });

          if (existing.length > 0) {
            usersProcessed++;
            continue; // Skip - user already has recommendations
          }

          // Fetch user and city context
          const userContext = await fetchUserContext({ userId: user.id });
          const cityContext = await fetchCityContext({
            city: user.city || 'Unknown',
            region: user.state || 'Unknown',
          });

          // Generate recommendations
          const recommendations = await generateRecommendations(
            userContext,
            cityContext,
            5 // Max 5 recommendations per user
          );

          // Save to database
          if (recommendations.length > 0) {
            await recommendationRepo.saveRecommendations(recommendations);
            recommendationsGenerated += recommendations.length;
          }

          usersProcessed++;
        } catch (error) {
          errors++;
          const errorMsg = `User ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errorMessages.push(errorMsg);
          console.error('Error generating recommendations for user:', errorMsg);
        }
      }
    }

    const duration = Date.now() - startTime;

    return {
      success: true,
      usersProcessed,
      recommendationsGenerated,
      errors,
      duration,
      errorMessages: errorMessages.length > 0 ? errorMessages.slice(0, 10) : undefined, // Limit to first 10 errors
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      success: false,
      usersProcessed,
      recommendationsGenerated,
      errors: errors + 1,
      duration,
      errorMessages: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Cleanup old recommendations
 * Removes acted_on or dismissed recommendations older than specified days
 */
export async function cleanupOldRecommendations(olderThanDays: number = 30): Promise<number> {
  try {
    return await recommendationRepo.cleanupOldRecommendations(olderThanDays);
  } catch (error) {
    console.error('Error cleaning up old recommendations:', error);
    return 0;
  }
}

/**
 * Get job statistics
 */
export async function getJobStatistics(): Promise<{
  totalRecommendations: number;
  pendingRecommendations: number;
  actedOnRecommendations: number;
  dismissedRecommendations: number;
  averageRelevanceScore: number;
}> {
  try {
    const result = await query<{
      total: number;
      pending: number;
      acted_on: number;
      dismissed: number;
      avg_score: number;
    }>(
      `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'acted_on') as acted_on,
        COUNT(*) FILTER (WHERE status = 'dismissed') as dismissed,
        AVG(relevance_score) as avg_score
      FROM bridge_recommendations
      WHERE created_at > NOW() - INTERVAL '7 days'
      `
    );

    const row = result.rows[0];
    return {
      totalRecommendations: Number(row.total),
      pendingRecommendations: Number(row.pending),
      actedOnRecommendations: Number(row.acted_on),
      dismissedRecommendations: Number(row.dismissed),
      averageRelevanceScore: Number(row.avg_score) || 0,
    };
  } catch (error) {
    console.error('Error getting job statistics:', error);
    return {
      totalRecommendations: 0,
      pendingRecommendations: 0,
      actedOnRecommendations: 0,
      dismissedRecommendations: 0,
      averageRelevanceScore: 0,
    };
  }
}
