import type { Option, Tradeoff } from '@togetheros/types'

export interface IOptionRepo {
  addOption(params: {
    proposalId: string
    title: string
    description: string
    tradeoffs: Tradeoff[]
    proposedBy: string
    estimatedCost?: number
    estimatedTime?: string
  }): Promise<Option>

  getOptionsByProposal(proposalId: string): Promise<Option[]>
  getOption(optionId: string): Promise<Option | null>
  updateOption(
    optionId: string,
    updates: Partial<Pick<Option, 'title' | 'description' | 'tradeoffs' | 'estimatedCost' | 'estimatedTime'>>
  ): Promise<Option | null>
  deleteOption(optionId: string): Promise<boolean>
}
