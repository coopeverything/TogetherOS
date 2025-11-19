/**
 * Forum Posts database operations
 * Handles CRUD operations for forum posts (top-level responses to topics)
 *
 * Table: forum_posts (module-prefixed to avoid collision with feed_posts)
 */

import { query } from './index';
import type {
  Post,
  PostPosition,
  Citation,
} from '@togetheros/types/forum';

/**
 * Database row type (snake_case from database)
 */
interface PostRow {
  id: string;
  topic_id: string;
  author_id: string;
  content: string;
  position_stance?: 'support' | 'oppose' | 'neutral' | 'question';
  position_reasoning?: string;
  position_tradeoffs: string[];
  position_alternatives: string[];
  citations: any; // JSONB
  reply_count: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

/**
 * Convert database row to domain entity (snake_case → camelCase)
 */
function toPost(row: PostRow): Post {
  // Build position object if stance exists
  let position: PostPosition | undefined;
  if (row.position_stance && row.position_reasoning) {
    position = {
      stance: row.position_stance,
      reasoning: row.position_reasoning,
      tradeoffs: row.position_tradeoffs || [],
      alternatives: row.position_alternatives || [],
    };
  }

  return {
    id: row.id,
    topicId: row.topic_id,
    authorId: row.author_id,
    content: row.content,
    position,
    citations: Array.isArray(row.citations) ? row.citations : [],
    replyCount: row.reply_count,
    reactions: [], // Reactions loaded separately
    editHistory: [], // Edit history loaded separately
    flags: [], // Flags loaded separately
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

/**
 * Create post input
 */
export interface CreatePostInput {
  topicId: string;
  authorId: string;
  content: string;
  position?: {
    stance: 'support' | 'oppose' | 'neutral' | 'question';
    reasoning: string;
    tradeoffs?: string[];
    alternatives?: string[];
  };
}

/**
 * Update post input
 */
export interface UpdatePostInput {
  content?: string;
  position?: {
    stance: 'support' | 'oppose' | 'neutral' | 'question';
    reasoning: string;
    tradeoffs?: string[];
    alternatives?: string[];
  };
}

/**
 * Create a new post
 */
export async function createPost(input: CreatePostInput): Promise<Post> {
  const result = await query<PostRow>(
    `INSERT INTO forum_posts (
      topic_id,
      author_id,
      content,
      position_stance,
      position_reasoning,
      position_tradeoffs,
      position_alternatives
    )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      input.topicId,
      input.authorId,
      input.content,
      input.position?.stance || null,
      input.position?.reasoning || null,
      input.position?.tradeoffs || [],
      input.position?.alternatives || [],
    ]
  );

  return toPost(result.rows[0]);
}

/**
 * Get post by ID
 */
export async function getPostById(id: string): Promise<Post | null> {
  const result = await query<PostRow>(
    `SELECT * FROM forum_posts
     WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );

  return result.rows[0] ? toPost(result.rows[0]) : null;
}

/**
 * List posts by topic ID
 */
export async function listPostsByTopic(
  topicId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{
  posts: Post[];
  total: number;
}> {
  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM forum_posts
     WHERE topic_id = $1 AND deleted_at IS NULL`,
    [topicId]
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Get posts
  const result = await query<PostRow>(
    `SELECT * FROM forum_posts
     WHERE topic_id = $1 AND deleted_at IS NULL
     ORDER BY created_at ASC
     LIMIT $2 OFFSET $3`,
    [topicId, limit, offset]
  );

  return {
    posts: result.rows.map(toPost),
    total,
  };
}

/**
 * List posts by author ID
 */
export async function listPostsByAuthor(
  authorId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{
  posts: Post[];
  total: number;
}> {
  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM forum_posts
     WHERE author_id = $1 AND deleted_at IS NULL`,
    [authorId]
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Get posts
  const result = await query<PostRow>(
    `SELECT * FROM forum_posts
     WHERE author_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [authorId, limit, offset]
  );

  return {
    posts: result.rows.map(toPost),
    total,
  };
}

/**
 * Update a post
 */
export async function updatePost(
  id: string,
  updates: UpdatePostInput
): Promise<Post> {
  const fields: string[] = [];
  const params: any[] = [];
  let paramCount = 1;

  if (updates.content !== undefined) {
    fields.push(`content = $${paramCount++}`);
    params.push(updates.content);
  }

  if (updates.position !== undefined) {
    fields.push(`position_stance = $${paramCount++}`);
    params.push(updates.position.stance);

    fields.push(`position_reasoning = $${paramCount++}`);
    params.push(updates.position.reasoning);

    fields.push(`position_tradeoffs = $${paramCount++}`);
    params.push(updates.position.tradeoffs || []);

    fields.push(`position_alternatives = $${paramCount++}`);
    params.push(updates.position.alternatives || []);
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  const result = await query<PostRow>(
    `UPDATE forum_posts
     SET ${fields.join(', ')}
     WHERE id = $${paramCount++} AND deleted_at IS NULL
     RETURNING *`,
    [...params, id]
  );

  if (!result.rows[0]) {
    throw new Error(`Post not found: ${id}`);
  }

  return toPost(result.rows[0]);
}

/**
 * Delete a post (soft delete)
 */
export async function deletePost(id: string): Promise<void> {
  await query(
    `UPDATE forum_posts
     SET deleted_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
}
