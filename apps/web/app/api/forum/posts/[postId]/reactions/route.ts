/**
 * Forum Reactions API Routes (Posts)
 * GET /api/forum/posts/[postId]/reactions - List reactions for a post
 * POST /api/forum/posts/[postId]/reactions - Add reaction to a post (requires auth)
 * DELETE /api/forum/posts/[postId]/reactions - Remove user's reaction from a post (requires auth)
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  listReactionsByContent,
  createReaction,
  deleteUserReaction,
} from '@togetheros/db/forum-reactions'
import { createReactionSchema } from '@togetheros/validators/forum'
import { requireAuth } from '@/lib/auth/middleware'

/**
 * GET /api/forum/posts/[postId]/reactions
 * List all reactions for a post
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const reactions = await listReactionsByContent(postId, 'post')
    return NextResponse.json({ reactions })
  } catch (error: unknown) {
    console.error('Error fetching reactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/forum/posts/[postId]/reactions
 * Add a reaction to a post
 * Requires authentication - userId is taken from authenticated user
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
    const { type } = body

    if (!type) {
      return NextResponse.json(
        { error: 'type is required' },
        { status: 400 }
      )
    }

    // Validate with Zod - force userId to authenticated user (prevent impersonation)
    const validated = createReactionSchema.parse({
      contentId: postId,
      contentType: 'post',
      userId: user.id, // Always use authenticated user's ID
      type,
    })

    const reaction = await createReaction(validated)

    return NextResponse.json(reaction, { status: 201 })
  } catch (error: unknown) {
    const err = error as Error & { name?: string; errors?: unknown }
    console.error('Error creating reaction:', error)

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
      { error: 'Failed to create reaction' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/forum/posts/[postId]/reactions
 * Remove user's reaction from a post
 * Requires authentication - can only delete own reactions
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    // Require authentication
    const user = await requireAuth(request)

    const { postId } = await params

    // Delete the authenticated user's reaction (prevent deleting others' reactions)
    await deleteUserReaction(postId, 'post', user.id)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const err = error as Error
    console.error('Error deleting reaction:', error)

    if (err.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete reaction' },
      { status: 500 }
    )
  }
}
