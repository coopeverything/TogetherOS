/**
 * Community Priority Statistics API
 * GET /api/feed/community-stats
 *
 * Returns anonymized aggregate priority statistics
 * Privacy-safe: only shows topics with 20+ members
 */

import { NextResponse } from 'next/server';
import { query } from '@togetheros/db';

export async function GET() {
  try {
    const result = await query(
      `SELECT
        topic,
        member_count,
        percentage,
        ROUND(avg_care_weight, 1) AS avg_care_weight
       FROM community_priority_stats
       ORDER BY percentage DESC`,
      []
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Community stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch community statistics' },
      { status: 500 }
    );
  }
}
