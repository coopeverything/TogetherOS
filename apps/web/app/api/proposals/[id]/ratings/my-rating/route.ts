/**
 * My Rating API Endpoint
 * GET /api/proposals/[id]/ratings/my-rating - Get current user's rating
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { getMyRating } from '../../../../../../../api/src/modules/governance/handlers/ratingHandlers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id: proposalId } = await params

    const result = await getMyRating(proposalId, user.id)

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('GET /api/proposals/[id]/ratings/my-rating error:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to get rating' },
      { status: 500 }
    )
  }
}
