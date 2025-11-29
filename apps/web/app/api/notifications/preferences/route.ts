// apps/web/app/api/notifications/preferences/route.ts
// GET /api/notifications/preferences - Get user preferences
// PUT /api/notifications/preferences - Update user preferences

import { NextRequest, NextResponse } from 'next/server'
import {
  getNotificationPreferences,
  updatePreferences,
} from '../../../../../api/src/modules/notifications/handlers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // TODO: Get userId from session/auth
    const userId = searchParams.get('userId') || '00000000-0000-0000-0000-000000000001'

    const preferences = await getNotificationPreferences(userId)
    return NextResponse.json({ preferences })
  } catch (error: unknown) {
    console.error('GET /api/notifications/preferences error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch preferences' },
      { status: 400 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // TODO: Get userId from session/auth
    const userId = body.userId || '00000000-0000-0000-0000-000000000001'

    const preferences = await updatePreferences(userId, body)
    return NextResponse.json({ preferences })
  } catch (error: unknown) {
    console.error('PUT /api/notifications/preferences error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update preferences' },
      { status: 400 }
    )
  }
}
