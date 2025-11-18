/**
 * Proposal database operations
 * Handles CRUD operations for governance proposals
 */

import { query } from './index';
import type {
  Proposal,
  ProposalStatus,
  ProposalScopeType,
  DecisionOutcome,
} from '@togetheros/types/governance';

/**
 * Database row type (snake_case from database)
 */
interface ProposalRow {
  id: string;
  scope_type: ProposalScopeType;
  scope_id: string;
  author_id: string;
  title: string;
  summary: string;
  status: ProposalStatus;
  evidence: any; // JSONB
  options: any; // JSONB
  positions: any; // JSONB
  minority_report?: string;
  decided_at?: Date;
  decision_outcome?: string;
  bridge_similarity_check_done: boolean;
  bridge_similar_proposals: any; // JSONB
  bridge_regulation_conflicts: any; // JSONB
  bridge_clarification_thread_id?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

/**
 * Convert database row to domain entity (snake_case → camelCase)
 */
function toProposal(row: ProposalRow): Proposal {
  return {
    id: row.id,
    scopeType: row.scope_type,
    scopeId: row.scope_id,
    authorId: row.author_id,
    title: row.title,
    summary: row.summary,
    status: row.status,
    evidence: Array.isArray(row.evidence) ? row.evidence : [],
    options: Array.isArray(row.options) ? row.options : [],
    positions: Array.isArray(row.positions) ? row.positions : [],
    minorityReport: row.minority_report,
    decidedAt: row.decided_at,
    decisionOutcome: row.decision_outcome as DecisionOutcome | undefined,
    bridgeSimilarityCheckDone: row.bridge_similarity_check_done,
    bridgeSimilarProposals: Array.isArray(row.bridge_similar_proposals)
      ? row.bridge_similar_proposals
      : [],
    bridgeRegulationConflicts: Array.isArray(row.bridge_regulation_conflicts)
      ? row.bridge_regulation_conflicts
      : [],
    bridgeClarificationThreadId: row.bridge_clarification_thread_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

/**
 * Create proposal input
 */
export interface CreateProposalInput {
  scopeType: ProposalScopeType;
  scopeId: string;
  authorId: string;
  title: string;
  summary: string;
  status?: ProposalStatus;
}

/**
 * Update proposal input
 */
export interface UpdateProposalInput {
  title?: string;
  summary?: string;
  status?: ProposalStatus;
  evidence?: any[];
  options?: any[];
  positions?: any[];
  minorityReport?: string;
  decidedAt?: Date;
  decisionOutcome?: DecisionOutcome;
  bridgeSimilarityCheckDone?: boolean;
  bridgeSimilarProposals?: any[];
  bridgeRegulationConflicts?: any[];
  bridgeClarificationThreadId?: string;
}

/**
 * List proposals filter
 */
export interface ListProposalsFilter {
  scopeType?: ProposalScopeType;
  scopeId?: string;
  authorId?: string;
  status?: ProposalStatus;
  limit?: number;
  offset?: number;
}

/**
 * Create a new proposal
 */
export async function createProposal(input: CreateProposalInput): Promise<Proposal> {
  const result = await query<ProposalRow>(
    `INSERT INTO proposals (scope_type, scope_id, author_id, title, summary, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      input.scopeType,
      input.scopeId,
      input.authorId,
      input.title,
      input.summary,
      input.status || 'draft',
    ]
  );

  return toProposal(result.rows[0]);
}

/**
 * Get proposal by ID
 */
export async function getProposalById(id: string): Promise<Proposal | null> {
  const result = await query<ProposalRow>(
    'SELECT * FROM proposals WHERE id = $1 AND deleted_at IS NULL',
    [id]
  );

  return result.rows[0] ? toProposal(result.rows[0]) : null;
}

/**
 * List proposals with optional filters
 */
export async function listProposals(
  filter: ListProposalsFilter = {}
): Promise<{ proposals: Proposal[]; total: number }> {
  const conditions: string[] = ['deleted_at IS NULL'];
  const params: any[] = [];
  let paramIndex = 1;

  // Build WHERE clause
  if (filter.scopeType) {
    conditions.push(`scope_type = $${paramIndex}`);
    params.push(filter.scopeType);
    paramIndex++;
  }

  if (filter.scopeId) {
    conditions.push(`scope_id = $${paramIndex}`);
    params.push(filter.scopeId);
    paramIndex++;
  }

  if (filter.authorId) {
    conditions.push(`author_id = $${paramIndex}`);
    params.push(filter.authorId);
    paramIndex++;
  }

  if (filter.status) {
    conditions.push(`status = $${paramIndex}`);
    params.push(filter.status);
    paramIndex++;
  }

  const whereClause = conditions.join(' AND ');

  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM proposals WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Get proposals with pagination
  const limit = filter.limit || 50;
  const offset = filter.offset || 0;

  const result = await query<ProposalRow>(
    `SELECT * FROM proposals
     WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  const proposals = result.rows.map(toProposal);

  return { proposals, total };
}

/**
 * Update proposal
 */
export async function updateProposal(
  id: string,
  updates: UpdateProposalInput
): Promise<Proposal> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  // JSONB fields that need JSON.stringify()
  const jsonbFields = [
    'evidence',
    'options',
    'positions',
    'bridgeSimilarProposals',
    'bridgeRegulationConflicts',
  ];

  // Map camelCase to snake_case
  const fieldMap: Record<string, string> = {
    title: 'title',
    summary: 'summary',
    status: 'status',
    evidence: 'evidence',
    options: 'options',
    positions: 'positions',
    minorityReport: 'minority_report',
    decidedAt: 'decided_at',
    decisionOutcome: 'decision_outcome',
    bridgeSimilarityCheckDone: 'bridge_similarity_check_done',
    bridgeSimilarProposals: 'bridge_similar_proposals',
    bridgeRegulationConflicts: 'bridge_regulation_conflicts',
    bridgeClarificationThreadId: 'bridge_clarification_thread_id',
  };

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      const dbField = fieldMap[key];
      if (!dbField) return;

      fields.push(`${dbField} = $${paramIndex}`);

      // Serialize JSONB fields
      if (jsonbFields.includes(key)) {
        values.push(JSON.stringify(value));
      } else {
        values.push(value);
      }
      paramIndex++;
    }
  });

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  // Always update updated_at (handled by trigger, but explicit is good)
  values.push(id);

  const result = await query<ProposalRow>(
    `UPDATE proposals SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (!result.rows[0]) {
    throw new Error('Proposal not found');
  }

  return toProposal(result.rows[0]);
}

/**
 * Delete proposal (soft delete)
 */
export async function deleteProposal(id: string): Promise<void> {
  await query(
    'UPDATE proposals SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL',
    [id]
  );
}
