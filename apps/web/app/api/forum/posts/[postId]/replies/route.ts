/**
 * Forum Replies API Routes
 * GET /api/forum/posts/[postId]/replies - List replies for a post
 * POST /api/forum/posts/[postId]/replies - Create a new reply
 */

import { NextRequest, NextResponse } from 'next/server'
import { createReplySchema } from '@togetheros/validators/forum'
import {
  listRepliesByPost,
  createReply,
} from '@togetheros/db/forum-replies'

/**
 * GET /api/forum/posts/[postId]/replies
 * List all replies for a post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const { replies, total } = await listRepliesByPost(postId)
    return NextResponse.json({ replies, total })
  } catch (error: any) {
    console.error('Error fetching replies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch replies' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/forum/posts/[postId]/replies
 * Create a new reply to a post
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const body = await request.json()

    // Validate input
    const validated = createReplySchema.parse({
      ...body,
      postId,
    })

    const reply = await createReply(validated)
    return NextResponse.json(reply, { status: 201 })
  } catch (error: any) {
    console.error('Error creating reply:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    )
  }
}
