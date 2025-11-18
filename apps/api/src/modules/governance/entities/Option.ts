import type { Option, Tradeoff } from '@togetheros/types'
import { randomUUID } from 'crypto'

export type { Option, Tradeoff }

export function createOption(params: {
  proposalId: string
  title: string
  description: string
  tradeoffs: Tradeoff[]
  proposedBy: string
  estimatedCost?: number
  estimatedTime?: string
}): Option {
  return {
    id: randomUUID(),
    proposalId: params.proposalId,
    title: params.title,
    description: params.description,
    tradeoffs: params.tradeoffs,
    estimatedCost: params.estimatedCost,
    estimatedTime: params.estimatedTime,
    proposedBy: params.proposedBy,
    proposedAt: new Date(),
  }
}
