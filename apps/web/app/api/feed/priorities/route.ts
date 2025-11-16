/**
 * Feed Priorities API
 * POST - Upsert user priority
 * GET - Get user's priorities
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@togetheros/db';

export async function POST(request: NextRequest) {
  try {
    const { topic, rank, care_weight } = await request.json();
    const userId = request.headers.get('x-user-id'); // TODO: Get from session

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!topic || !rank) {
      return NextResponse.json(
        { error: 'Topic and rank are required' },
        { status: 400 }
      );
    }

    if (rank < 1 || rank > 10) {
      return NextResponse.json(
        { error: 'Rank must be between 1 and 10' },
        { status: 400 }
      );
    }

    // Upsert priority
    const result = await query(
      `INSERT INTO priorities (user_id, topic, rank, care_weight)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, topic)
       DO UPDATE SET rank = $3, care_weight = $4, updated_at = NOW()
       RETURNING *`,
      [userId, topic, rank, care_weight || 5]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Priority upsert error:', error);
    return NextResponse.json(
      { error: 'Failed to save priority' },
      { status: 500 }
    );
  }
}

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
      `SELECT * FROM priorities
       WHERE user_id = $1
       ORDER BY rank ASC`,
      [userId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Get priorities error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch priorities' },
      { status: 500 }
    );
  }
}
