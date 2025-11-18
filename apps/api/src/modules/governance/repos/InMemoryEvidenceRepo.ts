import type { ProposalEvidence, EvidenceType } from '@togetheros/types'

export interface IEvidenceRepo {
  addEvidence(params: {
    proposalId: string
    type: EvidenceType
    title: string
    summary: string
    attachedBy: string
    url?: string
  }): Promise<ProposalEvidence>

  getEvidenceByProposal(proposalId: string): Promise<ProposalEvidence[]>
  getEvidence(evidenceId: string): Promise<ProposalEvidence | null>
  deleteEvidence(evidenceId: string): Promise<boolean>
}
