/**
 * Recommendation Repository Interface
 * Phase 4: Database integration for storing recommendation states
 */

import type { Recommendation, RecommendationStatus } from '@togetheros/types';

export interface RecommendationFilters {
  userId?: string;
  status?: RecommendationStatus;
  type?: string;
  minRelevance?: number;
  limit?: number;
  offset?: number;
}

export interface RecommendationActionInput {
  recommendationId: string;
  userId: string;
  action: 'act' | 'dismiss';
}

export interface GenerateRecommendationsInput {
  userId: string;
  maxRecommendations?: number;
}

export interface RecommendationRepo {
  /**
   * Store generated recommendations
   */
  saveRecommendations(recommendations: Recommendation[]): Promise<void>;

  /**
   * Get recommendations for a user
   */
  getRecommendations(filters: RecommendationFilters): Promise<Recommendation[]>;

  /**
   * Get single recommendation by ID
   */
  getById(id: string): Promise<Recommendation | null>;

  /**
   * Mark recommendation as shown
   */
  markAsShown(recommendationId: string): Promise<void>;

  /**
   * Mark recommendation as acted on
   */
  markAsActedOn(recommendationId: string): Promise<void>;

  /**
   * Mark recommendation as dismissed
   */
  markAsDismissed(recommendationId: string): Promise<void>;

  /**
   * Increment nudge count
   */
  incrementNudgeCount(recommendationId: string): Promise<void>;

  /**
   * Get active recommendations (pending, not max nudged)
   */
  getActiveRecommendations(userId: string, limit?: number): Promise<Recommendation[]>;

  /**
   * Clean up old recommendations
   */
  cleanupOldRecommendations(olderThanDays: number): Promise<number>;
}
