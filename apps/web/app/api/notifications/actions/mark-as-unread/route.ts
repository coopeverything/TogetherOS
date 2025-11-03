// apps/web/app/api/notifications/actions/mark-as-unread/route.ts
// POST /api/notifications/actions/mark-as-unread - Mark notification as unread

import { NextRequest, NextResponse } from 'next/server'
import { markAsUnread } from '../../../../../../api/src/modules/notifications/handlers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // TODO: Get userId from session/auth
    const userId = body.userId || '00000000-0000-0000-0000-000000000001'

    if (!body.notificationId) {
      return NextResponse.json(
        { error: 'notificationId is required' },
        { status: 400 }
      )
    }

    const notification = await markAsUnread(body.notificationId, userId)

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ notification })
  } catch (error: any) {
    console.error('POST /api/notifications/actions/mark-as-unread error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to mark as unread' },
      { status: 400 }
    )
  }
}
