// GET /api/bridge-teaching/statistics - Get teaching statistics

import { NextRequest, NextResponse } from 'next/server'
import { getTeachingStats } from '@togetheros/db'

export async function GET(request: NextRequest) {
  try {
    const stats = await getTeachingStats()
    return NextResponse.json({ stats })
  } catch (error: any) {
    console.error('GET /api/bridge-teaching/statistics error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
