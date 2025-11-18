/**
 * Proposal Options database operations
 * Handles options management within proposals (stored as JSONB array)
 */

import { query } from './index';
import type { Option, Tradeoff } from '@togetheros/types/governance';
import { v4 as uuidv4 } from 'uuid';

/**
 * Add option to a proposal
 */
export async function addOption(
  proposalId: string,
  title: string,
  description: string,
  tradeoffs: Tradeoff[],
  proposedBy: string,
  estimatedCost?: number,
  estimatedTime?: string
): Promise<Option> {
  const option: Option = {
    id: uuidv4(),
    proposalId,
    title,
    description,
    tradeoffs,
    estimatedCost,
    estimatedTime,
    proposedBy,
    proposedAt: new Date(),
  };

  // Append option to JSONB array
  await query(
    `UPDATE proposals
     SET options = options || $1::jsonb
     WHERE id = $2 AND deleted_at IS NULL`,
    [JSON.stringify(option), proposalId]
  );

  return option;
}

/**
 * Get all options for a proposal
 */
export async function getProposalOptions(proposalId: string): Promise<Option[]> {
  const result = await query<{ options: any }>(
    'SELECT options FROM proposals WHERE id = $1 AND deleted_at IS NULL',
    [proposalId]
  );

  if (!result.rows[0]) {
    return [];
  }

  const options = result.rows[0].options;
  return Array.isArray(options) ? options : [];
}

/**
 * Get a specific option by ID
 */
export async function getOption(proposalId: string, optionId: string): Promise<Option | null> {
  const allOptions = await getProposalOptions(proposalId);
  return allOptions.find((o) => o.id === optionId) || null;
}

/**
 * Update an option
 */
export async function updateOption(
  proposalId: string,
  optionId: string,
  updates: Partial<Omit<Option, 'id' | 'proposalId' | 'proposedBy' | 'proposedAt'>>
): Promise<Option> {
  // Get current options
  const options = await getProposalOptions(proposalId);
  const optionIndex = options.findIndex((o) => o.id === optionId);

  if (optionIndex === -1) {
    throw new Error('Option not found');
  }

  // Update the option
  const updatedOption = {
    ...options[optionIndex],
    ...updates,
  };

  options[optionIndex] = updatedOption;

  // Save back to database
  await query(
    `UPDATE proposals
     SET options = $1::jsonb
     WHERE id = $2 AND deleted_at IS NULL`,
    [JSON.stringify(options), proposalId]
  );

  return updatedOption;
}

/**
 * Delete option from a proposal
 */
export async function deleteOption(proposalId: string, optionId: string): Promise<void> {
  // Remove option from JSONB array by filtering out the matching ID
  await query(
    `UPDATE proposals
     SET options = (
       SELECT jsonb_agg(elem)
       FROM jsonb_array_elements(options) elem
       WHERE elem->>'id' != $1
     )
     WHERE id = $2 AND deleted_at IS NULL`,
    [optionId, proposalId]
  );
}
