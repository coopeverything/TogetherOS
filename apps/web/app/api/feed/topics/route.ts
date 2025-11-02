// apps/web/app/api/feed/topics/route.ts
// GET /api/feed/topics - List available topics

import { NextResponse } from 'next/server'
import { getTopics } from '../../../../../api/src/modules/feed/handlers/topics'

export async function GET() {
  try {
    const topics = await getTopics()
    return NextResponse.json({ topics })
  } catch (error) {
    console.error('GET /api/feed/topics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    )
  }
}
