/**
 * Badges API
 * GET /api/badges - Get all badge definitions
 */

import { NextResponse } from 'next/server';
import { getAllBadges, getBadgeStats } from '@/lib/db/badges';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';

    const badges = await getAllBadges();

    if (includeStats) {
      const stats = await getBadgeStats();
      return NextResponse.json({ badges, stats });
    }

    return NextResponse.json({ badges });
  } catch (error) {
    console.error('Get badges error:', error);
    return NextResponse.json(
      { error: 'Failed to get badges' },
      { status: 500 }
    );
  }
}
