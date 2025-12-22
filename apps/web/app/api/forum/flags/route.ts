/**
 * Forum Flags API Routes
 * GET /api/forum/flags - List all flags (moderation queue, requires admin)
 * POST /api/forum/flags - Create a new flag (requires auth)
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  listPendingFlags,
  createFlag,
} from '@togetheros/db/forum-flags'
import { createFlagSchema } from '@togetheros/validators/forum'
import { requireAuth } from '@/lib/auth/middleware'

/**
 * GET /api/forum/flags
 * List all flags (moderation queue)
 * Requires admin authentication to protect flagger identity
 */
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    const user = await requireAuth(request)
    if (!user.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

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
  } catch (error: unknown) {
    const err = error as Error
    console.error('Error fetching flags:', error)

    if (err.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch flags' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/forum/flags
 * Create a new flag
 * Requires authentication - flaggerId is taken from authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request)

    const body = await request.json()
    const { contentId, contentType, reason, details } = body

    // Validate with Zod - force flaggerId to authenticated user (prevent impersonation)
    const validated = createFlagSchema.parse({
      contentId,
      contentType,
      flaggerId: user.id, // Always use authenticated user's ID
      reason,
      details,
    })

    const flag = await createFlag(validated)

    return NextResponse.json(flag, { status: 201 })
  } catch (error: unknown) {
    const err = error as Error & { name?: string; errors?: unknown }
    console.error('Error creating flag:', error)

    if (err.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (err.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: err.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create flag' },
      { status: 500 }
    )
  }
}
