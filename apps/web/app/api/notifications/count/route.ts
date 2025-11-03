// apps/web/app/api/notifications/count/route.ts
// GET /api/notifications/count - Get notification counts

import { NextRequest, NextResponse } from 'next/server'
import { getNotificationCounts } from '../../../../../api/src/modules/notifications/handlers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // TODO: Get userId from session/auth
    const userId = searchParams.get('userId') || '00000000-0000-0000-0000-000000000001'

    const counts = await getNotificationCounts(userId)
    return NextResponse.json(counts)
  } catch (error: any) {
    console.error('GET /api/notifications/count error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notification counts' },
      { status: 400 }
    )
  }
}
