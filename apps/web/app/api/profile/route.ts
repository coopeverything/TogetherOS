/**
 * User Profile API
 * GET - Get current user profile
 * PATCH - Update user profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/middleware';
import { updateUser } from '@/lib/db/users';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      username,
      bio,
      avatar_url,
      city,
      state,
      country,
      paths,
      skills,
      can_offer,
      seeking_help,
    } = body;

    // Validate username format if provided
    if (username && !/^[a-zA-Z0-9_-]{3,50}$/.test(username)) {
      return NextResponse.json(
        { error: 'Username must be 3-50 characters and contain only letters, numbers, underscores, and hyphens' },
        { status: 400 }
      );
    }

    const updatedUser = await updateUser(user.id, {
      name,
      username,
      bio,
      avatar_url,
      city,
      state,
      country,
      paths,
      skills,
      can_offer,
      seeking_help,
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    console.error('Update profile error:', error);

    // Handle unique constraint violations
    if (error.code === '23505') {
      if (error.constraint === 'users_username_key') {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
      }
    }

    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
