/**
 * PostgreSQL Position Repository
 * Production implementation using @togetheros/db package
 */

import type { Position, PositionStance } from '@togetheros/types';
import type { IPositionRepo } from './PositionRepo';
import {
  addOrUpdatePosition as addOrUpdatePositionDb,
  getProposalPositions,
  getMemberPosition as getMemberPositionDb,
  deletePosition as deletePositionDb,
  markMinorityPositions as markMinorityPositionsDb,
  getMinorityPositions as getMinorityPositionsDb,
  getPositionStats as getPositionStatsDb,
} from '@togetheros/db';

/**
 * PostgreSQL-backed position repository
 */
export class PostgresPositionRepo implements IPositionRepo {
  async addOrUpdatePosition(params: {
    proposalId: string;
    memberId: string;
    stance: PositionStance;
    reasoning: string;
    isMinority?: boolean;
  }): Promise<Position> {
    return await addOrUpdatePositionDb(
      params.proposalId,
      params.memberId,
      params.stance,
      params.reasoning,
      params.isMinority ?? false
    );
  }

  async getPositionsByProposal(proposalId: string): Promise<Position[]> {
    return await getProposalPositions(proposalId);
  }

  async getMemberPosition(proposalId: string, memberId: string): Promise<Position | null> {
    return await getMemberPositionDb(proposalId, memberId);
  }

  async deletePosition(proposalId: string, memberId: string): Promise<boolean> {
    await deletePositionDb(proposalId, memberId);
    return true;
  }

  async markMinorityPositions(proposalId: string, minorityStances: PositionStance[]): Promise<void> {
    await markMinorityPositionsDb(proposalId, minorityStances);
  }

  async getMinorityPositions(proposalId: string): Promise<Position[]> {
    return await getMinorityPositionsDb(proposalId);
  }

  async getPositionStats(proposalId: string): Promise<{
    total: number;
    support: number;
    oppose: number;
    abstain: number;
    block: number;
    minorityCount: number;
  }> {
    return await getPositionStatsDb(proposalId);
  }
}

// Singleton instance
export const positionRepo = new PostgresPositionRepo();
