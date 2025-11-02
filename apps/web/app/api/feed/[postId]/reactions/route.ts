// apps/web/app/api/feed/[postId]/reactions/route.ts
// POST /api/feed/[postId]/reactions - Toggle reaction
// GET /api/feed/[postId]/reactions - Get reaction counts

import { NextRequest, NextResponse } from 'next/server'
import {
  toggleReaction,
  getReactionCounts,
  getUserReactions,
} from '../../../../../../api/src/modules/feed/handlers/posts'

interface Params {
  params: {
    postId: string
  }
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { postId } = params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (userId) {
      // Get user's reactions on this post
      const userReactions = await getUserReactions(postId, userId)
      return NextResponse.json({ reactions: userReactions })
    } else {
      // Get reaction counts
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
    const { postId } = params
    const body = await request.json()

    // TODO: Get userId from session/auth
    if (!body.userId) {
      body.userId = '00000000-0000-0000-0000-000000000001' // Mock user
    }

    const result = await toggleReaction(postId, body)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('POST /api/feed/[postId]/reactions error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to toggle reaction' },
      { status: 400 }
    )
  }
}
