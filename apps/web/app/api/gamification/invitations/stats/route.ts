// apps/web/app/api/gamification/invitations/stats/route.ts
// GET /api/gamification/invitations/stats - Get invitation statistics for user

import { NextRequest, NextResponse } from 'next/server'
import { getInvitationStats, hasInvitePrivileges } from '@/lib/db/invitations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // TODO: Get userId from session/auth
    const userId = searchParams.get('userId') || '00000000-0000-0000-0000-000000000001'

    const stats = await getInvitationStats(userId)
    const canInvite = await hasInvitePrivileges(userId)

    return NextResponse.json({
      ...stats,
      canInvite,
      remainingThisWeek: Math.max(0, stats.weeklyLimit - stats.sentThisWeek)
    })
  } catch (error: any) {
    console.error('GET /api/gamification/invitations/stats error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch invitation stats' },
      { status: 500 }
    )
  }
}
