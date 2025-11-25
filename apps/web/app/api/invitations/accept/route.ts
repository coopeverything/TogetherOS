import { NextRequest, NextResponse } from 'next/server'
import { acceptInvitationByToken, linkInviteeToUser } from '@/lib/db/invitations'
import { getCurrentUser } from '@/lib/auth/middleware'

/**
 * POST /api/invitations/accept
 * Accept an invitation after signup
 * Body: { token: string }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Must be logged in to accept invitation' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { token } = body

    if (!token || token.length !== 64) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 400 }
      )
    }

    // Accept the invitation and award RP
    const invitation = await acceptInvitationByToken(token, user.id)

    // Link the user to the invitation (for tracking)
    await linkInviteeToUser(invitation.id, user.id)

    return NextResponse.json({
      success: true,
      invitation,
      message: 'Invitation accepted! You earned 100 RP.',
    })
  } catch (error) {
    console.error('Error accepting invitation:', error)

    const message = error instanceof Error ? error.message : 'Failed to accept invitation'

    if (message.includes('not found') || message.includes('already processed')) {
      return NextResponse.json({ error: message }, { status: 404 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
