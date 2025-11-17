/**
 * Rating Aggregate API Endpoint
 * GET /api/proposals/[id]/ratings/aggregate - Get aggregated rating statistics
 * Also triggers author rewards for highly-rated proposals
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRatingAggregate } from '../../../../../../../api/src/modules/governance/handlers/ratingHandlers'
import { getProposalById } from '../../../../../../../api/src/modules/governance/handlers/crud'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: proposalId } = await params

    // Fetch proposal to get authorId for rewards
    const proposal = await getProposalById(proposalId)
    const authorId = proposal?.authorId

    const result = await getRatingAggregate(proposalId, authorId)

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('GET /api/proposals/[id]/ratings/aggregate error:', error)

    return NextResponse.json(
      { error: error.message || 'Failed to get rating aggregate' },
      { status: 500 }
    )
  }
}
