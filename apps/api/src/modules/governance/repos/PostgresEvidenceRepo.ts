/**
 * PostgreSQL Evidence Repository
 * Production implementation using @togetheros/db package
 */

import type { ProposalEvidence, EvidenceType } from '@togetheros/types';
import type { IEvidenceRepo } from './EvidenceRepo';
import {
  addEvidence,
  getProposalEvidence,
  getEvidence as getEvidenceDb,
  deleteEvidence as deleteEvidenceDb,
  listProposals,
} from '@togetheros/db';

/**
 * PostgreSQL-backed evidence repository
 */
export class PostgresEvidenceRepo implements IEvidenceRepo {
  async addEvidence(params: {
    proposalId: string;
    type: EvidenceType;
    title: string;
    summary: string;
    attachedBy: string;
    url?: string;
  }): Promise<ProposalEvidence> {
    return await addEvidence(
      params.proposalId,
      params.type,
      params.title,
      params.summary,
      params.attachedBy,
      params.url
    );
  }

  async getEvidenceByProposal(proposalId: string): Promise<ProposalEvidence[]> {
    return await getProposalEvidence(proposalId);
  }

  async getEvidence(evidenceId: string): Promise<ProposalEvidence | null> {
    // Evidence is stored as JSONB in proposals table
    // Need to search across all proposals to find the evidence by ID
    // This is inefficient but acceptable for MVP (evidence stored as JSONB)

    // Get all proposals (limited to recent 1000)
    const result = await listProposals({ limit: 1000 });

    for (const proposal of result.proposals) {
      const evidence = proposal.evidence.find((e) => e.id === evidenceId);
      if (evidence) {
        return evidence;
      }
    }

    return null;
  }

  async deleteEvidence(evidenceId: string): Promise<boolean> {
    // Find the proposal containing this evidence
    const result = await listProposals({ limit: 1000 });

    for (const proposal of result.proposals) {
      const evidence = proposal.evidence.find((e) => e.id === evidenceId);
      if (evidence) {
        await deleteEvidenceDb(proposal.id, evidenceId);
        return true;
      }
    }

    return false;
  }
}

// Singleton instance
export const evidenceRepo = new PostgresEvidenceRepo();
