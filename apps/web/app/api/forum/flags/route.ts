/**
 * Forum Flags API Routes
 * GET /api/forum/flags - List all flags (moderation queue)
 * POST /api/forum/flags - Create a new flag
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  listFlags,
  createFlag,
} from '@togetheros/db/forum-flags'

/**
 * GET /api/forum/flags
 * List all flags (moderation queue)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as 'pending' | 'resolved' | 'dismissed' | null

    const flags = await listFlags(status || undefined)
    return NextResponse.json({ flags })
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
    const { contentId, contentType, flaggedBy, reason, details } = body

    if (!contentId || !contentType || !flaggedBy || !reason) {
      return NextResponse.json(
        { error: 'contentId, contentType, flaggedBy, and reason are required' },
        { status: 400 }
      )
    }

    const flag = await createFlag({
      contentId,
      contentType,
      flaggedBy,
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
