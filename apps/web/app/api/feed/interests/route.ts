/**
 * User Interests API
 * GET /api/feed/interests - Get current user's interest profile
 * DELETE /api/feed/interests - Clear current user's interest history
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id'); // TODO: Get from session

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const result = await query(
      `SELECT
        topic,
        engagement_count,
        last_engaged,
        interest_score,
        trend
       FROM user_interests
       WHERE user_id = $1
       ORDER BY interest_score DESC`,
      [userId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Get interests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interests' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id'); // TODO: Get from session

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await query(
      `DELETE FROM user_interests WHERE user_id = $1`,
      [userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Clear interests error:', error);
    return NextResponse.json(
      { error: 'Failed to clear interests' },
      { status: 500 }
    );
  }
}
