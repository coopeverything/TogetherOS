// apps/web/app/api/groups/by-location/[location]/growth/route.ts
// GET /api/groups/by-location/:location/growth - Get growth data for groups in a specific location

import { NextRequest, NextResponse } from 'next/server'
import { getGroupGrowthByLocation } from '../../../../../../../api/src/modules/groups/handlers/growth'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ location: string }> }
) {
  try {
    const { location } = await context.params

    // Decode URL-encoded location
    const decodedLocation = decodeURIComponent(location)

    const growthData = await getGroupGrowthByLocation(decodedLocation)

    if (!growthData) {
      return NextResponse.json(
        { error: `No local groups found in ${decodedLocation}` },
        { status: 404 }
      )
    }

    return NextResponse.json(growthData)
  } catch (error) {
    console.error('GET /api/groups/by-location/[location]/growth error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch group growth data by location' },
      { status: 500 }
    )
  }
}
