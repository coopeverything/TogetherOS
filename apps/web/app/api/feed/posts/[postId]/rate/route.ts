/**
 * Post Rating API
 * POST /api/feed/posts/[postId]/rate
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const userId = request.headers.get('x-user-id'); // TODO: Get from session

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { language, originality, tone, argument } = await request.json();

    // Validate all dimensions are present and in range 1-5
    const scores = [language, originality, tone, argument];
    if (scores.some((s) => !s || s < 1 || s > 5)) {
      return NextResponse.json(
        { error: 'All dimensions must be rated 1-5' },
        { status: 400 }
      );
    }

    // Upsert rating
    const result = await query(
      `INSERT INTO post_ratings (
        post_id, user_id,
        language_score, originality_score, tone_score, argument_score
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (post_id, user_id)
      DO UPDATE SET
        language_score = $3,
        originality_score = $4,
        tone_score = $5,
        argument_score = $6,
        updated_at = NOW()
      RETURNING *`,
      [postId, userId, language, originality, tone, argument]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Rating submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const userId = request.headers.get('x-user-id'); // TODO: Get from session

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's existing rating for this post
    const result = await query(
      `SELECT * FROM post_ratings
       WHERE post_id = $1 AND user_id = $2`,
      [postId, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ rated: false });
    }

    return NextResponse.json({
      rated: true,
      rating: {
        language: result.rows[0].language_score,
        originality: result.rows[0].originality_score,
        tone: result.rows[0].tone_score,
        argument: result.rows[0].argument_score,
      },
    });
  } catch (error) {
    console.error('Get rating error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rating' },
      { status: 500 }
    );
  }
}
