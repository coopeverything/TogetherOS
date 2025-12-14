/**
 * User Interests API
 * GET /api/feed/interests - Get current user's interest profile
 * DELETE /api/feed/interests - Clear current user's interest history
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@togetheros/db';
import { getCurrentUser } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to view interests.' },
        { status: 401 }
      );
    }

    const userId = user.id;

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
    // Require authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to clear interests.' },
        { status: 401 }
      );
    }

    const userId = user.id;

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
