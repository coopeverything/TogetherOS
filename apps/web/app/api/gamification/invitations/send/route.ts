// apps/web/app/api/gamification/invitations/send/route.ts
// POST /api/gamification/invitations/send - Send a new invitation

import { NextRequest, NextResponse } from 'next/server'
import { sendInvitation, hasInvitePrivileges, getInvitationStats } from '@/lib/db/invitations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // TODO: Get userId from session/auth
    const inviterId = body.inviterId || '00000000-0000-0000-0000-000000000001'
    const { inviteeEmail, groupId, expirationDays } = body

    // Validate required fields
    if (!inviteeEmail) {
      return NextResponse.json(
        { error: 'inviteeEmail is required' },
        { status: 400 }
      )
    }

    if (!groupId) {
      return NextResponse.json(
        { error: 'groupId is required' },
        { status: 400 }
      )
    }

    // Check if user can invite
    const canInvite = await hasInvitePrivileges(inviterId)
    if (!canInvite) {
      return NextResponse.json(
        { error: 'Invite privileges suspended due to low quality score. Improve your invite quality to regain privileges.' },
        { status: 403 }
      )
    }

    // Check weekly limit
    const stats = await getInvitationStats(inviterId)
    if (stats.sentThisWeek >= stats.weeklyLimit) {
      return NextResponse.json(
        { error: `Weekly invitation limit reached (${stats.weeklyLimit}/week). Try again next week.` },
        { status: 429 }
      )
    }

    // Send invitation
    const invitation = await sendInvitation({
      inviterId,
      inviteeEmail,
      groupId,
      expirationDays
    })

    return NextResponse.json({
      success: true,
      invitation,
      rpAwarded: 25, // Stage 1 reward
      remainingThisWeek: stats.weeklyLimit - stats.sentThisWeek - 1
    }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/gamification/invitations/send error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send invitation' },
      { status: 500 }
    )
  }
}
