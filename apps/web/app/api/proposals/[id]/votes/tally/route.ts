/**
 * Vote Tally API Endpoint
 * GET /api/proposals/[id]/votes/tally - Get vote counts and decision status
 */

import { NextRequest, NextResponse } from 'next/server'
import { getVoteTally } from '../../../../../../../api/src/modules/governance/handlers/voting'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const proposalId = params.id

    // Parse threshold from query params (default 0.5 = 50%)
    const { searchParams } = new URL(request.url)
    const threshold = searchParams.get('threshold')
      ? parseFloat(searchParams.get('threshold')!)
      : 0.5

    if (threshold < 0 || threshold > 1) {
      return NextResponse.json(
        { error: 'Threshold must be between 0 and 1' },
        { status: 400 }
      )
    }

    const result = await getVoteTally(proposalId, threshold)

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('GET /api/proposals/[id]/votes/tally error:', error)

    return NextResponse.json(
      { error: error.message || 'Failed to get vote tally' },
      { status: 500 }
    )
  }
}
