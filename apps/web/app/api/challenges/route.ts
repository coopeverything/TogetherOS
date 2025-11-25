// GET /api/challenges - Get all challenge definitions

import { NextResponse } from 'next/server'
import { getActiveChallenges, getFirstWeekChallenges } from '@/lib/db/challenges'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const firstWeekOnly = searchParams.get('firstWeek') === 'true'

    const challenges = firstWeekOnly
      ? await getFirstWeekChallenges()
      : await getActiveChallenges()

    return NextResponse.json({ challenges })
  } catch (error: any) {
    console.error('GET /api/challenges error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get challenges' },
      { status: 500 }
    )
  }
}
