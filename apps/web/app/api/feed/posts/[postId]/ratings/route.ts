/**
 * Post Aggregate Ratings API
 * GET /api/feed/posts/[postId]/ratings
 * Returns aggregated ratings for a post
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    // Get aggregate ratings from materialized view
    const result = await query(
      `SELECT * FROM post_rating_aggregates
       WHERE post_id = $1`,
      [postId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({
        rated: false,
        count: 0,
      });
    }

    const agg = result.rows[0];

    return NextResponse.json({
      rated: true,
      count: agg.rating_count,
      language: agg.avg_language,
      originality: agg.avg_originality,
      tone: agg.avg_tone,
      argument: agg.avg_argument,
      overall: agg.avg_overall,
    });
  } catch (error) {
    console.error('Get aggregate ratings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}
