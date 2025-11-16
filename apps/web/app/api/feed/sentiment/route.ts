/**
 * Sentiment API
 * GET /api/feed/sentiment - Get all current topic sentiment
 */

import { NextResponse } from 'next/server';
import { query } from '@togetheros/db';

export async function GET() {
  try {
    const result = await query(
      `SELECT
        topic,
        consensus_score,
        avg_sentiment,
        engagement_level,
        action_readiness,
        last_updated
       FROM current_topic_sentiment
       ORDER BY engagement_level DESC`,
      []
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Get sentiment error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sentiment data' },
      { status: 500 }
    );
  }
}
