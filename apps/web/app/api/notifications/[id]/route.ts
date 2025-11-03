// apps/web/app/api/notifications/[id]/route.ts
// GET /api/notifications/[id] - Get single notification
// PATCH /api/notifications/[id] - Update notification status
// DELETE /api/notifications/[id] - Delete notification

import { NextRequest, NextResponse } from 'next/server'
import {
  getNotification,
  updateNotificationStatus,
  deleteNotification,
} from '../../../../../api/src/modules/notifications/handlers'
import type { NotificationStatus } from '@togetheros/types'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  const { id } = params
  try {
    const notification = await getNotification(id)

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ notification })
  } catch (error) {
    console.error(`GET /api/notifications/${id} error:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch notification' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  const { id } = params
  try {
    const body = await request.json()

    // TODO: Get userId from session/auth
    const userId = body.userId || '00000000-0000-0000-0000-000000000001'

    if (!body.status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    const notification = await updateNotificationStatus(
      id,
      userId,
      body.status as NotificationStatus
    )

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ notification })
  } catch (error: any) {
    console.error(`PATCH /api/notifications/${id} error:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to update notification' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  const { id } = params
  try {
    const { searchParams } = new URL(request.url)

    // TODO: Get userId from session/auth
    const userId = searchParams.get('userId') || '00000000-0000-0000-0000-000000000001'

    await deleteNotification(id, userId)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(`DELETE /api/notifications/${id} error:`, error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete notification' },
      { status: 400 }
    )
  }
}
