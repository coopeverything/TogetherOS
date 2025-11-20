/**
 * Forum Posts API Routes
 * GET /api/forum/topics/[topicId]/posts - List posts for a topic (accepts slug or ID)
 * POST /api/forum/topics/[topicId]/posts - Create a new post (accepts slug or ID)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createPostSchema } from '@togetheros/validators/forum'
import {
  getTopicBySlugOrId,
  listPostsByTopic,
  createPost,
} from '@togetheros/db'

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
    const body = await request.json()

    // Resolve slug/ID to actual topic
    const topic = await getTopicBySlugOrId(topicId)
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      )
    }

    // Validate input (use actual topic ID)
    const validated = createPostSchema.parse({
      ...body,
      topicId: topic.id,
    })

    const post = await createPost(validated)
    return NextResponse.json(post, { status: 201 })
  } catch (error: any) {
    console.error('Error creating post:', error)

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
