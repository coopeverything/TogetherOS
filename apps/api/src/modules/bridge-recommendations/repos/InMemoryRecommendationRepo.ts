/**
 * In-Memory Recommendation Repository
 * Phase 4: MVP implementation for storing recommendation states
 */

import type { Recommendation } from '@togetheros/types';
import type {
  RecommendationRepo,
  RecommendationFilters,
} from './RecommendationRepo';

export class InMemoryRecommendationRepo implements RecommendationRepo {
  private recommendations: Map<string, Recommendation> = new Map();

  async saveRecommendations(recommendations: Recommendation[]): Promise<void> {
    for (const rec of recommendations) {
      this.recommendations.set(rec.id, { ...rec });
    }
  }

  async getRecommendations(filters: RecommendationFilters): Promise<Recommendation[]> {
    let results = Array.from(this.recommendations.values());

    // Apply filters
    if (filters.userId) {
      results = results.filter(r => r.userId === filters.userId);
    }

    if (filters.status) {
      results = results.filter(r => r.status === filters.status);
    }

    if (filters.type) {
      results = results.filter(r => r.type === filters.type);
    }

    if (filters.minRelevance !== undefined) {
      const minRelevance = filters.minRelevance;
      results = results.filter(r => r.relevanceScore >= minRelevance);
    }

    // Sort by relevance score (highest first)
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Apply pagination
    const offset = filters.offset || 0;
    const limit = filters.limit || results.length;
    results = results.slice(offset, offset + limit);

    return results;
  }

  async getById(id: string): Promise<Recommendation | null> {
    return this.recommendations.get(id) || null;
  }

  async markAsShown(recommendationId: string): Promise<void> {
    const rec = this.recommendations.get(recommendationId);
    if (rec) {
      rec.status = 'shown';
      rec.shownAt = new Date();
      rec.updatedAt = new Date();
      this.recommendations.set(recommendationId, rec);
    }
  }

  async markAsActedOn(recommendationId: string): Promise<void> {
    const rec = this.recommendations.get(recommendationId);
    if (rec) {
      rec.status = 'acted_on';
      rec.actedOnAt = new Date();
      rec.updatedAt = new Date();
      this.recommendations.set(recommendationId, rec);
    }
  }

  async markAsDismissed(recommendationId: string): Promise<void> {
    const rec = this.recommendations.get(recommendationId);
    if (rec) {
      rec.status = 'dismissed';
      rec.dismissedAt = new Date();
      rec.updatedAt = new Date();
      this.recommendations.set(recommendationId, rec);
    }
  }

  async incrementNudgeCount(recommendationId: string): Promise<void> {
    const rec = this.recommendations.get(recommendationId);
    if (rec) {
      rec.nudgeCount += 1;
      rec.updatedAt = new Date();
      this.recommendations.set(recommendationId, rec);
    }
  }

  async getActiveRecommendations(userId: string, limit: number = 5): Promise<Recommendation[]> {
    return this.getRecommendations({
      userId,
      status: 'pending',
      limit,
    }).then(recs =>
      recs.filter(r => r.nudgeCount < r.maxNudges)
    );
  }

  async cleanupOldRecommendations(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    let deletedCount = 0;
    for (const [id, rec] of this.recommendations.entries()) {
      if (rec.createdAt < cutoffDate && (rec.status === 'acted_on' || rec.status === 'dismissed')) {
        this.recommendations.delete(id);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  // Helper method for testing
  clear(): void {
    this.recommendations.clear();
  }

  // Helper method for testing
  getAll(): Recommendation[] {
    return Array.from(this.recommendations.values());
  }
}

// Singleton instance
export const recommendationRepo = new InMemoryRecommendationRepo();
