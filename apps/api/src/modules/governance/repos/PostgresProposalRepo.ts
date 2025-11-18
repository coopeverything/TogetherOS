/**
 * PostgreSQL Proposal Repository
 * Production implementation using @togetheros/db package
 */

import type { Proposal as ProposalType } from '@togetheros/types/governance';
import type {
  CreateProposalInput,
  UpdateProposalInput,
  ListProposalsFilters,
} from '@togetheros/validators/governance';
import type { ProposalRepo } from './ProposalRepo';
import {
  createProposal,
  getProposalById,
  listProposals,
  updateProposal,
  deleteProposal,
} from '@togetheros/db';

/**
 * PostgreSQL-backed proposal repository
 */
export class PostgresProposalRepo implements ProposalRepo {
  async create(input: CreateProposalInput): Promise<ProposalType> {
    return await createProposal({
      scopeType: input.scopeType,
      scopeId: input.scopeId,
      authorId: input.authorId,
      title: input.title,
      summary: input.summary,
    });
  }

  async findById(id: string): Promise<ProposalType | null> {
    return await getProposalById(id);
  }

  async list(filters?: ListProposalsFilters): Promise<ProposalType[]> {
    const result = await listProposals({
      scopeType: filters?.scopeType,
      scopeId: filters?.scopeId,
      authorId: filters?.authorId,
      status: filters?.status,
      limit: filters?.limit,
      offset: filters?.offset,
    });

    return result.proposals;
  }

  async update(id: string, updates: UpdateProposalInput): Promise<ProposalType> {
    return await updateProposal(id, updates);
  }

  async delete(id: string): Promise<void> {
    await deleteProposal(id);
  }

  async count(filters?: ListProposalsFilters): Promise<number> {
    const result = await listProposals({
      scopeType: filters?.scopeType,
      scopeId: filters?.scopeId,
      authorId: filters?.authorId,
      status: filters?.status,
      limit: 0, // Don't fetch proposals, just get count
      offset: 0,
    });

    return result.total;
  }

  async findByAuthor(authorId: string): Promise<ProposalType[]> {
    const result = await listProposals({ authorId });
    return result.proposals;
  }

  async findByScope(
    scopeType: 'individual' | 'group',
    scopeId: string
  ): Promise<ProposalType[]> {
    const result = await listProposals({ scopeType, scopeId });
    return result.proposals;
  }
}

// Singleton instance
export const proposalRepo = new PostgresProposalRepo();
