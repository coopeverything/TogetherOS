/**
 * User Names API Endpoint
 * POST /api/users/names - Batch fetch user display names by IDs
 */

import { NextRequest, NextResponse } from 'next/server';
import { findUsersByIds } from '@togetheros/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.userIds || !Array.isArray(body.userIds)) {
      return NextResponse.json(
        { error: 'userIds array is required' },
        { status: 400 }
      );
    }

    // Limit batch size to prevent abuse
    if (body.userIds.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 user IDs per request' },
        { status: 400 }
      );
    }

    // Filter to valid UUIDs
    const validIds = body.userIds.filter(
      (id: any) => typeof id === 'string' && id.length > 0
    );

    if (validIds.length === 0) {
      return NextResponse.json({ names: {} });
    }

    // Fetch users
    const users = await findUsersByIds(validIds);

    // Build response: userId -> display name
    const names: Record<string, string> = {};
    validIds.forEach((id: string) => {
      const user = users.get(id);
      if (user) {
        // Prefer display name, then username, then truncated email
        names[id] = user.name || user.username || user.email.split('@')[0];
      } else {
        // User not found - show placeholder
        names[id] = `User ${id.slice(0, 8)}`;
      }
    });

    return NextResponse.json({ names });
  } catch (error: any) {
    console.error('POST /api/users/names error:', error.message || 'Unknown error');
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user names' },
      { status: 500 }
    );
  }
}
