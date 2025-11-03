// apps/web/app/api/groups/[groupId]/growth/route.ts
// GET /api/groups/:groupId/growth - Get growth data for a specific group

import { NextRequest, NextResponse } from 'next/server'
import { getGroupGrowth } from '../../../../../../api/src/modules/groups/handlers/growth'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await context.params

    const growthData = await getGroupGrowth(groupId)

    if (!growthData) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(growthData)
  } catch (error) {
    console.error('GET /api/groups/[groupId]/growth error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch group growth data' },
      { status: 500 }
    )
  }
}
