/**
 * Position Handlers
 * Business logic for member positions on governance proposals
 */

import { positionRepo } from '../repos/PostgresPositionRepo';
import type { Position, PositionStance } from '@togetheros/types';

/**
 * Add or update a member's position on a proposal
 */
export async function addOrUpdatePosition(params: {
  proposalId: string;
  memberId: string;
  stance: PositionStance;
  reasoning: string;
}): Promise<Position> {
  if (!params.reasoning || params.reasoning.trim().length < 10) {
    throw new Error('Position reasoning must be at least 10 characters');
  }

  return await positionRepo.addOrUpdatePosition({
    proposalId: params.proposalId,
    memberId: params.memberId,
    stance: params.stance,
    reasoning: params.reasoning.trim(),
  });
}

/**
 * Get all positions for a proposal
 */
export async function getProposalPositions(proposalId: string): Promise<Position[]> {
  return await positionRepo.getPositionsByProposal(proposalId);
}

/**
 * Get a specific member's position
 */
export async function getMemberPosition(
  proposalId: string,
  memberId: string
): Promise<Position | null> {
  return await positionRepo.getMemberPosition(proposalId, memberId);
}

/**
 * Delete a member's position
 * Only the member who created it can delete it
 */
export async function deletePosition(
  proposalId: string,
  memberId: string,
  requestingMemberId: string
): Promise<boolean> {
  if (memberId !== requestingMemberId) {
    throw new Error('Unauthorized: Can only delete your own position');
  }

  return await positionRepo.deletePosition(proposalId, memberId);
}

/**
 * Get position statistics for a proposal
 */
export async function getPositionStats(proposalId: string): Promise<{
  total: number;
  support: number;
  oppose: number;
  abstain: number;
  block: number;
  minorityCount: number;
}> {
  return await positionRepo.getPositionStats(proposalId);
}

/**
 * Mark minority positions after decision
 * Called when a proposal moves to decided status
 */
export async function finalizeMinorityPositions(
  proposalId: string,
  decisionOutcome: 'approved' | 'rejected' | 'amended'
): Promise<void> {
  // Determine which stances are minority based on outcome
  let minorityStances: PositionStance[] = [];

  if (decisionOutcome === 'approved') {
    // Approved: oppose and block are minority
    minorityStances = ['oppose', 'block'];
  } else if (decisionOutcome === 'rejected') {
    // Rejected: support is minority
    minorityStances = ['support'];
  }
  // For amended: no clear minority

  if (minorityStances.length > 0) {
    await positionRepo.markMinorityPositions(proposalId, minorityStances);
  }
}

/**
 * Get minority positions for a proposal
 */
export async function getMinorityPositions(proposalId: string): Promise<Position[]> {
  return await positionRepo.getMinorityPositions(proposalId);
}
