// apps/api/src/modules/feed/handlers/posts.ts
// API handlers for feed posts and reactions

import type { Post, Reaction, ReactionCounts, ReactionType, EmbeddedUrl } from '@togetheros/types'
import type { PostFilters } from '../repos/PostRepo'
import { PostgresPostRepo } from '../repos/PostgresPostRepo'
import { v4 as uuidv4 } from 'uuid'
import { extractUrls, filterSocialMediaUrls, findUrlPosition } from '../../../services/urlParser'
import { fetchSocialMediaPreview } from '../../../services/socialMediaFetcher'

// Singleton repo for PostgreSQL storage
let postRepo: PostgresPostRepo | null = null

/**
 * Get or initialize post repo
 */
function getPostRepo(): PostgresPostRepo {
  if (!postRepo) {
    postRepo = new PostgresPostRepo()
  }
  return postRepo
}

/**
 * GET /api/feed
 * List posts with optional filters
 * Query params: topic, authorId, groupId, status, type, offset, limit
 */
export async function listPosts(filters: PostFilters = {}): Promise<{
  posts: Post[]
  total: number
  hasMore: boolean
}> {
  const repo = getPostRepo()

  const posts = await repo.list(filters)
  const total = await repo.count(filters)
  const limit = filters.limit ?? 20
  const offset = filters.offset ?? 0
  const hasMore = offset + posts.length < total

  return { posts, total, hasMore }
}

/**
 * GET /api/feed/:id
 * Get single post by ID
 */
export async function getPost(id: string): Promise<Post | null> {
  const repo = getPostRepo()
  return repo.findById(id)
}

/**
 * POST /api/feed
 * Create new post (native or import)
 * Body: { type: 'native' | 'import', ...fields, ip?: string }
 */
export async function createPost(body: {
  type: 'native' | 'import'
  authorId: string
  content?: string
  title?: string
  sourceUrl?: string
  preview?: any
  topics: string[]
  groupId?: string
  ip?: string
  mediaUrls?: string[]
}): Promise<Post> {
  const repo = getPostRepo()

  if (body.type === 'native') {
    if (!body.content) {
      throw new Error('Native posts require content')
    }

    // Auto-detect social media URLs in content and title
    let embeddedUrls: EmbeddedUrl[] | undefined
    const allText = [body.title, body.content].filter(Boolean).join(' ')
    const urls = extractUrls(allText)
    const socialMediaUrls = filterSocialMediaUrls(urls)

    if (socialMediaUrls.length > 0) {
      // Fetch previews for detected social media URLs
      const ip = body.ip || '127.0.0.1'
      embeddedUrls = []

      for (const url of socialMediaUrls) {
        try {
          const preview = await fetchSocialMediaPreview(url, ip)
          if (preview) {
            // Find position in title first, then content
            let position = body.title ? findUrlPosition(body.title, url) : -1
            if (position === -1 && body.content) {
              position = findUrlPosition(body.content, url)
            }

            embeddedUrls.push({
              url,
              preview,
              position,
            })
          }
        } catch (error) {
          // Log error but don't fail the whole post
          console.warn(`Failed to fetch preview for ${url}:`, error)
        }
      }
    }

    return repo.createNative({
      authorId: body.authorId,
      content: body.content,
      title: body.title,
      topics: body.topics,
      groupId: body.groupId,
      embeddedUrls: embeddedUrls && embeddedUrls.length > 0 ? embeddedUrls : undefined,
      mediaUrls: body.mediaUrls,
    })
  } else {
    if (!body.sourceUrl || !body.preview) {
      throw new Error('Import posts require sourceUrl and preview')
    }
    return repo.createImport({
      authorId: body.authorId,
      sourceUrl: body.sourceUrl,
      preview: body.preview,
      topics: body.topics,
      groupId: body.groupId,
    })
  }
}

/**
 * POST /api/feed/:id/react
 * Toggle reaction on a post
 * Body: { userId: string, type: ReactionType }
 */
export async function toggleReaction(
  postId: string,
  body: { userId: string; type: ReactionType }
): Promise<{ added: boolean; reaction?: Reaction }> {
  const { userId, type } = body

  const repo = getPostRepo()

  // Get post to verify it exists
  const post = await repo.findById(postId)
  if (!post) {
    throw new Error(`Post ${postId} not found`)
  }

  // Check if user already has this reaction
  const hasExisting = await repo.hasReaction(postId, userId, type)

  if (hasExisting) {
    // Remove reaction (toggle off)
    await repo.removeReaction(postId, userId, type)
    return { added: false }
  } else {
    // Add reaction
    const result = await repo.addReaction(postId, userId, type)
    if (result) {
      const reaction: Reaction = {
        id: result.id,
        postId: result.postId,
        userId: result.userId,
        type: result.type as ReactionType,
        createdAt: result.createdAt,
      }
      return { added: true, reaction }
    }
    // Race condition - already exists
    return { added: false }
  }
}

/**
 * GET /api/feed/:id/reactions
 * Get reaction counts for a post
 */
export async function getReactionCounts(postId: string): Promise<ReactionCounts> {
  const repo = getPostRepo()
  return repo.getReactionCounts(postId)
}

/**
 * GET /api/feed/:id/reactions/user/:userId
 * Get user's reactions on a post
 */
export async function getUserReactions(
  postId: string,
  userId: string
): Promise<ReactionType[]> {
  const repo = getPostRepo()
  const reactions = await repo.getUserReactions(postId, userId)
  return reactions as ReactionType[]
}

/**
 * DELETE /api/feed/:id
 * Delete a post (owner only)
 * Returns: { deleted: boolean }
 */
export async function deletePost(
  postId: string,
  userId: string
): Promise<{ deleted: boolean }> {
  const repo = getPostRepo()

  // Get post to verify it exists and check ownership
  const post = await repo.findById(postId)
  if (!post) {
    throw new Error(`Post ${postId} not found`)
  }

  // Verify ownership
  if (post.authorId !== userId) {
    throw new Error('You can only delete your own posts')
  }

  // Delete post (reactions are cascaded via FK ON DELETE CASCADE)
  await repo.delete(postId)

  return { deleted: true }
}

/**
 * PATCH /api/feed/:id
 * Update a post (owner only)
 * Body: { title?: string, content?: string, topics?: string[] }
 * Returns: Updated post
 */
export async function updatePost(
  postId: string,
  userId: string,
  updates: { title?: string; content?: string; topics?: string[] }
): Promise<Post> {
  const repo = getPostRepo()

  // Get post to verify it exists and check ownership
  const post = await repo.findById(postId)
  if (!post) {
    throw new Error(`Post ${postId} not found`)
  }

  // Verify ownership
  if (post.authorId !== userId) {
    throw new Error('You can only edit your own posts')
  }

  // Only allow updating specific fields
  const allowedUpdates: any = {}
  if (updates.title !== undefined) allowedUpdates.title = updates.title
  if (updates.content !== undefined) allowedUpdates.content = updates.content
  if (updates.topics !== undefined) allowedUpdates.topics = updates.topics

  // Update post
  return repo.update(postId, allowedUpdates)
}
