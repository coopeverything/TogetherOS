/**
 * Admin Badges API
 * GET /api/admin/badges - Get badge stats and recent awards (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { getBadgeStats, getRecentBadgeAwards } from '@/lib/db/badges';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin status
    if (!user.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const [stats, recentAwards] = await Promise.all([
      getBadgeStats(),
      getRecentBadgeAwards(limit),
    ]);

    return NextResponse.json({
      stats,
      recentAwards,
    });
  } catch (error) {
    console.error('Get admin badges error:', error);
    return NextResponse.json(
      { error: 'Failed to get badge data' },
      { status: 500 }
    );
  }
}
