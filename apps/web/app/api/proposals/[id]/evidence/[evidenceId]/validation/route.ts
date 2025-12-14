/**
 * Evidence Validation API Endpoint
 * GET /api/proposals/[id]/evidence/[evidenceId]/validation - Get validation status
 * POST /api/proposals/[id]/evidence/[evidenceId]/validation - Verify or dispute
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/middleware'
import {
  getValidation,
  verifyEvidence,
  disputeEvidence,
  canMemberVote,
} from '../../../../../../../../api/src/modules/governance/handlers/evidenceValidationHandlers'

/**
 * Get validation status for evidence
 * GET /api/proposals/[id]/evidence/[evidenceId]/validation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; evidenceId: string }> }
) {
  try {
    const { evidenceId } = await params

    const validation = await getValidation(evidenceId)

    // Check if current user can vote
    let canVoteResult: { canVote: boolean; reason?: string } = { canVote: true }
    try {
      const user = await requireAuth(request)
      canVoteResult = await canMemberVote(evidenceId, user.id)
    } catch {
      // Not authenticated - cannot vote
      canVoteResult = { canVote: false, reason: 'Authentication required' }
    }

    return NextResponse.json(
      {
        validation,
        canVote: canVoteResult.canVote,
        canVoteReason: canVoteResult.reason,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('GET /api/proposals/[id]/evidence/[evidenceId]/validation error:', error)

    return NextResponse.json(
      { error: error.message || 'Failed to get validation status' },
      { status: 500 }
    )
  }
}

/**
 * Submit verification or dispute
 * POST /api/proposals/[id]/evidence/[evidenceId]/validation
 *
 * Body for verify: { action: 'verify' }
 * Body for dispute: { action: 'dispute', category: string, explanation: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; evidenceId: string }> }
) {
  try {
    const user = await requireAuth(request)
    const { evidenceId } = await params
    const body = await request.json()

    // SECURITY: Strictly validate action to prevent bypass attacks
    // Use explicit string comparison instead of includes() on user input
    const action = typeof body.action === 'string' ? body.action : ''
    const isVerify = action === 'verify'
    const isDispute = action === 'dispute'

    if (!isVerify && !isDispute) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "verify" or "dispute"' },
        { status: 400 }
      )
    }

    let result

    if (isVerify) {
      result = await verifyEvidence(evidenceId, user.id)
    } else {
      // Dispute
      const validCategories = ['inaccurate', 'outdated', 'misleading', 'irrelevant', 'fabricated']
      if (!body.category || !validCategories.includes(body.category)) {
        return NextResponse.json(
          { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
          { status: 400 }
        )
      }

      if (!body.explanation || body.explanation.trim().length < 20) {
        return NextResponse.json(
          { error: 'Explanation must be at least 20 characters' },
          { status: 400 }
        )
      }

      result = await disputeEvidence(
        evidenceId,
        user.id,
        body.category,
        body.explanation.trim()
      )
    }

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    console.error('POST /api/proposals/[id]/evidence/[evidenceId]/validation error:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error.message.includes('already')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: error.message || 'Failed to submit validation' },
      { status: 500 }
    )
  }
}
