// apps/api/src/modules/governance/repos/ProposalRepo.ts
// Repository interface for Proposal entity

import type { Proposal as ProposalType } from '@togetheros/types/governance'
import type {
  CreateProposalInput,
  UpdateProposalInput,
  ListProposalsFilters,
} from '@togetheros/validators/governance'

/**
 * Proposal repository interface
 * Defines contract for data access
 */
export interface ProposalRepo {
  /**
   * Create a new proposal
   */
  create(input: CreateProposalInput): Promise<ProposalType>

  /**
   * Find proposal by ID
   */
  findById(id: string): Promise<ProposalType | null>

  /**
   * List proposals with filters
   */
  list(filters?: ListProposalsFilters): Promise<ProposalType[]>

  /**
   * Update proposal metadata
   */
  update(id: string, updates: UpdateProposalInput): Promise<ProposalType>

  /**
   * Soft delete proposal
   */
  delete(id: string): Promise<void>

  /**
   * Count proposals (for pagination)
   */
  count(filters?: ListProposalsFilters): Promise<number>

  /**
   * Find proposals by author
   */
  findByAuthor(authorId: string): Promise<ProposalType[]>

  /**
   * Find proposals by scope
   */
  findByScope(scopeType: 'individual' | 'group', scopeId: string): Promise<ProposalType[]>
}
