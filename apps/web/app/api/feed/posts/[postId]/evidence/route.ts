/**
 * Evidence API
 * POST /api/feed/posts/[postId]/evidence - Add evidence
 * GET /api/feed/posts/[postId]/evidence - List evidence
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@togetheros/db';

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

    const { url, viewpoint, description } = await request.json();

    if (!url || !viewpoint) {
      return NextResponse.json(
        { error: 'URL and viewpoint are required' },
        { status: 400 }
      );
    }

    if (!['support', 'oppose', 'neutral'].includes(viewpoint)) {
      return NextResponse.json(
        { error: 'Invalid viewpoint. Must be support, oppose, or neutral' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO evidence (post_id, user_id, url, viewpoint, description)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [postId, userId, url, viewpoint, description || null]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Add evidence error:', error);
    return NextResponse.json(
      { error: 'Failed to add evidence' },
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
    const result = await query(
      `SELECT
        e.*,
        u.username AS added_by
       FROM evidence e
       JOIN users u ON e.user_id = u.id
       WHERE e.post_id = $1
       ORDER BY e.verified DESC, e.created_at ASC`,
      [postId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Get evidence error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evidence' },
      { status: 500 }
    );
  }
}
