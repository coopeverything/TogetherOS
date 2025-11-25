// apps/web/app/api/gamification/celebrations/[milestoneId]/shown/route.ts
// POST /api/gamification/celebrations/:milestoneId/shown - Mark celebration as shown

import { NextRequest, NextResponse } from 'next/server'
import { markCelebrationShown } from '@/lib/db/milestones'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ milestoneId: string }> }
) {
  try {
    const { milestoneId } = await context.params
    const body = await request.json().catch(() => ({}))

    // TODO: Get userId from session/auth
    const userId = body.userId || '00000000-0000-0000-0000-000000000001'
    const actionTaken = body.actionTaken || false

    const record = await markCelebrationShown(milestoneId, userId, actionTaken)

    return NextResponse.json({
      success: true,
      celebration: record
    })
  } catch (error: any) {
    console.error('POST /api/gamification/celebrations/[milestoneId]/shown error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to mark celebration as shown' },
      { status: 500 }
    )
  }
}
