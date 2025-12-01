// GET /api/bridge-teaching/patterns - List patterns
// POST /api/bridge-teaching/patterns - Create pattern

import { NextRequest, NextResponse } from 'next/server'
import { listPatterns, createPattern } from '@togetheros/db'
import { requireAdmin } from '@/lib/auth/middleware'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const archetype = searchParams.get('archetype') || undefined
    const isActive = searchParams.has('isActive')
      ? searchParams.get('isActive') === 'true'
      : undefined
    const minConfidence = searchParams.get('minConfidence')
      ? parseFloat(searchParams.get('minConfidence')!)
      : undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    const result = await listPatterns({
      archetype,
      isActive,
      minConfidence,
      limit,
      offset,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('GET /api/bridge-teaching/patterns error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch patterns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireAdmin(request)

    const body = await request.json()
    const {
      sessionId,
      archetype,
      principle,
      sentimentMarkers,
      topicContext,
      responseGuidelines,
      examples,
      confidence,
    } = body

    if (!archetype || !principle) {
      return NextResponse.json(
        { error: 'archetype and principle are required' },
        { status: 400 }
      )
    }

    const pattern = await createPattern(sessionId || null, archetype, principle, {
      sentimentMarkers,
      topicContext,
      responseGuidelines,
      examples,
      confidence,
      createdBy: user.id,
    })

    return NextResponse.json({ pattern }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/bridge-teaching/patterns error:', error)

    if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to create pattern' },
      { status: 500 }
    )
  }
}
