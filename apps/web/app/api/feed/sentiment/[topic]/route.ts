/**
 * Topic Sentiment Trends API
 * GET /api/feed/sentiment/[topic] - Get sentiment trends for a specific topic
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@togetheros/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ topic: string }> }
) {
  try {
    const { topic } = await params;
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || 'month';

    // Calculate date range
    let interval = '30 days';
    switch (range) {
      case 'week':
        interval = '7 days';
        break;
      case 'month':
        interval = '30 days';
        break;
      case 'quarter':
        interval = '90 days';
        break;
      case 'year':
        interval = '365 days';
        break;
    }

    const result = await query(
      `SELECT
        topic,
        date,
        consensus_score,
        avg_sentiment,
        engagement_level,
        action_readiness
       FROM topic_sentiment
       WHERE topic = $1
         AND date > NOW() - INTERVAL '${interval}'
       ORDER BY date ASC`,
      [topic]
    );

    // Format dates as ISO strings for JSON
    const formattedRows = result.rows.map((row) => ({
      ...row,
      date: row.date.toISOString().split('T')[0], // YYYY-MM-DD
    }));

    return NextResponse.json(formattedRows);
  } catch (error) {
    console.error('Get sentiment trends error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sentiment trends' },
      { status: 500 }
    );
  }
}
