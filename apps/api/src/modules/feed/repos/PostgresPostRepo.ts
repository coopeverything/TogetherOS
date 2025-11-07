// apps/api/src/modules/feed/repos/PostgresPostRepo.ts
// PostgreSQL implementation of PostRepo with proper field mapping

import type { Post as PostType, MediaPreview, EmbeddedUrl } from '@togetheros/types'
import type { PostRepo, CreateNativePostInput, CreateImportPostInput, PostFilters } from './PostRepo'
import { Post } from '../entities/Post'
import { query } from '@/lib/db'

export class PostgresPostRepo implements PostRepo {
  /**
   * Create native post
   */
  async createNative(input: CreateNativePostInput): Promise<PostType> {
    const post = Post.createNative(input)
    const postData = post.toJSON()

    const result = await query<any>(
      `INSERT INTO posts (
        id, type, author_id, group_id, title, content, embedded_urls,
        source_url, source_preview, topics, status,
        discussion_thread_id, discussion_count, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        postData.id,
        postData.type,
        postData.authorId,
        postData.groupId || null,
        postData.title || null,
        postData.content || null,
        postData.embeddedUrls ? JSON.stringify(postData.embeddedUrls) : null,
        postData.sourceUrl || null,
        postData.sourcePreview ? JSON.stringify(postData.sourcePreview) : null,
        postData.topics,  // PostgreSQL handles TEXT[] natively
        postData.status,
        postData.discussionThreadId || null,
        postData.discussionCount,
        postData.createdAt,
        postData.updatedAt,
      ]
    )

    return this.mapRowToPost(result.rows[0])
  }

  /**
   * Create import post
   */
  async createImport(input: CreateImportPostInput): Promise<PostType> {
    const post = Post.createImport(input)
    const postData = post.toJSON()

    const result = await query<any>(
      `INSERT INTO posts (
        id, type, author_id, group_id, title, content, embedded_urls,
        source_url, source_preview, topics, status,
        discussion_thread_id, discussion_count, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        postData.id,
        postData.type,
        postData.authorId,
        postData.groupId || null,
        postData.title || null,
        postData.content || null,
        postData.embeddedUrls ? JSON.stringify(postData.embeddedUrls) : null,
        postData.sourceUrl || null,
        postData.sourcePreview ? JSON.stringify(postData.sourcePreview) : null,
        postData.topics,
        postData.status,
        postData.discussionThreadId || null,
        postData.discussionCount,
        postData.createdAt,
        postData.updatedAt,
      ]
    )

    return this.mapRowToPost(result.rows[0])
  }

  /**
   * Find post by ID
   */
  async findById(id: string): Promise<PostType | null> {
    const result = await query<any>('SELECT * FROM posts WHERE id = $1', [id])
    return result.rows[0] ? this.mapRowToPost(result.rows[0]) : null
  }

  /**
   * List posts with filters
   */
  async list(filters: PostFilters = {}): Promise<PostType[]> {
    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    // Topic filter (uses PostgreSQL array contains)
    if (filters.topic) {
      conditions.push(`$${paramIndex} = ANY(topics)`)
      params.push(filters.topic)
      paramIndex++
    }

    // Author filter
    if (filters.authorId) {
      conditions.push(`author_id = $${paramIndex}`)
      params.push(filters.authorId)
      paramIndex++
    }

    // Group filter
    if (filters.groupId) {
      conditions.push(`group_id = $${paramIndex}`)
      params.push(filters.groupId)
      paramIndex++
    }

    // Status filter
    if (filters.status) {
      conditions.push(`status = $${paramIndex}`)
      params.push(filters.status)
      paramIndex++
    }

    // Type filter
    if (filters.type) {
      conditions.push(`type = $${paramIndex}`)
      params.push(filters.type)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const limit = filters.limit ?? 20
    const offset = filters.offset ?? 0

    const result = await query<any>(
      `SELECT * FROM posts ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    )

    return result.rows.map(row => this.mapRowToPost(row))
  }

  /**
   * Count posts with filters
   */
  async count(filters: PostFilters = {}): Promise<number> {
    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (filters.topic) {
      conditions.push(`$${paramIndex} = ANY(topics)`)
      params.push(filters.topic)
      paramIndex++
    }

    if (filters.authorId) {
      conditions.push(`author_id = $${paramIndex}`)
      params.push(filters.authorId)
      paramIndex++
    }

    if (filters.groupId) {
      conditions.push(`group_id = $${paramIndex}`)
      params.push(filters.groupId)
      paramIndex++
    }

    if (filters.status) {
      conditions.push(`status = $${paramIndex}`)
      params.push(filters.status)
      paramIndex++
    }

    if (filters.type) {
      conditions.push(`type = $${paramIndex}`)
      params.push(filters.type)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM posts ${whereClause}`,
      params
    )

    return parseInt(result.rows[0].count, 10)
  }

  /**
   * Open discussion on post
   */
  async openDiscussion(postId: string, threadId: string): Promise<void> {
    await query(
      'UPDATE posts SET discussion_thread_id = $1 WHERE id = $2',
      [threadId, postId]
    )
  }

  /**
   * Increment discussion count
   */
  async incrementDiscussionCount(postId: string): Promise<void> {
    await query(
      'UPDATE posts SET discussion_count = discussion_count + 1 WHERE id = $1',
      [postId]
    )
  }

  /**
   * Archive post
   */
  async archive(postId: string): Promise<void> {
    await query(
      "UPDATE posts SET status = 'archived' WHERE id = $1",
      [postId]
    )
  }

  /**
   * Flag post for moderation
   */
  async flag(postId: string): Promise<void> {
    await query(
      "UPDATE posts SET status = 'flagged' WHERE id = $1",
      [postId]
    )
  }

  /**
   * Delete post
   */
  async delete(id: string): Promise<void> {
    await query('DELETE FROM posts WHERE id = $1', [id])
  }

  /**
   * Get all unique topics
   */
  async getTopics(): Promise<string[]> {
    const result = await query<{ topic: string }>(
      `SELECT DISTINCT unnest(topics) as topic FROM posts ORDER BY topic`
    )
    return result.rows.map(row => row.topic)
  }

  /**
   * Map database row to Post type
   * Handles snake_case → camelCase conversion and JSONB parsing
   */
  private mapRowToPost(row: any): PostType {
    // Parse JSONB fields
    const sourcePreview: MediaPreview | undefined = row.source_preview
      ? (typeof row.source_preview === 'string'
          ? JSON.parse(row.source_preview)
          : row.source_preview)
      : undefined

    const embeddedUrls: EmbeddedUrl[] | undefined = row.embedded_urls
      ? (typeof row.embedded_urls === 'string'
          ? JSON.parse(row.embedded_urls)
          : row.embedded_urls)
      : undefined

    return {
      id: row.id,
      type: row.type,
      authorId: row.author_id,         // snake_case → camelCase
      groupId: row.group_id,            // snake_case → camelCase
      title: row.title,
      content: row.content,
      embeddedUrls,                     // JSONB parsed
      sourceUrl: row.source_url,        // snake_case → camelCase
      sourcePreview,                    // JSONB parsed
      topics: row.topics,               // PostgreSQL TEXT[] auto-converted to string[]
      status: row.status,
      discussionThreadId: row.discussion_thread_id,  // snake_case → camelCase
      discussionCount: row.discussion_count,         // snake_case → camelCase
      createdAt: new Date(row.created_at),           // TIMESTAMP → Date
      updatedAt: new Date(row.updated_at),           // TIMESTAMP → Date
    }
  }
}
