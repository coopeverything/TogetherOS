import { NextRequest, NextResponse } from 'next/server'
import { reviewProposal } from '../../../../../../../apps/api/src/modules/governance/handlers/moderationHandlers'

type ModerationDecision = 'approve' | 'reject'
type ModerationAction = 'no_action' | 'edit_required' | 'hidden' | 'removed'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params
    const body = await request.json()
    const { moderatorId, decision, action, moderatorNotes } = body as {
      moderatorId: string
      decision: ModerationDecision
      action?: ModerationAction
      moderatorNotes?: string
    }

    if (!moderatorId || !decision) {
      return NextResponse.json(
        { error: 'Missing required fields: moderatorId, decision' },
        { status: 400 }
      )
    }

    // Default action to 'no_action' if not provided
    const finalAction: ModerationAction = action || 'no_action'

    const result = await reviewProposal(reviewId, moderatorId, decision, finalAction, moderatorNotes)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[POST /api/moderation/[id]/review] Error:', error)
    return NextResponse.json({ error: 'Failed to review proposal' }, { status: 500 })
  }
}
