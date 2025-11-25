import { NextRequest, NextResponse } from 'next/server'
import { getInvitationByToken } from '@/lib/db/invitations'

interface RouteParams {
  params: Promise<{ token: string }>
}

/**
 * GET /api/invitations/[token]
 * Get invitation details by token for landing page
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { token } = await params

    if (!token || token.length !== 64) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 400 }
      )
    }

    const invitation = await getInvitationByToken(token)

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Check if expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'This invitation has expired', invitation: { ...invitation, status: 'expired' } },
        { status: 410 }
      )
    }

    // Check if already accepted
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: `This invitation has been ${invitation.status}`, invitation },
        { status: 410 }
      )
    }

    return NextResponse.json({ invitation })
  } catch (error) {
    console.error('Error fetching invitation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitation' },
      { status: 500 }
    )
  }
}
