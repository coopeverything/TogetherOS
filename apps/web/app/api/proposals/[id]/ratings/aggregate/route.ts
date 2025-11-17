/**
 * Rating Aggregate API Endpoint
 * GET /api/proposals/[id]/ratings/aggregate - Get aggregated rating statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { getRatingAggregate } from '../../../../../../../api/src/modules/governance/handlers/ratingHandlers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: proposalId } = await params

    const result = await getRatingAggregate(proposalId)

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('GET /api/proposals/[id]/ratings/aggregate error:', error)

    return NextResponse.json(
      { error: error.message || 'Failed to get rating aggregate' },
      { status: 500 }
    )
  }
}
