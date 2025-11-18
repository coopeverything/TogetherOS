/**
 * Forum Posts API Routes
 * GET /api/forum/topics/[topicId]/posts - List posts for a topic
 * POST /api/forum/topics/[topicId]/posts - Create a new post
 */

import { NextRequest, NextResponse } from 'next/server'
import { createPostSchema } from '@togetheros/validators/forum'
import {
  listPostsByTopic,
  createPost,
} from '../../../../../../../../packages/db/src/forum-posts'

/**
 * GET /api/forum/topics/[topicId]/posts
 * List all posts for a topic
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const { topicId } = await params
    const { posts, total } = await listPostsByTopic(topicId)
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
 * Create a new post in a topic
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const { topicId } = await params
    const body = await request.json()

    // Validate input
    const validated = createPostSchema.parse({
      ...body,
      topicId,
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
