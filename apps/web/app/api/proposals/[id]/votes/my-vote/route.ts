/**
 * My Vote API Endpoint
 * GET /api/proposals/[id]/votes/my-vote - Get current user's vote
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import { getMyVote } from '../../../../../../../api/src/modules/governance/handlers/voting'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id: proposalId } = await params

    const result = await getMyVote(proposalId, user.id)

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('GET /api/proposals/[id]/votes/my-vote error:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to get vote' },
      { status: 500 }
    )
  }
}
