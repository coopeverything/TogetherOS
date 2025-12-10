/**
 * My Position API Endpoint
 * GET /api/proposals/[id]/positions/my-position - Get current user's position
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { getMemberPosition } from '../../../../../../../api/src/modules/governance/handlers/positionHandlers'

/**
 * Get current user's position on a proposal
 * GET /api/proposals/[id]/positions/my-position
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id: proposalId } = await params

    const position = await getMemberPosition(proposalId, user.id)

    return NextResponse.json(position, { status: 200 })
  } catch (error: any) {
    console.error('GET /api/proposals/[id]/positions/my-position error:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to get position' },
      { status: 500 }
    )
  }
}
