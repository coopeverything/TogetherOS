// apps/web/app/api/gamification/settings/route.ts
// GET/PUT /api/gamification/settings - Get/update user gamification settings

import { NextRequest, NextResponse } from 'next/server'
import { getUserSettings, updateUserSettings } from '@/lib/db/milestones'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // TODO: Get userId from session/auth
    const userId = searchParams.get('userId') || '00000000-0000-0000-0000-000000000001'

    const settings = await getUserSettings(userId)

    // Return defaults if no settings exist
    if (!settings) {
      return NextResponse.json({
        userId,
        quietMode: false,
        hideRpBalance: false,
        showMilestones: true
      })
    }

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('GET /api/gamification/settings error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch gamification settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // TODO: Get userId from session/auth
    const userId = body.userId || '00000000-0000-0000-0000-000000000001'

    const { quietMode, hideRpBalance, showMilestones } = body

    const settings = await updateUserSettings(userId, {
      quietMode,
      hideRpBalance,
      showMilestones
    })

    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error: any) {
    console.error('PUT /api/gamification/settings error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update gamification settings' },
      { status: 500 }
    )
  }
}
