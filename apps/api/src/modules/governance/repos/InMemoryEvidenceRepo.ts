import type { ProposalEvidence, EvidenceType } from '@togetheros/types'
import { createEvidence } from '../entities/Evidence'
import type { IEvidenceRepo } from './EvidenceRepo'

export class InMemoryEvidenceRepo implements IEvidenceRepo {
  private evidence: Map<string, ProposalEvidence> = new Map()

  async addEvidence(params: {
    proposalId: string
    type: EvidenceType
    title: string
    summary: string
    attachedBy: string
    url?: string
  }): Promise<ProposalEvidence> {
    const newEvidence = createEvidence(params)
    this.evidence.set(newEvidence.id, newEvidence)
    return newEvidence
  }

  async getEvidenceByProposal(proposalId: string): Promise<ProposalEvidence[]> {
    const results: ProposalEvidence[] = []
    for (const evidence of this.evidence.values()) {
      if (evidence.proposalId === proposalId) {
        results.push(evidence)
      }
    }
    return results.sort((a, b) => b.attachedAt.getTime() - a.attachedAt.getTime())
  }

  async getEvidence(evidenceId: string): Promise<ProposalEvidence | null> {
    return this.evidence.get(evidenceId) || null
  }

  async deleteEvidence(evidenceId: string): Promise<boolean> {
    return this.evidence.delete(evidenceId)
  }
}
