// POST /api/bridge-teaching/sessions/[id]/turns - Add turn to session
// PATCH /api/bridge-teaching/sessions/[id]/turns - Provide feedback on turn
// DELETE /api/bridge-teaching/sessions/[id]/turns - Delete a turn

import { NextRequest, NextResponse } from 'next/server'
import { addTurn, provideFeedback, deleteTurn } from '@togetheros/db'
import { requireAdmin } from '@/lib/auth/middleware'
import type { ConversationMode, Speaker, FeedbackRating } from '@togetheros/types'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    await requireAdmin(request)

    const { id: sessionId } = await params
    const body = await request.json()
    const { mode, speaker, message, role, explanation, isDebate, debateType } = body as {
      mode: ConversationMode
      speaker: Speaker
      message: string
      role?: string
      explanation?: string
      isDebate?: boolean
      debateType?: string
    }

    if (!mode || !speaker || !message) {
      return NextResponse.json(
        { error: 'mode, speaker, and message are required' },
        { status: 400 }
      )
    }

    if (!['demo', 'practice', 'discussion'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be demo, practice, or discussion' },
        { status: 400 }
      )
    }

    if (!['trainer', 'bridge'].includes(speaker)) {
      return NextResponse.json(
        { error: 'Invalid speaker. Must be trainer or bridge' },
        { status: 400 }
      )
    }

    const turn = await addTurn(sessionId, mode, speaker, message, {
      role,
      explanation,
      isDebate,
      debateType,
    })

    return NextResponse.json({ turn }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/bridge-teaching/sessions/[id]/turns error:', error)

    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to add turn' },
      { status: 500 }
    )
  }
}

// PATCH /api/bridge-teaching/sessions/[id]/turns - Provide feedback on turn
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    await requireAdmin(request)

    const body = await request.json()
    const { turnId, rating, comment, retryRequested } = body as {
      turnId: string
      rating: FeedbackRating
      comment?: string
      retryRequested?: boolean
    }

    if (!turnId || !rating) {
      return NextResponse.json(
        { error: 'turnId and rating are required' },
        { status: 400 }
      )
    }

    if (!['positive', 'negative', 'neutral'].includes(rating)) {
      return NextResponse.json(
        { error: 'Invalid rating. Must be positive, negative, or neutral' },
        { status: 400 }
      )
    }

    const turn = await provideFeedback(turnId, rating, comment, retryRequested)

    if (!turn) {
      return NextResponse.json({ error: 'Turn not found' }, { status: 404 })
    }

    return NextResponse.json({ turn })
  } catch (error: any) {
    console.error('PATCH /api/bridge-teaching/sessions/[id]/turns error:', error)

    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update turn' },
      { status: 500 }
    )
  }
}

// DELETE /api/bridge-teaching/sessions/[id]/turns - Delete a turn
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request)

    const { searchParams } = new URL(request.url)
    const turnId = searchParams.get('turnId')

    if (!turnId) {
      return NextResponse.json(
        { error: 'turnId query parameter is required' },
        { status: 400 }
      )
    }

    const deleted = await deleteTurn(turnId)

    if (!deleted) {
      return NextResponse.json({ error: 'Turn not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/bridge-teaching/sessions/[id]/turns error:', error)

    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to delete turn' },
      { status: 500 }
    )
  }
}
