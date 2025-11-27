/**
 * Search History API Endpoint
 * GET /api/search/history - Get user's search history
 * DELETE /api/search/history - Clear user's search history (GDPR compliance)
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import type { SearchHistoryEntry, SearchFilters } from '@togetheros/types';
import { query } from '@togetheros/db';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret';

interface JWTPayload {
  userId: string;
  email: string;
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
 * GET /api/search/history
 * Returns user's recent search history
 */
export async function GET(request: NextRequest): Promise<NextResponse<{ history: SearchHistoryEntry[] } | { error: string }>> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get limit from query params (default 10, max 50)
    const limit = Math.min(
      parseInt(request.nextUrl.searchParams.get('limit') || '10', 10),
      50
    );

    // Query user's search history (most recent first)
    // Note: We store query_text as '[REDACTED]' for privacy, but we can still use
    // the query_hash to group similar searches
    const result = await query(
      `SELECT
        id,
        query_text,
        filters,
        result_count,
        created_at as timestamp
      FROM search_queries
      WHERE user_id = $1
        AND query_text != '[REDACTED]'
      ORDER BY created_at DESC
      LIMIT $2`,
      [userId, limit]
    );

    const history: SearchHistoryEntry[] = result.rows.map((row: Record<string, unknown>) => ({
      id: String(row.id),
      query: String(row.query_text),
      filters: (row.filters as SearchFilters) || {},
      result_count: parseInt(String(row.result_count || 0), 10),
      timestamp: String(row.timestamp),
    }));

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Search history GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search history' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/search/history
 * Clears user's search history (GDPR compliance)
 */
export async function DELETE(): Promise<NextResponse<{ success: boolean } | { error: string }>> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Delete user's search history
    await query(
      `DELETE FROM search_queries WHERE user_id = $1`,
      [userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Search history DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to clear search history' },
      { status: 500 }
    );
  }
}
