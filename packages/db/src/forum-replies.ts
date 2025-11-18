/**
 * Forum Replies database operations
 * Handles CRUD operations for forum replies (nested responses to posts)
 */

import { query } from './index';
import type { Reply } from '@togetheros/types/forum';

/**
 * Database row type (snake_case from database)
 */
interface ReplyRow {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  citations: any; // JSONB
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

/**
 * Convert database row to domain entity (snake_case → camelCase)
 */
function toReply(row: ReplyRow): Reply {
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    content: row.content,
    citations: Array.isArray(row.citations) ? row.citations : [],
    reactions: [], // Reactions loaded separately
    editHistory: [], // Edit history loaded separately
    flags: [], // Flags loaded separately
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

/**
 * Create reply input
 */
export interface CreateReplyInput {
  postId: string;
  authorId: string;
  content: string;
}

/**
 * Update reply input
 */
export interface UpdateReplyInput {
  content?: string;
}

/**
 * Create a new reply
 */
export async function createReply(input: CreateReplyInput): Promise<Reply> {
  const result = await query<ReplyRow>(
    `INSERT INTO replies (post_id, author_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.postId, input.authorId, input.content]
  );

  return toReply(result.rows[0]);
}

/**
 * Get reply by ID
 */
export async function getReplyById(id: string): Promise<Reply | null> {
  const result = await query<ReplyRow>(
    `SELECT * FROM replies
     WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );

  return result.rows[0] ? toReply(result.rows[0]) : null;
}

/**
 * List replies by post ID
 */
export async function listRepliesByPost(
  postId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{
  replies: Reply[];
  total: number;
}> {
  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM replies
     WHERE post_id = $1 AND deleted_at IS NULL`,
    [postId]
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Get replies
  const result = await query<ReplyRow>(
    `SELECT * FROM replies
     WHERE post_id = $1 AND deleted_at IS NULL
     ORDER BY created_at ASC
     LIMIT $2 OFFSET $3`,
    [postId, limit, offset]
  );

  return {
    replies: result.rows.map(toReply),
    total,
  };
}

/**
 * List replies by author ID
 */
export async function listRepliesByAuthor(
  authorId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{
  replies: Reply[];
  total: number;
}> {
  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM replies
     WHERE author_id = $1 AND deleted_at IS NULL`,
    [authorId]
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Get replies
  const result = await query<ReplyRow>(
    `SELECT * FROM replies
     WHERE author_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [authorId, limit, offset]
  );

  return {
    replies: result.rows.map(toReply),
    total,
  };
}

/**
 * Update a reply
 */
export async function updateReply(
  id: string,
  updates: UpdateReplyInput
): Promise<Reply> {
  if (!updates.content) {
    throw new Error('No fields to update');
  }

  const result = await query<ReplyRow>(
    `UPDATE replies
     SET content = $1
     WHERE id = $2 AND deleted_at IS NULL
     RETURNING *`,
    [updates.content, id]
  );

  if (!result.rows[0]) {
    throw new Error(`Reply not found: ${id}`);
  }

  return toReply(result.rows[0]);
}

/**
 * Delete a reply (soft delete)
 */
export async function deleteReply(id: string): Promise<void> {
  await query(
    `UPDATE replies
     SET deleted_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
}
