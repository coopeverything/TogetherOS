/**
 * Action Recommendations API
 * GET /api/feed/recommendations - Get personalized action recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@togetheros/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id'); // TODO: Get from session

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '5', 10);
    const topicFilter = searchParams.get('topics')?.split(',');

    // Get user's top interests
    const interestsResult = await query(
      `SELECT topic, interest_score
       FROM user_interests
       WHERE user_id = $1
       ORDER BY interest_score DESC
       LIMIT 10`,
      [userId]
    );

    const userInterests = interestsResult.rows;

    if (userInterests.length === 0) {
      // No interests yet - return empty
      return NextResponse.json([]);
    }

    const topicsList = topicFilter || userInterests.map((i) => i.topic);

    // Find high-readiness topics matching user interests
    const recommendationsResult = await query(
      `SELECT
        'deliberation' AS type,
        topic AS title,
        'This topic is ready for structured deliberation. Your voice is needed.' AS description,
        topic,
        action_readiness AS match_score,
        CASE
          WHEN action_readiness > 0.9 THEN 'high'
          WHEN action_readiness > 0.75 THEN 'medium'
          ELSE 'low'
        END AS urgency,
        '/deliberation?topic=' || topic AS action_url,
        json_build_object(
          'consensus', consensus_score,
          'engagement', engagement_level
        ) AS metadata
       FROM current_topic_sentiment
       WHERE topic = ANY($1)
         AND action_readiness > 0.7
       ORDER BY action_readiness DESC
       LIMIT $2`,
      [topicsList, limit]
    );

    // TODO: Add more recommendation sources:
    // - Active posts needing ratings/evidence
    // - Mutual aid requests matching user skills
    // - Upcoming events for user's local group
    // - Proposals needing review

    const recommendations = recommendationsResult.rows.map((row) => ({
      id: `${row.type}-${row.topic}`,
      ...row,
    }));

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Get recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
