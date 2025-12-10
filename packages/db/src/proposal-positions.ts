/**
 * Proposal Positions database operations
 * Handles member positions within proposals (stored as JSONB array)
 */

import { query } from './index';
import type { Position, PositionStance } from '@togetheros/types/governance';
import { v4 as uuidv4 } from 'uuid';

/**
 * Add or update a position for a member on a proposal
 * Each member can only have one position per proposal
 */
export async function addOrUpdatePosition(
  proposalId: string,
  memberId: string,
  stance: PositionStance,
  reasoning: string,
  isMinority: boolean = false
): Promise<Position> {
  // First, get existing positions
  const existingPositions = await getProposalPositions(proposalId);
  const existingIndex = existingPositions.findIndex(p => p.memberId === memberId);

  const position: Position = {
    id: existingIndex >= 0 ? existingPositions[existingIndex].id : uuidv4(),
    proposalId,
    memberId,
    stance,
    reasoning,
    isMinority,
    recordedAt: new Date(),
  };

  if (existingIndex >= 0) {
    // Update existing position
    existingPositions[existingIndex] = position;
    await query(
      `UPDATE proposals
       SET positions = $1::jsonb
       WHERE id = $2 AND deleted_at IS NULL`,
      [JSON.stringify(existingPositions), proposalId]
    );
  } else {
    // Append new position
    await query(
      `UPDATE proposals
       SET positions = positions || $1::jsonb
       WHERE id = $2 AND deleted_at IS NULL`,
      [JSON.stringify(position), proposalId]
    );
  }

  return position;
}

/**
 * Get all positions for a proposal
 */
export async function getProposalPositions(proposalId: string): Promise<Position[]> {
  const result = await query<{ positions: any }>(
    'SELECT positions FROM proposals WHERE id = $1 AND deleted_at IS NULL',
    [proposalId]
  );

  if (!result.rows[0]) {
    return [];
  }

  const positions = result.rows[0].positions;
  return Array.isArray(positions) ? positions : [];
}

/**
 * Get a member's position on a proposal
 */
export async function getMemberPosition(
  proposalId: string,
  memberId: string
): Promise<Position | null> {
  const positions = await getProposalPositions(proposalId);
  return positions.find((p) => p.memberId === memberId) || null;
}

/**
 * Delete a member's position from a proposal
 */
export async function deletePosition(proposalId: string, memberId: string): Promise<void> {
  await query(
    `UPDATE proposals
     SET positions = (
       SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
       FROM jsonb_array_elements(positions) elem
       WHERE elem->>'memberId' != $1
     )
     WHERE id = $2 AND deleted_at IS NULL`,
    [memberId, proposalId]
  );
}

/**
 * Mark positions as minority positions based on decision outcome
 * Called after voting concludes to preserve dissenting views
 */
export async function markMinorityPositions(
  proposalId: string,
  minorityStances: PositionStance[]
): Promise<void> {
  const positions = await getProposalPositions(proposalId);

  const updatedPositions = positions.map(p => ({
    ...p,
    isMinority: minorityStances.includes(p.stance)
  }));

  await query(
    `UPDATE proposals
     SET positions = $1::jsonb
     WHERE id = $2 AND deleted_at IS NULL`,
    [JSON.stringify(updatedPositions), proposalId]
  );
}

/**
 * Get all minority positions for a proposal
 */
export async function getMinorityPositions(proposalId: string): Promise<Position[]> {
  const positions = await getProposalPositions(proposalId);
  return positions.filter(p => p.isMinority);
}

/**
 * Generate minority report from minority positions
 * Compiles objections and concerns into a formal report
 */
export async function generateMinorityReport(proposalId: string): Promise<string> {
  const minorityPositions = await getMinorityPositions(proposalId);

  if (minorityPositions.length === 0) {
    return '';
  }

  const reportSections: string[] = [
    '## Minority Report',
    '',
    `This report codifies the objections and concerns raised by ${minorityPositions.length} member(s) who dissented from the majority decision.`,
    '',
  ];

  // Group by stance
  const oppositions = minorityPositions.filter(p => p.stance === 'oppose');
  const blocks = minorityPositions.filter(p => p.stance === 'block');

  if (blocks.length > 0) {
    reportSections.push('### Blocking Objections');
    reportSections.push('');
    blocks.forEach((p, i) => {
      reportSections.push(`**Objection ${i + 1}:**`);
      reportSections.push(p.reasoning);
      reportSections.push('');
    });
  }

  if (oppositions.length > 0) {
    reportSections.push('### Opposition Statements');
    reportSections.push('');
    oppositions.forEach((p, i) => {
      reportSections.push(`**Statement ${i + 1}:**`);
      reportSections.push(p.reasoning);
      reportSections.push('');
    });
  }

  reportSections.push('---');
  reportSections.push(`*Generated on ${new Date().toISOString().split('T')[0]}*`);

  return reportSections.join('\n');
}

/**
 * Save minority report to proposal
 */
export async function saveMinorityReport(
  proposalId: string,
  report: string
): Promise<void> {
  await query(
    `UPDATE proposals
     SET minority_report = $1
     WHERE id = $2 AND deleted_at IS NULL`,
    [report, proposalId]
  );
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
  const positions = await getProposalPositions(proposalId);

  return {
    total: positions.length,
    support: positions.filter(p => p.stance === 'support').length,
    oppose: positions.filter(p => p.stance === 'oppose').length,
    abstain: positions.filter(p => p.stance === 'abstain').length,
    block: positions.filter(p => p.stance === 'block').length,
    minorityCount: positions.filter(p => p.isMinority).length,
  };
}
