/**
 * Public Profile API
 * GET - Get user profile by username
 */

import { NextRequest, NextResponse } from 'next/server';
import { findUserByUsername } from '@/lib/db/users';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    // Fetch user by username
    const user = await findUserByUsername(username);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Don't expose sensitive info in public profiles
    const publicProfile = {
      id: user.id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      avatar_url: user.avatar_url,
      city: user.city,
      state: user.state,
      country: user.country,
      paths: user.paths,
      skills: user.skills,
      can_offer: user.can_offer,
      seeking_help: user.seeking_help,
      created_at: user.created_at,
    };

    return NextResponse.json({ user: publicProfile });
  } catch (error) {
    console.error('Get public profile error:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}
