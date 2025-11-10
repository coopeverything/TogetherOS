// apps/web/app/api/bridge-training/statistics/route.ts
// GET /api/bridge-training/statistics - Get training statistics

import { NextRequest, NextResponse } from 'next/server'
import { getTrainingStatistics } from '../../../../../api/src/modules/bridge-training/handlers'

export async function GET(request: NextRequest) {
  try {
    const statistics = await getTrainingStatistics()
    return NextResponse.json({ statistics })
  } catch (error: any) {
    console.error('GET /api/bridge-training/statistics error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch training statistics' },
      { status: 400 }
    )
  }
}
