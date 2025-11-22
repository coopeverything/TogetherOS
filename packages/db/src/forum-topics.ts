/**
 * Forum Topics database operations
 * Handles CRUD operations for forum discussion topics
 */

import { query } from './index';
import type {
  Topic,
  TopicCategory,
  TopicStatus,
} from '@togetheros/types/forum';

/**
 * Database row type (snake_case from database)
 */
interface TopicRow {
  id: string;
  title: string;
  slug: string;
  description?: string;
  author_id: string;
  group_id?: string;
  category: TopicCategory;
  tags: string[];
  status: TopicStatus;
  is_pinned: boolean;
  is_locked: boolean;
  post_count: number;
  participant_count: number;
  last_activity_at: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

/**
 * Convert database row to domain entity (snake_case → camelCase)
 */
function toTopic(row: TopicRow): Topic {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    authorId: row.author_id,
    groupId: row.group_id,
    category: row.category,
    tags: row.tags,
    status: row.status,
    isPinned: row.is_pinned,
    isLocked: row.is_locked,
    postCount: row.post_count,
    participantCount: row.participant_count,
    lastActivityAt: row.last_activity_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

/**
 * Create topic input
 */
export interface CreateTopicInput {
  title: string;
  description?: string;
  authorId: string;
  groupId?: string;
  category: TopicCategory;
  tags?: string[];
}

/**
 * Update topic input
 */
export interface UpdateTopicInput {
  title?: string;
  description?: string;
  category?: TopicCategory;
  tags?: string[];
  status?: TopicStatus;
  isPinned?: boolean;
  isLocked?: boolean;
}

/**
 * List topics filters
 */
export interface ListTopicsFilters {
  category?: TopicCategory;
  status?: TopicStatus;
  authorId?: string;
  groupId?: string;
  tags?: string[];
  isPinned?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Create a new topic
 */
export async function createTopic(input: CreateTopicInput): Promise<Topic> {
  const result = await query<TopicRow>(
    `INSERT INTO topics (title, description, author_id, group_id, category, tags)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      input.title,
      input.description || null,
      input.authorId,
      input.groupId || null,
      input.category,
      input.tags || [],
    ]
  );

  return toTopic(result.rows[0]);
}

/**
 * Get topic by ID
 */
export async function getTopicById(id: string): Promise<Topic | null> {
  const result = await query<TopicRow>(
    `SELECT * FROM topics
     WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );

  return result.rows[0] ? toTopic(result.rows[0]) : null;
}

/**
 * Get topic by slug
 */
export async function getTopicBySlug(slug: string): Promise<Topic | null> {
  const result = await query<TopicRow>(
    `SELECT * FROM topics
     WHERE slug = $1 AND deleted_at IS NULL`,
    [slug]
  );

  return result.rows[0] ? toTopic(result.rows[0]) : null;
}

/**
 * Get topic by slug or ID (tries slug first, falls back to ID)
 * This allows URLs to accept both /forum/my-topic-slug and /forum/uuid
 */
export async function getTopicBySlugOrId(slugOrId: string): Promise<Topic | null> {
  // Try slug first (more common in URLs)
  let result = await query<TopicRow>(
    `SELECT * FROM topics
     WHERE slug = $1 AND deleted_at IS NULL`,
    [slugOrId]
  );

  // If not found by slug, try by ID (UUID format)
  if (!result.rows[0]) {
    result = await query<TopicRow>(
      `SELECT * FROM topics
       WHERE id = $1 AND deleted_at IS NULL`,
      [slugOrId]
    );
  }

  return result.rows[0] ? toTopic(result.rows[0]) : null;
}

/**
 * List topics with filters
 */
export async function listTopics(filters?: ListTopicsFilters): Promise<{
  topics: Topic[];
  total: number;
}> {
  const conditions: string[] = ['deleted_at IS NULL'];
  const params: any[] = [];
  let paramCount = 1;

  // Build WHERE clause dynamically
  if (filters?.category) {
    conditions.push(`category = $${paramCount++}`);
    params.push(filters.category);
  }

  if (filters?.status) {
    conditions.push(`status = $${paramCount++}`);
    params.push(filters.status);
  }

  if (filters?.authorId) {
    conditions.push(`author_id = $${paramCount++}`);
    params.push(filters.authorId);
  }

  if (filters?.groupId) {
    conditions.push(`group_id = $${paramCount++}`);
    params.push(filters.groupId);
  }

  if (filters?.tags && filters.tags.length > 0) {
    conditions.push(`tags && $${paramCount++}`);
    params.push(filters.tags);
  }

  if (filters?.isPinned !== undefined) {
    conditions.push(`is_pinned = $${paramCount++}`);
    params.push(filters.isPinned);
  }

  const whereClause = conditions.join(' AND ');
  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;

  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM topics WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Get topics
  const result = await query<TopicRow>(
    `SELECT * FROM topics
     WHERE ${whereClause}
     ORDER BY
       is_pinned DESC,
       last_activity_at DESC
     LIMIT $${paramCount++} OFFSET $${paramCount++}`,
    [...params, limit, offset]
  );

  return {
    topics: result.rows.map(toTopic),
    total,
  };
}

/**
 * Update a topic
 */
export async function updateTopic(
  id: string,
  updates: UpdateTopicInput
): Promise<Topic> {
  const fields: string[] = [];
  const params: any[] = [];
  let paramCount = 1;

  if (updates.title !== undefined) {
    fields.push(`title = $${paramCount++}`);
    params.push(updates.title);
  }

  if (updates.description !== undefined) {
    fields.push(`description = $${paramCount++}`);
    params.push(updates.description);
  }

  if (updates.category !== undefined) {
    fields.push(`category = $${paramCount++}`);
    params.push(updates.category);
  }

  if (updates.tags !== undefined) {
    fields.push(`tags = $${paramCount++}`);
    params.push(updates.tags);
  }

  if (updates.status !== undefined) {
    fields.push(`status = $${paramCount++}`);
    params.push(updates.status);
  }

  if (updates.isPinned !== undefined) {
    fields.push(`is_pinned = $${paramCount++}`);
    params.push(updates.isPinned);
  }

  if (updates.isLocked !== undefined) {
    fields.push(`is_locked = $${paramCount++}`);
    params.push(updates.isLocked);
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  const result = await query<TopicRow>(
    `UPDATE topics
     SET ${fields.join(', ')}
     WHERE id = $${paramCount++} AND deleted_at IS NULL
     RETURNING *`,
    [...params, id]
  );

  if (!result.rows[0]) {
    throw new Error(`Topic not found: ${id}`);
  }

  return toTopic(result.rows[0]);
}

/**
 * Delete a topic (soft delete)
 */
export async function deleteTopic(id: string): Promise<void> {
  await query(
    `UPDATE topics
     SET deleted_at = NOW()
     WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
}
