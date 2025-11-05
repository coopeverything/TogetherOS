// apps/api/src/modules/governance/repos/InMemoryProposalRepo.ts
// In-memory implementation of ProposalRepo for MVP/testing

import type { Proposal as ProposalType } from '@togetheros/types/governance'
import type {
  CreateProposalInput,
  UpdateProposalInput,
  ListProposalsFilters,
} from '@togetheros/validators/governance'
import type { ProposalRepo } from './ProposalRepo'
import { Proposal } from '../entities/Proposal'

/**
 * In-memory proposal repository
 * For MVP and testing purposes
 */
export class InMemoryProposalRepo implements ProposalRepo {
  private proposals: Map<string, ProposalType> = new Map()

  /**
   * Create a new proposal
   */
  async create(input: CreateProposalInput): Promise<ProposalType> {
    const proposal = Proposal.create({
      scopeType: input.scopeType,
      scopeId: input.scopeId,
      authorId: input.authorId,
      title: input.title,
      summary: input.summary,
    })

    const proposalData = proposal.toJSON()
    this.proposals.set(proposalData.id, proposalData)

    return proposalData
  }

  /**
   * Find proposal by ID
   */
  async findById(id: string): Promise<ProposalType | null> {
    const proposal = this.proposals.get(id)
    if (!proposal || proposal.deletedAt) {
      return null
    }
    return proposal
  }

  /**
   * List proposals with filters
   */
  async list(filters?: ListProposalsFilters): Promise<ProposalType[]> {
    let results = Array.from(this.proposals.values())

    // Filter out soft-deleted
    results = results.filter((p) => !p.deletedAt)

    // Apply filters
    if (filters?.scopeType) {
      results = results.filter((p) => p.scopeType === filters.scopeType)
    }

    if (filters?.scopeId) {
      results = results.filter((p) => p.scopeId === filters.scopeId)
    }

    if (filters?.status) {
      results = results.filter((p) => p.status === filters.status)
    }

    if (filters?.authorId) {
      results = results.filter((p) => p.authorId === filters.authorId)
    }

    // Sort by created date (newest first)
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    // Apply pagination
    const offset = filters?.offset || 0
    const limit = filters?.limit || 50

    return results.slice(offset, offset + limit)
  }

  /**
   * Update proposal metadata
   */
  async update(id: string, updates: UpdateProposalInput): Promise<ProposalType> {
    const existing = await this.findById(id)
    if (!existing) {
      throw new Error(`Proposal with ID ${id} not found`)
    }

    const proposal = Proposal.fromData(existing)
    const updated = proposal.update({
      title: updates.title,
      summary: updates.summary,
      status: updates.status,
      minorityReport: updates.minorityReport,
      decisionOutcome: updates.decisionOutcome,
    })

    const updatedData = updated.toJSON()
    this.proposals.set(id, updatedData)

    return updatedData
  }

  /**
   * Soft delete proposal
   */
  async delete(id: string): Promise<void> {
    const existing = await this.findById(id)
    if (!existing) {
      throw new Error(`Proposal with ID ${id} not found`)
    }

    const proposal = Proposal.fromData(existing)
    const deleted = proposal.delete()
    this.proposals.set(id, deleted.toJSON())
  }

  /**
   * Count proposals (for pagination)
   */
  async count(filters?: ListProposalsFilters): Promise<number> {
    const all = await this.list({ ...filters, limit: 1000, offset: 0 })
    return all.length
  }

  /**
   * Find proposals by author
   */
  async findByAuthor(authorId: string): Promise<ProposalType[]> {
    return this.list({ authorId, limit: 1000, offset: 0 })
  }

  /**
   * Find proposals by scope
   */
  async findByScope(
    scopeType: 'individual' | 'group',
    scopeId: string
  ): Promise<ProposalType[]> {
    return this.list({ scopeType, scopeId, limit: 1000, offset: 0 })
  }

  /**
   * Clear all proposals (for testing)
   */
  async clear(): Promise<void> {
    this.proposals.clear()
  }

  /**
   * Seed with test data (for development)
   */
  async seed(proposals: ProposalType[]): Promise<void> {
    for (const proposal of proposals) {
      this.proposals.set(proposal.id, proposal)
    }
  }
}
