/**
 * Forum Flags API Routes
 * GET /api/forum/flags - List all flags (moderation queue)
 * POST /api/forum/flags - Create a new flag
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  listPendingFlags,
  createFlag,
} from '@togetheros/db/forum-flags'

/**
 * GET /api/forum/flags
 * List all flags (moderation queue)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // For now, only support pending flags (moderation queue)
    // To support all statuses, we'd need a different function
    if (status === 'pending' || !status) {
      const result = await listPendingFlags(limit, offset)
      return NextResponse.json(result)
    }

    // For other statuses, return empty list for now
    return NextResponse.json({ flags: [], total: 0 })
  } catch (error: any) {
    console.error('Error fetching flags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch flags' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/forum/flags
 * Create a new flag
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contentId, contentType, flaggerId, reason, details } = body

    if (!contentId || !contentType || !flaggerId || !reason) {
      return NextResponse.json(
        { error: 'contentId, contentType, flaggerId, and reason are required' },
        { status: 400 }
      )
    }

    const flag = await createFlag({
      contentId,
      contentType,
      flaggerId,
      reason,
      details,
    })

    return NextResponse.json(flag, { status: 201 })
  } catch (error: any) {
    console.error('Error creating flag:', error)
    return NextResponse.json(
      { error: 'Failed to create flag' },
      { status: 500 }
    )
  }
}
