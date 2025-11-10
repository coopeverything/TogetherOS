/**
 * DecisionLoopRepo
 * Repository interface for 5-phase decision loop cycles
 */

import type {
  DecisionCycle,
  SensePhase,
  FramePhase,
  ChoosePhase,
  ActPhase,
  LearnPhase,
} from '@togetheros/types';

export interface DecisionLoopRepo {
  /**
   * Create a new decision cycle
   */
  createCycle(input: {
    userId: string;
    sessionId: string;
    sense: SensePhase;
    frame: FramePhase;
    choose: ChoosePhase;
    act: ActPhase;
    learn: LearnPhase;
    startedAt: Date;
    completedAt: Date;
  }): Promise<DecisionCycle>;

  /**
   * Get recent decision cycles for a user
   */
  getRecentCycles(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<DecisionCycle[]>;

  /**
   * Get decision cycles for a session
   */
  getSessionCycles(sessionId: string): Promise<DecisionCycle[]>;

  /**
   * Get decision cycle stats
   */
  getCycleStats(userId: string): Promise<{
    totalCycles: number;
    averageDurationMs: number;
    actionDistribution: Record<string, number>; // Counts by intervention type
    successRate: number; // % of cycles where member responded positively
  }>;

  /**
   * Get cycles by member state
   */
  getCyclesByState(
    userId: string,
    memberState: string
  ): Promise<DecisionCycle[]>;
}
