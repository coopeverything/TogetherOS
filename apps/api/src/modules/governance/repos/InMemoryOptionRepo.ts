import type { Option, Tradeoff } from '@togetheros/types'
import { createOption } from '../entities/Option'
import type { IOptionRepo } from './OptionRepo'

export class InMemoryOptionRepo implements IOptionRepo {
  private options: Map<string, Option> = new Map()

  async addOption(params: {
    proposalId: string
    title: string
    description: string
    tradeoffs: Tradeoff[]
    proposedBy: string
    estimatedCost?: number
    estimatedTime?: string
  }): Promise<Option> {
    const newOption = createOption(params)
    this.options.set(newOption.id, newOption)
    return newOption
  }

  async getOptionsByProposal(proposalId: string): Promise<Option[]> {
    const results: Option[] = []
    for (const option of this.options.values()) {
      if (option.proposalId === proposalId) {
        results.push(option)
      }
    }
    return results.sort((a, b) => a.proposedAt.getTime() - b.proposedAt.getTime())
  }

  async getOption(optionId: string): Promise<Option | null> {
    return this.options.get(optionId) || null
  }

  async updateOption(
    optionId: string,
    updates: Partial<Pick<Option, 'title' | 'description' | 'tradeoffs' | 'estimatedCost' | 'estimatedTime'>>
  ): Promise<Option | null> {
    const existing = this.options.get(optionId)
    if (!existing) return null

    const updated: Option = { ...existing, ...updates }
    this.options.set(optionId, updated)
    return updated
  }

  async deleteOption(optionId: string): Promise<boolean> {
    return this.options.delete(optionId)
  }
}
