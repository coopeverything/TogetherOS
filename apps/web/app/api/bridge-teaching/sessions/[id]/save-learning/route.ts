/**
 * POST /api/bridge-teaching/sessions/[id]/save-learning
 * Save the reviewed/edited learning as a pattern
 *
 * This is step 2 of 2. Use /extract-learning first to get the draft.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getTeachingSessionById, createPattern } from '@togetheros/db'
import { requireAdmin } from '@/lib/auth/middleware'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAdmin(request)
    const { id: sessionId } = await params

    const body = await request.json()
    const { reflection, principle, guidelines, topicContext } = body as {
      reflection: string
      principle: string
      guidelines?: {
        tone?: string
        openWith?: string
        includeElements?: string[]
        avoid?: string[]
        nudgeToward?: string
      }
      topicContext?: string[]
    }

    if (!reflection || !principle) {
      return NextResponse.json(
        { error: 'reflection and principle are required' },
        { status: 400 }
      )
    }

    const session = await getTeachingSessionById(sessionId)
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Save as a pattern with the reviewed/edited content
    const pattern = await createPattern(
      sessionId,
      session.archetype?.name || session.intent || 'general',
      principle,
      {
        topicContext: topicContext || [],
        responseGuidelines: guidelines || {},
        examples: [{
          topic: session.topic,
          reflection: reflection,
          conversationSummary: session.turns.slice(0, 4).map(t => ({
            speaker: t.speaker,
            message: t.message.slice(0, 200),
          })),
        }],
        confidence: 0.8, // Higher confidence since it was reviewed
        createdBy: user.id,
      }
    )

    return NextResponse.json({
      success: true,
      pattern: {
        id: pattern.id,
        principle: pattern.principle,
        reflection: reflection,
      },
    })
  } catch (error: any) {
    console.error('POST /api/bridge-teaching/sessions/[id]/save-learning error:', error)

    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to save learning' },
      { status: 500 }
    )
  }
}
