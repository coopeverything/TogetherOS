/**
 * MemberStateRepo
 * Repository interface for member behavioral state classifications
 */

import type {
  MemberState,
  MemberStateClassification,
  MemberStateSignals,
} from '@togetheros/types';

export interface MemberStateRepo {
  /**
   * Create a new state classification
   */
  createClassification(input: {
    userId: string;
    sessionId: string;
    state: MemberState;
    confidence: number;
    reasoning: string;
    signals: MemberStateSignals;
  }): Promise<MemberStateClassification>;

  /**
   * Get the most recent classification for a user
   */
  getLatestClassification(userId: string): Promise<MemberStateClassification | null>;

  /**
   * Get all classifications for a user (paginated)
   */
  getClassificationHistory(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<MemberStateClassification[]>;

  /**
   * Get classifications for a session
   */
  getSessionClassifications(sessionId: string): Promise<MemberStateClassification[]>;

  /**
   * Get classification stats for a user
   */
  getClassificationStats(userId: string): Promise<{
    totalClassifications: number;
    stateDistribution: Record<MemberState, number>;
    averageConfidence: number;
  }>;
}
