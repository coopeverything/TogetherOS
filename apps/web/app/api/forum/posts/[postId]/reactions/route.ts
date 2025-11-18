/**
 * Forum Reactions API Routes (Posts)
 * GET /api/forum/posts/[postId]/reactions - List reactions for a post
 * POST /api/forum/posts/[postId]/reactions - Add reaction to a post
 * DELETE /api/forum/posts/[postId]/reactions - Remove user's reaction from a post
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  listReactionsByContent,
  createReaction,
  deleteReactionByUserAndContent,
} from '@togetheros/db/forum-reactions'

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
  } catch (error: any) {
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
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const body = await request.json()
    const { userId, type } = body

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'userId and type are required' },
        { status: 400 }
      )
    }

    const reaction = await createReaction({
      contentId: postId,
      contentType: 'post',
      userId,
      type,
    })

    return NextResponse.json(reaction, { status: 201 })
  } catch (error: any) {
    console.error('Error creating reaction:', error)
    return NextResponse.json(
      { error: 'Failed to create reaction' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/forum/posts/[postId]/reactions
 * Remove user's reaction from a post
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    await deleteReactionByUserAndContent(userId, postId, 'post')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting reaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete reaction' },
      { status: 500 }
    )
  }
}
