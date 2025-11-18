/**
 * Forum Reactions database operations
 * Handles empathy-focused reactions to posts and replies
 */

import { query } from './index';
import type { Reaction, ReactionType } from '@togetheros/types/forum';

/**
 * Database row type (snake_case from database)
 */
interface ReactionRow {
  id: string;
  user_id: string;
  type: ReactionType;
  created_at: Date;
}

/**
 * Convert database row to domain entity (snake_case → camelCase)
 */
function toReaction(row: ReactionRow): Reaction {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    createdAt: row.created_at,
  };
}

/**
 * Create reaction input
 */
export interface CreateReactionInput {
  contentId: string;
  contentType: 'post' | 'reply';
  userId: string;
  type: ReactionType;
}

/**
 * Create a new reaction
 */
export async function createReaction(
  input: CreateReactionInput
): Promise<Reaction> {
  const result = await query<ReactionRow>(
    `INSERT INTO forum_reactions (content_id, content_type, user_id, type)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [input.contentId, input.contentType, input.userId, input.type]
  );

  return toReaction(result.rows[0]);
}

/**
 * Get reaction by ID
 */
export async function getReactionById(id: string): Promise<Reaction | null> {
  const result = await query<ReactionRow>(
    `SELECT * FROM forum_reactions
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] ? toReaction(result.rows[0]) : null;
}

/**
 * List reactions for a specific content item
 */
export async function listReactionsByContent(
  contentId: string,
  contentType: 'post' | 'reply'
): Promise<Reaction[]> {
  const result = await query<ReactionRow>(
    `SELECT * FROM forum_reactions
     WHERE content_id = $1 AND content_type = $2
     ORDER BY created_at ASC`,
    [contentId, contentType]
  );

  return result.rows.map(toReaction);
}

/**
 * Get reaction counts by type for a content item
 */
export async function getReactionCounts(
  contentId: string,
  contentType: 'post' | 'reply'
): Promise<Record<ReactionType, number>> {
  const result = await query<{ type: ReactionType; count: string }>(
    `SELECT type, COUNT(*) as count
     FROM forum_reactions
     WHERE content_id = $1 AND content_type = $2
     GROUP BY type`,
    [contentId, contentType]
  );

  const counts: Record<string, number> = {
    agree: 0,
    disagree: 0,
    insightful: 0,
    empathy: 0,
    question: 0,
    concern: 0,
  };

  result.rows.forEach((row) => {
    counts[row.type] = parseInt(row.count, 10);
  });

  return counts as Record<ReactionType, number>;
}

/**
 * Check if user has reacted to content
 */
export async function getUserReaction(
  contentId: string,
  contentType: 'post' | 'reply',
  userId: string
): Promise<Reaction | null> {
  const result = await query<ReactionRow>(
    `SELECT * FROM forum_reactions
     WHERE content_id = $1 AND content_type = $2 AND user_id = $3`,
    [contentId, contentType, userId]
  );

  return result.rows[0] ? toReaction(result.rows[0]) : null;
}

/**
 * Delete a reaction
 */
export async function deleteReaction(id: string): Promise<void> {
  await query(`DELETE FROM forum_reactions WHERE id = $1`, [id]);
}

/**
 * Delete user's reaction to content
 */
export async function deleteUserReaction(
  contentId: string,
  contentType: 'post' | 'reply',
  userId: string
): Promise<void> {
  await query(
    `DELETE FROM forum_reactions
     WHERE content_id = $1 AND content_type = $2 AND user_id = $3`,
    [contentId, contentType, userId]
  );
}
