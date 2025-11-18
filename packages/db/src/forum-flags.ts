/**
 * Forum Flags database operations
 * Handles moderation flags for community review
 */

import { query } from './index';
import type { Flag, FlagReason, FlagStatus } from '@togetheros/types/forum';

/**
 * Database row type (snake_case from database)
 */
interface FlagRow {
  id: string;
  content_id: string;
  content_type: 'post' | 'reply';
  flagger_id: string;
  reason: FlagReason;
  details?: string;
  status: FlagStatus;
  reviewed_by?: string;
  reviewed_at?: Date;
  created_at: Date;
}

/**
 * Convert database row to domain entity (snake_case → camelCase)
 */
function toFlag(row: FlagRow): Flag {
  return {
    id: row.id,
    contentId: row.content_id,
    contentType: row.content_type,
    flaggerId: row.flagger_id,
    reason: row.reason,
    details: row.details,
    status: row.status,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
  };
}

/**
 * Create flag input
 */
export interface CreateFlagInput {
  contentId: string;
  contentType: 'post' | 'reply';
  flaggerId: string;
  reason: FlagReason;
  details?: string;
}

/**
 * Update flag input (for moderation review)
 */
export interface UpdateFlagInput {
  status: FlagStatus;
  reviewedBy: string;
}

/**
 * Create a new flag
 */
export async function createFlag(input: CreateFlagInput): Promise<Flag> {
  const result = await query<FlagRow>(
    `INSERT INTO forum_flags (content_id, content_type, flagger_id, reason, details)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      input.contentId,
      input.contentType,
      input.flaggerId,
      input.reason,
      input.details || null,
    ]
  );

  return toFlag(result.rows[0]);
}

/**
 * Get flag by ID
 */
export async function getFlagById(id: string): Promise<Flag | null> {
  const result = await query<FlagRow>(
    `SELECT * FROM forum_flags
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] ? toFlag(result.rows[0]) : null;
}

/**
 * List flags by content
 */
export async function listFlagsByContent(
  contentId: string,
  contentType: 'post' | 'reply'
): Promise<Flag[]> {
  const result = await query<FlagRow>(
    `SELECT * FROM forum_flags
     WHERE content_id = $1 AND content_type = $2
     ORDER BY created_at DESC`,
    [contentId, contentType]
  );

  return result.rows.map(toFlag);
}

/**
 * List pending flags (moderation queue)
 */
export async function listPendingFlags(
  limit: number = 50,
  offset: number = 0
): Promise<{
  flags: Flag[];
  total: number;
}> {
  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM forum_flags
     WHERE status = 'pending'`
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Get flags
  const result = await query<FlagRow>(
    `SELECT * FROM forum_flags
     WHERE status = 'pending'
     ORDER BY created_at ASC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return {
    flags: result.rows.map(toFlag),
    total,
  };
}

/**
 * Update a flag (for moderation review)
 */
export async function updateFlag(
  id: string,
  updates: UpdateFlagInput
): Promise<Flag> {
  const result = await query<FlagRow>(
    `UPDATE forum_flags
     SET status = $1, reviewed_by = $2, reviewed_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [updates.status, updates.reviewedBy, id]
  );

  if (!result.rows[0]) {
    throw new Error(`Flag not found: ${id}`);
  }

  return toFlag(result.rows[0]);
}

/**
 * Get flags by flagger (user's flagging history)
 */
export async function listFlagsByFlagger(
  flaggerId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{
  flags: Flag[];
  total: number;
}> {
  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM forum_flags
     WHERE flagger_id = $1`,
    [flaggerId]
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Get flags
  const result = await query<FlagRow>(
    `SELECT * FROM forum_flags
     WHERE flagger_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [flaggerId, limit, offset]
  );

  return {
    flags: result.rows.map(toFlag),
    total,
  };
}
