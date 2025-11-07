// apps/api/src/modules/feed/handlers/posts.ts
// API handlers for feed posts and reactions

import type { Post, Reaction, ReactionCounts, ReactionType, EmbeddedUrl } from '@togetheros/types'
import type { PostFilters } from '../repos/PostRepo'
import { PostgresPostRepo } from '../repos/PostgresPostRepo'
import { v4 as uuidv4 } from 'uuid'
import { extractUrls, filterSocialMediaUrls, findUrlPosition } from '../../services/urlParser'
import { fetchSocialMediaPreview } from '../../services/socialMediaFetcher'

// Singleton repo for PostgreSQL storage
let postRepo: PostgresPostRepo | null = null
const reactions = new Map<string, Reaction[]>() // postId -> reactions (TODO: move to database)

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
}): Promise<Post> {
  const repo = getPostRepo()

  if (body.type === 'native') {
    if (!body.content) {
      throw new Error('Native posts require content')
    }

    // Auto-detect social media URLs in content
    let embeddedUrls: EmbeddedUrl[] | undefined
    const urls = extractUrls(body.content)
    const socialMediaUrls = filterSocialMediaUrls(urls)

    if (socialMediaUrls.length > 0) {
      // Fetch previews for detected social media URLs
      const ip = body.ip || '127.0.0.1'
      embeddedUrls = []

      for (const url of socialMediaUrls) {
        try {
          const preview = await fetchSocialMediaPreview(url, ip)
          if (preview) {
            embeddedUrls.push({
              url,
              preview,
              position: findUrlPosition(body.content, url),
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

  // Get post to verify it exists
  const repo = getPostRepo()
  const post = await repo.findById(postId)
  if (!post) {
    throw new Error(`Post ${postId} not found`)
  }

  // Get reactions for this post
  if (!reactions.has(postId)) {
    reactions.set(postId, [])
  }
  const postReactions = reactions.get(postId)!

  // Check if user already reacted with this type
  const existingIndex = postReactions.findIndex(
    (r) => r.userId === userId && r.type === type
  )

  if (existingIndex >= 0) {
    // Remove reaction (toggle off)
    postReactions.splice(existingIndex, 1)
    return { added: false }
  } else {
    // Add reaction
    const reaction: Reaction = {
      id: uuidv4(),
      postId,
      userId,
      type,
      createdAt: new Date(),
    }
    postReactions.push(reaction)
    return { added: true, reaction }
  }
}

/**
 * GET /api/feed/:id/reactions
 * Get reaction counts for a post
 */
export async function getReactionCounts(postId: string): Promise<ReactionCounts> {
  const postReactions = reactions.get(postId) || []

  const counts: ReactionCounts = {
    care: 0,
    insightful: 0,
    agree: 0,
    disagree: 0,
    act: 0,
    question: 0,
    total: postReactions.length,
  }

  for (const reaction of postReactions) {
    counts[reaction.type]++
  }

  return counts
}

/**
 * GET /api/feed/:id/reactions/user/:userId
 * Get user's reactions on a post
 */
export async function getUserReactions(
  postId: string,
  userId: string
): Promise<ReactionType[]> {
  const postReactions = reactions.get(postId) || []
  return postReactions
    .filter((r) => r.userId === userId)
    .map((r) => r.type)
}
