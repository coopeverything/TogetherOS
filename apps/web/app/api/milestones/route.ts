// apps/web/app/api/milestones/route.ts
// GET /api/milestones - Get all milestone definitions

import { NextRequest, NextResponse } from 'next/server'
import { getMilestones } from '../../../../api/src/modules/groups/handlers/growth'

export async function GET(request: NextRequest) {
  try {
    const milestones = await getMilestones()
    return NextResponse.json({ milestones })
  } catch (error) {
    console.error('GET /api/milestones error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
      { status: 500 }
    )
  }
}
