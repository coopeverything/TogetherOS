/**
 * Proposal Evidence database operations
 * Handles evidence management within proposals (stored as JSONB array)
 */

import { query } from './index';
import type { ProposalEvidence, EvidenceType } from '@togetheros/types/governance';
import { v4 as uuidv4 } from 'uuid';

/**
 * Add evidence to a proposal
 */
export async function addEvidence(
  proposalId: string,
  type: EvidenceType,
  title: string,
  summary: string,
  attachedBy: string,
  url?: string
): Promise<ProposalEvidence> {
  const evidence: ProposalEvidence = {
    id: uuidv4(),
    proposalId,
    type,
    title,
    summary,
    attachedBy,
    url,
    attachedAt: new Date(),
  };

  // Append evidence to JSONB array
  await query(
    `UPDATE proposals
     SET evidence = evidence || $1::jsonb
     WHERE id = $2 AND deleted_at IS NULL`,
    [JSON.stringify(evidence), proposalId]
  );

  return evidence;
}

/**
 * Get all evidence for a proposal
 */
export async function getProposalEvidence(proposalId: string): Promise<ProposalEvidence[]> {
  const result = await query<{ evidence: any }>(
    'SELECT evidence FROM proposals WHERE id = $1 AND deleted_at IS NULL',
    [proposalId]
  );

  if (!result.rows[0]) {
    return [];
  }

  const evidence = result.rows[0].evidence;
  return Array.isArray(evidence) ? evidence : [];
}

/**
 * Get a specific evidence by ID
 */
export async function getEvidence(
  proposalId: string,
  evidenceId: string
): Promise<ProposalEvidence | null> {
  const allEvidence = await getProposalEvidence(proposalId);
  return allEvidence.find((e) => e.id === evidenceId) || null;
}

/**
 * Delete evidence from a proposal
 */
export async function deleteEvidence(proposalId: string, evidenceId: string): Promise<void> {
  // Remove evidence from JSONB array by filtering out the matching ID
  await query(
    `UPDATE proposals
     SET evidence = (
       SELECT jsonb_agg(elem)
       FROM jsonb_array_elements(evidence) elem
       WHERE elem->>'id' != $1
     )
     WHERE id = $2 AND deleted_at IS NULL`,
    [evidenceId, proposalId]
  );
}
