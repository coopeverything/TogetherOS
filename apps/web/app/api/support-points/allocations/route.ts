/**
 * Support Points Allocations API
 * GET /api/support-points/allocations - Get user's active allocations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { getSupportPointsAllocations } from '@/lib/db/support-points';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allocations = await getSupportPointsAllocations(user.id);

    return NextResponse.json({ allocations });
  } catch (error) {
    console.error('Get Support Points allocations error:', error);
    return NextResponse.json(
      { error: 'Failed to get allocations' },
      { status: 500 }
    );
  }
}
