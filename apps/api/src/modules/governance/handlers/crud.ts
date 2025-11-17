// apps/api/src/modules/governance/handlers/crud.ts
// CRUD handlers for proposals

import { InMemoryProposalRepo } from '../repos/InMemoryProposalRepo';
import type { Proposal } from '@togetheros/types/governance';
import type {
  CreateProposalInput,
  UpdateProposalInput,
  ListProposalsFilters,
} from '@togetheros/validators/governance';
import { bridgeRatingService } from '../services/BridgeRatingService';
import { bridgeRatingRepo } from '../repos/InMemoryBridgeRatingRepo';
import { flagProposal } from './moderationHandlers';

// Initialize repository (MVP: in-memory, will migrate to PostgreSQL)
const proposalRepo = new InMemoryProposalRepo();

/**
 * Create a new proposal
 */
export async function createProposal(input: CreateProposalInput): Promise<Proposal> {
  // Validate required fields
  if (!input.title || input.title.length < 3 || input.title.length > 200) {
    throw new Error('Proposal title must be between 3 and 200 characters');
  }

  if (!input.summary || input.summary.length < 10 || input.summary.length > 2000) {
    throw new Error('Proposal summary must be between 10 and 2000 characters');
  }

  if (!input.scopeType || !['individual', 'group'].includes(input.scopeType)) {
    throw new Error('Invalid scope type. Must be "individual" or "group"');
  }

  if (!input.scopeId) {
    throw new Error('Scope ID is required');
  }

  if (!input.authorId) {
    throw new Error('Author ID is required');
  }

  // Validate scope consistency
  if (input.scopeType === 'individual' && input.scopeId !== input.authorId) {
    throw new Error('Individual proposals must have scopeId equal to authorId');
  }

  // Create proposal
  const proposal = await proposalRepo.create(input);

  // Trigger Bridge AI auto-rating (async, don't block proposal creation)
  bridgeRatingService
    .rateProposal(proposal)
    .then((rating) => {
      if (rating) {
        bridgeRatingRepo.save(rating).catch((err) => {
          console.error('[createProposal] Failed to save Bridge rating:', err)
        })

        // Flag for moderation if AI detected issues
        if (bridgeRatingService.shouldFlagForModeration(rating)) {
          flagProposal(proposal.id, 'ai_flagged').catch((err) => {
            console.error('[createProposal] Failed to flag for moderation:', err)
          })
        }
      }
    })
    .catch((err) => console.error('[createProposal] Bridge rating error:', err))

  return proposal;
}

/**
 * Get proposal by ID
 */
export async function getProposalById(id: string): Promise<Proposal | null> {
  if (!id || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    throw new Error('Invalid proposal ID format');
  }

  return await proposalRepo.findById(id);
}

/**
 * List proposals with optional filters
 */
export async function listProposals(filters?: ListProposalsFilters): Promise<{
  proposals: Proposal[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;
  const page = Math.floor(offset / limit) + 1;

  const [proposals, total] = await Promise.all([
    proposalRepo.list(filters),
    proposalRepo.count(filters),
  ]);

  return {
    proposals,
    total,
    page,
    pageSize: limit,
  };
}

/**
 * Update proposal metadata
 */
export async function updateProposal(
  id: string,
  updates: UpdateProposalInput
): Promise<Proposal> {
  if (!id) {
    throw new Error('Proposal ID is required');
  }

  // Validate updates
  if (updates.title && (updates.title.length < 3 || updates.title.length > 200)) {
    throw new Error('Proposal title must be between 3 and 200 characters');
  }

  if (updates.summary && (updates.summary.length < 10 || updates.summary.length > 2000)) {
    throw new Error('Proposal summary must be between 10 and 2000 characters');
  }

  return await proposalRepo.update(id, updates);
}

/**
 * Delete proposal (soft delete)
 */
export async function deleteProposal(id: string): Promise<void> {
  if (!id) {
    throw new Error('Proposal ID is required');
  }

  await proposalRepo.delete(id);
}

/**
 * Get proposals by author
 */
export async function getProposalsByAuthor(authorId: string): Promise<Proposal[]> {
  if (!authorId) {
    throw new Error('Author ID is required');
  }

  return await proposalRepo.findByAuthor(authorId);
}

/**
 * Get proposals by scope
 */
export async function getProposalsByScope(
  scopeType: 'individual' | 'group',
  scopeId: string
): Promise<Proposal[]> {
  if (!scopeType || !['individual', 'group'].includes(scopeType)) {
    throw new Error('Invalid scope type');
  }

  if (!scopeId) {
    throw new Error('Scope ID is required');
  }

  return await proposalRepo.findByScope(scopeType, scopeId);
}
