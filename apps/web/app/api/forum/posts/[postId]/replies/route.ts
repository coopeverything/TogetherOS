/**
 * Forum Replies API Routes
 * GET /api/forum/posts/[postId]/replies - List replies for a post
 * POST /api/forum/posts/[postId]/replies - Create a new reply (requires auth)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createReplySchema } from '@togetheros/validators/forum'
import {
  listRepliesByPost,
  createReply,
} from '@togetheros/db/forum-replies'
import { requireAuth } from '@/lib/auth/middleware'

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
  } catch (error: unknown) {
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
 * Requires authentication - authorId is taken from authenticated user
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    // Require authentication
    const user = await requireAuth(request)

    const { postId } = await params
    const body = await request.json()

    // Validate input - force authorId to authenticated user (prevent impersonation)
    const validated = createReplySchema.parse({
      ...body,
      postId,
      authorId: user.id, // Always use authenticated user's ID
    })

    const reply = await createReply(validated)
    return NextResponse.json(reply, { status: 201 })
  } catch (error: unknown) {
    const err = error as Error & { name?: string; errors?: unknown }
    console.error('Error creating reply:', error)

    if (err.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (err.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: err.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    )
  }
}
