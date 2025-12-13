/**
 * Forum Posts API Routes
 * GET /api/forum/topics/[topicId]/posts - List posts for a topic (accepts slug or ID)
 * POST /api/forum/topics/[topicId]/posts - Create a new post (accepts slug or ID)
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { createPostSchema } from '@togetheros/validators/forum'
import {
  getTopicBySlugOrId,
  listPostsByTopic,
  createPost,
} from '@togetheros/db'
import { reputationService } from '@/lib/services/ReputationService'
import { indexForumPost } from '../../../../../../lib/bridge/content-indexer'

/**
 * GET /api/forum/topics/[topicId]/posts
 * List all posts for a topic (accepts slug or ID)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const { topicId } = await params

    // Resolve slug/ID to actual topic
    const topic = await getTopicBySlugOrId(topicId)
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }

    const { posts, total } = await listPostsByTopic(topic.id)
    return NextResponse.json({ posts, total })
  } catch (error: any) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/forum/topics/[topicId]/posts
 * Create a new post in a topic (accepts slug or ID)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const { topicId } = await params

    // Require authentication
    const user = await requireAuth(request)

    const body = await request.json()

    // Resolve slug/ID to actual topic
    const topic = await getTopicBySlugOrId(topicId)
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }

    // Validate input (use actual topic ID and authenticated user ID)
    const validated = createPostSchema.parse({
      ...body,
      topicId: topic.id,
      authorId: user.id,
    })

    const post = await createPost(validated)

    // Index post for Bridge RAG (non-blocking)
    indexForumPost(post.id, {
      topicId: topic.id,
      topicSlug: topic.slug,
      content: validated.content,
      authorId: user.id,
      createdAt: post.createdAt,
    }).catch((err: unknown) => console.error('Failed to index forum post:', err))

    // Check and award post-related badges
    try {
      await reputationService.checkPostCreationBadges(user.id)
    } catch (badgeError) {
      // Don't fail the request if badge check fails
      console.error('Badge check failed:', badgeError)
    }

    return NextResponse.json(post, { status: 201 })
  } catch (error: any) {
    console.error('Error creating post:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
