import type { ProposalEvidence, EvidenceType } from '@togetheros/types'
import { randomUUID } from 'crypto'

export type { ProposalEvidence, EvidenceType }

export function createEvidence(params: {
  proposalId: string
  type: EvidenceType
  title: string
  summary: string
  attachedBy: string
  url?: string
}): ProposalEvidence {
  return {
    id: randomUUID(),
    proposalId: params.proposalId,
    type: params.type,
    title: params.title,
    summary: params.summary,
    url: params.url,
    attachedBy: params.attachedBy,
    attachedAt: new Date(),
  }
}
