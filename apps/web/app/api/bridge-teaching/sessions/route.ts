// GET /api/bridge-teaching/sessions - List teaching sessions
// POST /api/bridge-teaching/sessions - Create new teaching session

import { NextRequest, NextResponse } from 'next/server'
import { createTeachingSession, listTeachingSessions } from '@togetheros/db'
import { requireAdmin } from '@/lib/auth/middleware'
import type { SessionStatus, SessionIntent } from '@togetheros/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const trainerId = searchParams.get('trainerId') || undefined
    const status = searchParams.get('status') as SessionStatus | undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    const result = await listTeachingSessions({
      trainerId,
      status,
      limit,
      offset,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('GET /api/bridge-teaching/sessions error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireAdmin(request)

    const body = await request.json()
    const { topic, archetypeId, intent } = body

    // Topic is required, but archetypeId is now optional
    if (!topic) {
      return NextResponse.json(
        { error: 'topic is required' },
        { status: 400 }
      )
    }

    // Validate intent if provided
    const validIntents: SessionIntent[] = ['information', 'brainstorm', 'articulation', 'roleplay', 'general']
    if (intent && !validIntents.includes(intent)) {
      return NextResponse.json(
        { error: `Invalid intent. Must be one of: ${validIntents.join(', ')}` },
        { status: 400 }
      )
    }

    const session = await createTeachingSession(
      user.id,
      topic,
      archetypeId || null,
      intent || 'general'
    )
    return NextResponse.json({ session }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/bridge-teaching/sessions error:', error)

    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create session' },
      { status: 500 }
    )
  }
}
