/**
 * Forum Flag Detail API Routes
 * PATCH /api/forum/flags/[flagId] - Update flag status (resolve/dismiss)
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { updateFlag } from '@togetheros/db/forum-flags'
import { requireAuth } from '@/lib/auth/middleware'

/**
 * Zod schema for flag update request
 */
const updateFlagSchema = z.object({
  status: z.enum(['dismissed', 'action-taken']),
})

/**
 * PATCH /api/forum/flags/[flagId]
 * Update flag status (resolve or dismiss)
 * Requires admin authentication
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ flagId: string }> }
) {
  try {
    // Require admin authentication
    const user = await requireAuth(request)
    if (!user.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { flagId } = await params
    const body = await request.json()

    // Validate request body
    const validated = updateFlagSchema.parse(body)

    // Update flag with reviewer info
    const flag = await updateFlag(flagId, {
      status: validated.status,
      reviewedBy: user.id,
    })

    return NextResponse.json({
      success: true,
      flag,
      message: `Flag ${validated.status === 'dismissed' ? 'dismissed' : 'resolved'}`
    })
  } catch (error: unknown) {
    const err = error as Error & { name?: string; errors?: unknown }
    console.error('Error updating flag:', error)

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

    if (err.message?.includes('not found')) {
      return NextResponse.json(
        { error: 'Flag not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update flag' },
      { status: 500 }
    )
  }
}
