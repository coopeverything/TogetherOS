/**
 * Proposal Ratings API Endpoint
 * POST /api/proposals/[id]/ratings - Submit or update rating
 * GET /api/proposals/[id]/ratings - Get all ratings for a proposal
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import {
  submitRating,
  getProposalRatings,
} from '../../../../../../api/src/modules/governance/handlers/ratingHandlers'
import { submitRatingSchema } from '@togetheros/validators/governance'

/**
 * Submit or update a rating
 * POST /api/proposals/[id]/ratings
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
    const validatedInput = submitRatingSchema.parse({
      proposalId,
      memberId: user.id,
      clarity: body.clarity,
      importance: body.importance,
      urgency: body.urgency,
      isInnovative: body.isInnovative,
      constructiveness: body.constructiveness,
      feedback: body.feedback,
    })

    const result = await submitRating(validatedInput)

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('POST /api/proposals/[id]/ratings error:', error)

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
      { error: error.message || 'Failed to submit rating' },
      { status: 500 }
    )
  }
}

/**
 * Get all ratings for a proposal
 * GET /api/proposals/[id]/ratings
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: proposalId } = await params

    // Anyone can view ratings (transparency principle)
    const result = await getProposalRatings(proposalId)

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('GET /api/proposals/[id]/ratings error:', error)

    return NextResponse.json(
      { error: error.message || 'Failed to get ratings' },
      { status: 500 }
    )
  }
}
