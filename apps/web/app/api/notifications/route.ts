// apps/web/app/api/notifications/route.ts
// GET /api/notifications - List user's notifications with filters
// POST /api/notifications - Create new notification

import { NextRequest, NextResponse } from 'next/server'
import {
  listNotifications,
  createNotification,
} from '../../../../api/src/modules/notifications/handlers'
import type { NotificationFilters } from '@togetheros/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // TODO: Get userId from session/auth
    const userId = searchParams.get('userId') || '00000000-0000-0000-0000-000000000001'

    // Parse filters
    const status = searchParams.get('status') || undefined
    const type = searchParams.get('type') || undefined
    const priority = searchParams.get('priority') || undefined
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const filters: NotificationFilters = {
      status: status as any,
      type: type as any,
      priority: priority as any,
      unreadOnly,
      limit,
      offset,
    }

    const result = await listNotifications(userId, filters)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('GET /api/notifications error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 400 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const notification = await createNotification(body)
    return NextResponse.json({ notification }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/notifications error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create notification' },
      { status: 400 }
    )
  }
}
