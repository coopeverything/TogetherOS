import { evidenceRepo } from '../repos/PostgresEvidenceRepo'
import type { ProposalEvidence, EvidenceType } from '@togetheros/types'

export async function addEvidence(params: {
  proposalId: string
  type: EvidenceType
  title: string
  summary: string
  attachedBy: string
  url?: string
}): Promise<ProposalEvidence> {
  return await evidenceRepo.addEvidence(params)
}

export async function getProposalEvidence(proposalId: string): Promise<ProposalEvidence[]> {
  return await evidenceRepo.getEvidenceByProposal(proposalId)
}

export async function deleteEvidence(evidenceId: string, memberId: string): Promise<boolean> {
  const evidence = await evidenceRepo.getEvidence(evidenceId)
  if (!evidence) {
    throw new Error('Evidence not found')
  }

  if (evidence.attachedBy !== memberId) {
    throw new Error('Unauthorized: Can only delete your own evidence')
  }

  return await evidenceRepo.deleteEvidence(evidenceId)
}
