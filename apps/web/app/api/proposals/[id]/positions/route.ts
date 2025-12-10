/**
 * Proposal Positions API Endpoint
 * POST /api/proposals/[id]/positions - Add or update position
 * GET /api/proposals/[id]/positions - Get all positions
 * DELETE /api/proposals/[id]/positions - Delete own position
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import {
  addOrUpdatePosition,
  getProposalPositions,
  deletePosition,
  getPositionStats,
} from '../../../../../../api/src/modules/governance/handlers/positionHandlers'

/**
 * Add or update a position
 * POST /api/proposals/[id]/positions
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id: proposalId } = await params
    const body = await request.json()

    // Validate required fields
    if (!body.stance || !['support', 'oppose', 'abstain', 'block'].includes(body.stance)) {
      return NextResponse.json(
        { error: 'Invalid stance. Must be one of: support, oppose, abstain, block' },
        { status: 400 }
      )
    }

    if (!body.reasoning || body.reasoning.trim().length < 10) {
      return NextResponse.json(
        { error: 'Reasoning must be at least 10 characters' },
        { status: 400 }
      )
    }

    const result = await addOrUpdatePosition({
      proposalId,
      memberId: user.id,
      stance: body.stance,
      reasoning: body.reasoning.trim(),
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('POST /api/proposals/[id]/positions error:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to save position' },
      { status: 500 }
    )
  }
}

/**
 * Get all positions for a proposal
 * GET /api/proposals/[id]/positions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: proposalId } = await params

    // Include stats in response
    const includeStats = request.nextUrl.searchParams.get('includeStats') === 'true'

    const positions = await getProposalPositions(proposalId)

    if (includeStats) {
      const stats = await getPositionStats(proposalId)
      return NextResponse.json({ positions, stats }, { status: 200 })
    }

    return NextResponse.json(positions, { status: 200 })
  } catch (error: any) {
    console.error('GET /api/proposals/[id]/positions error:', error)

    return NextResponse.json(
      { error: error.message || 'Failed to get positions' },
      { status: 500 }
    )
  }
}

/**
 * Delete own position
 * DELETE /api/proposals/[id]/positions
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id: proposalId } = await params

    await deletePosition(proposalId, user.id, user.id)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('DELETE /api/proposals/[id]/positions error:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to delete position' },
      { status: 500 }
    )
  }
}
