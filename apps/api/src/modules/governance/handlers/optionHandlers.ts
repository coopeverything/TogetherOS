import { optionRepo } from '../repos/PostgresOptionRepo'
import type { Option, Tradeoff } from '@togetheros/types'

export async function addOption(params: {
  proposalId: string
  title: string
  description: string
  tradeoffs: Tradeoff[]
  proposedBy: string
  estimatedCost?: number
  estimatedTime?: string
}): Promise<Option> {
  return await optionRepo.addOption(params)
}

export async function getProposalOptions(proposalId: string): Promise<Option[]> {
  return await optionRepo.getOptionsByProposal(proposalId)
}

export async function updateOption(
  optionId: string,
  updates: Partial<Pick<Option, 'title' | 'description' | 'tradeoffs' | 'estimatedCost' | 'estimatedTime'>>,
  memberId: string
): Promise<Option> {
  const existing = await optionRepo.getOption(optionId)
  if (!existing) {
    throw new Error('Option not found')
  }

  if (existing.proposedBy !== memberId) {
    throw new Error('Unauthorized: Can only update your own options')
  }

  const updated = await optionRepo.updateOption(optionId, updates)
  if (!updated) {
    throw new Error('Failed to update option')
  }

  return updated
}

export async function deleteOption(optionId: string, memberId: string): Promise<boolean> {
  const option = await optionRepo.getOption(optionId)
  if (!option) {
    throw new Error('Option not found')
  }

  if (option.proposedBy !== memberId) {
    throw new Error('Unauthorized: Can only delete your own options')
  }

  return await optionRepo.deleteOption(optionId)
}
