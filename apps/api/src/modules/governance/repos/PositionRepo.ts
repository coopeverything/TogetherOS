/**
 * Position Repository Interface
 * Defines the contract for position data access
 */

import type { Position, PositionStance } from '@togetheros/types';

export interface IPositionRepo {
  /**
   * Add or update a member's position on a proposal
   */
  addOrUpdatePosition(params: {
    proposalId: string;
    memberId: string;
    stance: PositionStance;
    reasoning: string;
    isMinority?: boolean;
  }): Promise<Position>;

  /**
   * Get all positions for a proposal
   */
  getPositionsByProposal(proposalId: string): Promise<Position[]>;

  /**
   * Get a specific member's position on a proposal
   */
  getMemberPosition(proposalId: string, memberId: string): Promise<Position | null>;

  /**
   * Delete a member's position
   */
  deletePosition(proposalId: string, memberId: string): Promise<boolean>;

  /**
   * Mark positions as minority based on decision outcome
   */
  markMinorityPositions(proposalId: string, minorityStances: PositionStance[]): Promise<void>;

  /**
   * Get all minority positions for a proposal
   */
  getMinorityPositions(proposalId: string): Promise<Position[]>;

  /**
   * Get position statistics for a proposal
   */
  getPositionStats(proposalId: string): Promise<{
    total: number;
    support: number;
    oppose: number;
    abstain: number;
    block: number;
    minorityCount: number;
  }>;
}
