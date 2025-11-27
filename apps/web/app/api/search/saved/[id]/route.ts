/**
 * Individual Saved Search API Endpoint
 * PUT /api/search/saved/[id] - Mark saved search as used (update last_used_at)
 * DELETE /api/search/saved/[id] - Delete a saved search
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { query } from '@togetheros/db';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret';

interface JWTPayload {
  userId: string;
  email: string;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Get current user ID from JWT token
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const payload = verify(token, JWT_SECRET) as JWTPayload;
    return payload.userId;
  } catch {
    return null;
  }
}

/**
 * PUT /api/search/saved/[id]
 * Marks a saved search as used (updates last_used_at and increments use_count)
 */
export async function PUT(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Update last_used_at and increment use_count
    const result = await query(
      `UPDATE search_saved_searches
       SET last_used_at = NOW(),
           use_count = use_count + 1
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Saved search not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Saved search PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update saved search' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/search/saved/[id]
 * Deletes a saved search
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Delete saved search
    const result = await query(
      `DELETE FROM search_saved_searches
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Saved search not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Saved search DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete saved search' },
      { status: 500 }
    );
  }
}
