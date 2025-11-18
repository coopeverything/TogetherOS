/**
 * PostgreSQL Option Repository
 * Production implementation using @togetheros/db package
 */

import type { Option, Tradeoff } from '@togetheros/types';
import type { IOptionRepo } from './OptionRepo';
import {
  addOption,
  getProposalOptions,
  getOption as getOptionDb,
  updateOption as updateOptionDb,
  deleteOption as deleteOptionDb,
  listProposals,
} from '@togetheros/db';

/**
 * PostgreSQL-backed option repository
 */
export class PostgresOptionRepo implements IOptionRepo {
  async addOption(params: {
    proposalId: string;
    title: string;
    description: string;
    tradeoffs: Tradeoff[];
    proposedBy: string;
    estimatedCost?: number;
    estimatedTime?: string;
  }): Promise<Option> {
    return await addOption(
      params.proposalId,
      params.title,
      params.description,
      params.tradeoffs,
      params.proposedBy,
      params.estimatedCost,
      params.estimatedTime
    );
  }

  async getOptionsByProposal(proposalId: string): Promise<Option[]> {
    return await getProposalOptions(proposalId);
  }

  async getOption(optionId: string): Promise<Option | null> {
    // Options are stored as JSONB in proposals table
    // Need to search across all proposals to find the option by ID
    // This is inefficient but acceptable for MVP (options stored as JSONB)

    // Get all proposals (limited to recent 1000)
    const result = await listProposals({ limit: 1000 });

    for (const proposal of result.proposals) {
      const option = proposal.options.find((o) => o.id === optionId);
      if (option) {
        return option;
      }
    }

    return null;
  }

  async updateOption(
    optionId: string,
    updates: Partial<Pick<Option, 'title' | 'description' | 'tradeoffs' | 'estimatedCost' | 'estimatedTime'>>
  ): Promise<Option | null> {
    // Find the proposal containing this option
    const result = await listProposals({ limit: 1000 });

    for (const proposal of result.proposals) {
      const option = proposal.options.find((o) => o.id === optionId);
      if (option) {
        return await updateOptionDb(proposal.id, optionId, updates);
      }
    }

    return null;
  }

  async deleteOption(optionId: string): Promise<boolean> {
    // Find the proposal containing this option
    const result = await listProposals({ limit: 1000 });

    for (const proposal of result.proposals) {
      const option = proposal.options.find((o) => o.id === optionId);
      if (option) {
        await deleteOptionDb(proposal.id, optionId);
        return true;
      }
    }

    return false;
  }
}

// Singleton instance
export const optionRepo = new PostgresOptionRepo();
