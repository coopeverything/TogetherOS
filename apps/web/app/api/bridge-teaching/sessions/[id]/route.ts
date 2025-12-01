// GET /api/bridge-teaching/sessions/[id] - Get session by ID
// PATCH /api/bridge-teaching/sessions/[id] - Update session status

import { NextRequest, NextResponse } from 'next/server'
import { getTeachingSessionById, updateSessionStatus } from '@togetheros/db'
import { requireAdmin } from '@/lib/auth/middleware'
import type { SessionStatus } from '@togetheros/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getTeachingSessionById(id)

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json({ session })
  } catch (error: any) {
    console.error('GET /api/bridge-teaching/sessions/[id] error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin authentication
    await requireAdmin(request)

    const { id } = await params
    const body = await request.json()
    const { status } = body as { status: SessionStatus }

    if (!status || !['active', 'completed', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (active, completed, archived)' },
        { status: 400 }
      )
    }

    const session = await updateSessionStatus(id, status)

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json({ session })
  } catch (error: any) {
    console.error('PATCH /api/bridge-teaching/sessions/[id] error:', error)

    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to update session' },
      { status: 500 }
    )
  }
}
