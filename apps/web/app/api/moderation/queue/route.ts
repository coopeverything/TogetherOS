import { NextRequest, NextResponse } from 'next/server'
import { getModerationQueue } from '../../../../../../apps/api/src/modules/governance/handlers/moderationHandlers'
import type { ModerationStatus } from '@togetheros/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') as ModerationStatus | null
    const result = await getModerationQueue(status || undefined)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('[GET /api/moderation/queue] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch moderation queue' }, { status: 500 })
  }
}
