/**
 * Proposal Votes API Endpoint
 * POST /api/proposals/[id]/votes - Cast or update vote
 * GET /api/proposals/[id]/votes - Get all votes (admin only)
 * GET /api/proposals/[id]/votes/my-vote - Get current user's vote
 * GET /api/proposals/[id]/votes/tally - Get vote tally
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import {
  castVote,
  getProposalVotes,
  getVoteTally,
} from '../../../../../../api/src/modules/governance/handlers/voting'
import { castVoteSchema } from '@togetheros/validators/governance'
import { reputationService } from '@/lib/services/ReputationService'

/**
 * Cast or update a vote
 * POST /api/proposals/[id]/votes
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { id: proposalId } = await params
    const body = await request.json()

    // Validate input
    const validatedInput = castVoteSchema.parse({
      proposalId,
      memberId: user.id,
      voteType: body.voteType,
      reasoning: body.reasoning,
    })

    const result = await castVote(validatedInput)

    // Check and award voting-related badges
    try {
      await reputationService.checkVotingBadges(user.id)
    } catch (badgeError) {
      // Don't fail the request if badge check fails
      console.error('Badge check failed:', badgeError)
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('POST /api/proposals/[id]/votes error:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to cast vote' },
      { status: 500 }
    )
  }
}

/**
 * Get all votes for a proposal (for displaying vote list)
 * GET /api/proposals/[id]/votes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: proposalId } = await params

    // Anyone can view votes (transparency principle)
    const result = await getProposalVotes(proposalId)

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('GET /api/proposals/[id]/votes error:', error)

    return NextResponse.json(
      { error: error.message || 'Failed to get votes' },
      { status: 500 }
    )
  }
}
