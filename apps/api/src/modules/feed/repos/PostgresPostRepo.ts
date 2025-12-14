// apps/api/src/modules/feed/repos/PostgresPostRepo.ts
// PostgreSQL implementation of PostRepo with proper field mapping

import type { Post as PostType, MediaPreview, EmbeddedUrl, PostType as PostTypeEnum, PostStatus } from '@togetheros/types'
import type { PostRepo, CreateNativePostInput, CreateImportPostInput, PostFilters } from './PostRepo'
import { Post } from '../entities/Post'
import { query } from '@togetheros/db'

/**
 * Database row type for posts table
 */
interface PostRow {
  id: string
  type: PostTypeEnum
  author_id: string
  group_id: string | null
  title: string | null
  content: string | null
  embedded_urls: string | EmbeddedUrl[] | null
  media_urls: string[] | null
  source_url: string | null
  source_preview: string | MediaPreview | null
  topics: string[]
  status: PostStatus
  discussion_thread_id: string | null
  discussion_count: number
  created_at: Date
  updated_at: Date
}

export class PostgresPostRepo implements PostRepo {
  /**
   * Create native post
   */
  async createNative(input: CreateNativePostInput): Promise<PostType> {
    const post = Post.createNative(input)
    const postData = post.toJSON()

    const result = await query<PostRow>(
      `INSERT INTO feed_posts (
        id, type, author_id, group_id, title, content, embedded_urls, media_urls,
        source_url, source_preview, topics, status,
        discussion_thread_id, discussion_count, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        postData.id,
        postData.type,
        postData.authorId,
        postData.groupId || null,
        postData.title || null,
        postData.content || null,
        postData.embeddedUrls ? JSON.stringify(postData.embeddedUrls) : null,
        postData.mediaUrls ? JSON.stringify(postData.mediaUrls) : '[]',
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

    const result = await query<PostRow>(
      `INSERT INTO feed_posts (
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
    const result = await query<PostRow>('SELECT * FROM feed_posts WHERE id = $1', [id])
    return result.rows[0] ? this.mapRowToPost(result.rows[0]) : null
  }

  /**
   * List posts with filters
   */
  async list(filters: PostFilters = {}): Promise<PostType[]> {
    const conditions: string[] = []
    const params: (string | number)[] = []
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

    const result = await query<PostRow>(
      `SELECT * FROM feed_posts ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    )

    return result.rows.map((row: PostRow) => this.mapRowToPost(row))
  }

  /**
   * Count posts with filters
   */
  async count(filters: PostFilters = {}): Promise<number> {
    const conditions: string[] = []
    const params: (string | number)[] = []
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
      `SELECT COUNT(*) as count FROM feed_posts ${whereClause}`,
      params
    )

    return parseInt(result.rows[0].count, 10)
  }

  /**
   * Open discussion on post
   */
  async openDiscussion(postId: string, threadId: string): Promise<void> {
    await query(
      'UPDATE feed_posts SET discussion_thread_id = $1 WHERE id = $2',
      [threadId, postId]
    )
  }

  /**
   * Increment discussion count
   */
  async incrementDiscussionCount(postId: string): Promise<void> {
    await query(
      'UPDATE feed_posts SET discussion_count = discussion_count + 1 WHERE id = $1',
      [postId]
    )
  }

  /**
   * Archive post
   */
  async archive(postId: string): Promise<void> {
    await query(
      "UPDATE feed_posts SET status = 'archived' WHERE id = $1",
      [postId]
    )
  }

  /**
   * Flag post for moderation
   */
  async flag(postId: string): Promise<void> {
    await query(
      "UPDATE feed_posts SET status = 'flagged' WHERE id = $1",
      [postId]
    )
  }

  /**
   * Update post
   */
  async update(id: string, updates: Partial<{
    title: string
    content: string
    topics: string[]
  }>): Promise<PostType> {
    const setClauses: string[] = []
    const params: (string | string[] | Date)[] = []
    let paramIndex = 1

    if (updates.title !== undefined) {
      setClauses.push(`title = $${paramIndex}`)
      params.push(updates.title)
      paramIndex++
    }

    if (updates.content !== undefined) {
      setClauses.push(`content = $${paramIndex}`)
      params.push(updates.content)
      paramIndex++
    }

    if (updates.topics !== undefined) {
      setClauses.push(`topics = $${paramIndex}`)
      params.push(updates.topics)
      paramIndex++
    }

    // Always update updated_at timestamp
    setClauses.push(`updated_at = $${paramIndex}`)
    params.push(new Date())
    paramIndex++

    // Add post ID as last parameter
    params.push(id)

    const result = await query<PostRow>(
      `UPDATE feed_posts SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    )

    if (result.rows.length === 0) {
      throw new Error(`Post ${id} not found`)
    }

    return this.mapRowToPost(result.rows[0])
  }

  /**
   * Delete post
   */
  async delete(id: string): Promise<void> {
    await query('DELETE FROM feed_posts WHERE id = $1', [id])
  }

  /**
   * Get all unique topics
   */
  async getTopics(): Promise<string[]> {
    const result = await query<{ topic: string }>(
      `SELECT DISTINCT unnest(topics) as topic FROM feed_posts ORDER BY topic`
    )
    return result.rows.map(row => row.topic)
  }

  // ============================================
  // Reaction Methods
  // ============================================

  /**
   * Add a reaction to a post
   * Returns the created reaction or null if it already exists
   */
  async addReaction(postId: string, userId: string, reactionType: string): Promise<{
    id: string
    postId: string
    userId: string
    type: string
    createdAt: Date
  } | null> {
    try {
      const result = await query<{
        id: string
        post_id: string
        user_id: string
        reaction_type: string
        created_at: Date
      }>(
        `INSERT INTO feed_reactions (post_id, user_id, reaction_type)
         VALUES ($1, $2, $3)
         ON CONFLICT (post_id, user_id, reaction_type) DO NOTHING
         RETURNING *`,
        [postId, userId, reactionType]
      )

      if (result.rows.length === 0) {
        return null // Already exists
      }

      return {
        id: result.rows[0].id,
        postId: result.rows[0].post_id,
        userId: result.rows[0].user_id,
        type: result.rows[0].reaction_type,
        createdAt: new Date(result.rows[0].created_at),
      }
    } catch (error) {
      console.error('Error adding reaction:', error)
      throw error
    }
  }

  /**
   * Remove a reaction from a post
   * Returns true if deleted, false if not found
   */
  async removeReaction(postId: string, userId: string, reactionType: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM feed_reactions WHERE post_id = $1 AND user_id = $2 AND reaction_type = $3`,
      [postId, userId, reactionType]
    )
    return (result.rowCount ?? 0) > 0
  }

  /**
   * Get reaction counts for a post
   */
  async getReactionCounts(postId: string): Promise<{
    care: number
    insightful: number
    agree: number
    disagree: number
    act: number
    question: number
    total: number
  }> {
    const result = await query<{ reaction_type: string; count: string }>(
      `SELECT reaction_type, COUNT(*) as count
       FROM feed_reactions
       WHERE post_id = $1
       GROUP BY reaction_type`,
      [postId]
    )

    const counts = {
      care: 0,
      insightful: 0,
      agree: 0,
      disagree: 0,
      act: 0,
      question: 0,
      total: 0,
    }

    for (const row of result.rows) {
      const count = parseInt(row.count, 10)
      if (row.reaction_type in counts) {
        (counts as any)[row.reaction_type] = count
      }
      counts.total += count
    }

    return counts
  }

  /**
   * Get user's reactions on a post
   */
  async getUserReactions(postId: string, userId: string): Promise<string[]> {
    const result = await query<{ reaction_type: string }>(
      `SELECT reaction_type FROM feed_reactions WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    )
    return result.rows.map(row => row.reaction_type)
  }

  /**
   * Check if a user has reacted to a post with a specific type
   */
  async hasReaction(postId: string, userId: string, reactionType: string): Promise<boolean> {
    const result = await query<{ exists: boolean }>(
      `SELECT EXISTS(
        SELECT 1 FROM feed_reactions
        WHERE post_id = $1 AND user_id = $2 AND reaction_type = $3
      ) as exists`,
      [postId, userId, reactionType]
    )
    return result.rows[0]?.exists ?? false
  }

  /**
   * Map database row to Post type
   * Handles snake_case → camelCase conversion and JSONB parsing
   */
  private mapRowToPost(row: PostRow): PostType {
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

    // Parse media_urls from JSONB
    const mediaUrls: string[] | undefined = row.media_urls
      ? (typeof row.media_urls === 'string'
          ? JSON.parse(row.media_urls)
          : row.media_urls)
      : undefined

    return {
      id: row.id,
      type: row.type,
      authorId: row.author_id,         // snake_case → camelCase
      groupId: row.group_id ?? undefined,            // snake_case → camelCase, null → undefined
      title: row.title ?? undefined,
      content: row.content ?? undefined,
      embeddedUrls,                     // JSONB parsed
      mediaUrls: mediaUrls && mediaUrls.length > 0 ? mediaUrls : undefined,
      sourceUrl: row.source_url ?? undefined,        // snake_case → camelCase, null → undefined
      sourcePreview,                    // JSONB parsed
      topics: row.topics,               // PostgreSQL TEXT[] auto-converted to string[]
      status: row.status,
      discussionThreadId: row.discussion_thread_id ?? undefined,  // snake_case → camelCase, null → undefined
      discussionCount: row.discussion_count,         // snake_case → camelCase
      createdAt: new Date(row.created_at),           // TIMESTAMP → Date
      updatedAt: new Date(row.updated_at),           // TIMESTAMP → Date
    }
  }
}
