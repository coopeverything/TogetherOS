// apps/web/app/api/gamification/celebrations/pending/route.ts
// GET /api/gamification/celebrations/pending - Get pending milestone celebrations for user

import { NextRequest, NextResponse } from 'next/server'
import { getPendingCelebrations, getUserSettings } from '@/lib/db/milestones'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // TODO: Get userId from session/auth
    const userId = searchParams.get('userId') || '00000000-0000-0000-0000-000000000001'
    const limit = parseInt(searchParams.get('limit') || '3')

    // Check if user has quiet mode enabled
    const settings = await getUserSettings(userId)
    if (settings?.quietMode) {
      return NextResponse.json({ celebrations: [], quietMode: true })
    }

    const celebrations = await getPendingCelebrations(userId, limit)

    return NextResponse.json({
      celebrations,
      count: celebrations.length,
      quietMode: false
    })
  } catch (error: any) {
    console.error('GET /api/gamification/celebrations/pending error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pending celebrations' },
      { status: 500 }
    )
  }
}
