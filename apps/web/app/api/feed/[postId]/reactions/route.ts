// apps/web/app/api/feed/[postId]/reactions/route.ts
// POST /api/feed/[postId]/reactions - Toggle reaction
// GET /api/feed/[postId]/reactions - Get reaction counts

import { NextRequest, NextResponse } from 'next/server'
import {
  toggleReaction,
  getReactionCounts,
  getUserReactions,
} from '../../../../../../api/src/modules/feed/handlers/posts'
import { getCurrentUser } from '@/lib/auth/middleware'

interface Params {
  params: Promise<{
    postId: string
  }>
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { postId } = await params

    // Try to get current user for their reactions
    const user = await getCurrentUser(request)

    if (user) {
      // Get user's reactions on this post
      const userReactions = await getUserReactions(postId, user.id)
      const counts = await getReactionCounts(postId)
      return NextResponse.json({
        ...counts,
        userReactions,
      })
    } else {
      // Get reaction counts only (anonymous)
      const counts = await getReactionCounts(postId)
      return NextResponse.json(counts)
    }
  } catch (error: any) {
    console.error('GET /api/feed/[postId]/reactions error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch reactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { postId } = await params

    // Require authentication
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to react to posts.' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const result = await toggleReaction(postId, {
      userId: user.id,
      type: body.type,
    })
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('POST /api/feed/[postId]/reactions error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to toggle reaction' },
      { status: 400 }
    )
  }
}
