/**
 * Profiles Directory API
 * GET - Get all public user profiles
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@togetheros/db';

export async function GET(request: NextRequest) {
  try {
    // Fetch all users with public visibility (respect privacy settings)
    const result = await query(
      `SELECT
        id,
        name,
        username,
        bio,
        avatar_url,
        city,
        state,
        country,
        paths,
        skills,
        created_at
      FROM users
      WHERE deleted_at IS NULL
        AND username IS NOT NULL
        AND profile_visibility = 'public'
      ORDER BY created_at DESC
      LIMIT 100`
    );

    return NextResponse.json({ users: result.rows });
  } catch (error) {
    console.error('Get profiles error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
}
