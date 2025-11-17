import { NextRequest, NextResponse } from 'next/server'
import { submitAppeal } from '../../../../../../../apps/api/src/modules/governance/handlers/moderationHandlers'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params
    const body = await request.json()
    const { appealText } = body as { appealText: string }

    if (!appealText) {
      return NextResponse.json({ error: 'Missing required field: appealText' }, { status: 400 })
    }

    const result = await submitAppeal(reviewId, appealText)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[POST /api/moderation/[id]/appeal] Error:', error)
    return NextResponse.json({ error: 'Failed to submit appeal' }, { status: 500 })
  }
}
