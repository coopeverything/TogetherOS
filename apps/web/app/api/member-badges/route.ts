/**
 * Member Badges API
 * GET /api/member-badges - Get current user's badges with progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { getBadgesWithMemberStatus } from '@/lib/db/badges';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const badgesWithStatus = await getBadgesWithMemberStatus(user.id);

    // Calculate summary stats
    const earned = badgesWithStatus.filter(b => b.earned).length;
    const total = badgesWithStatus.length;

    return NextResponse.json({
      badges: badgesWithStatus,
      summary: {
        earned,
        total,
        percentage: total > 0 ? Math.round((earned / total) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Get member badges error:', error);
    return NextResponse.json(
      { error: 'Failed to get badges' },
      { status: 500 }
    );
  }
}
