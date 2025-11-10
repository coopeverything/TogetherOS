// apps/web/app/api/notifications/actions/mark-all-read/route.ts
// POST /api/notifications/actions/mark-all-read - Mark all notifications as read

import { NextRequest, NextResponse } from 'next/server'
import { markAllAsRead } from '../../../../../../api/src/modules/notifications/handlers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // TODO: Get userId from session/auth
    const userId = body.userId || '00000000-0000-0000-0000-000000000001'

    await markAllAsRead(userId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('POST /api/notifications/actions/mark-all-read error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to mark all as read' },
      { status: 400 }
    )
  }
}
