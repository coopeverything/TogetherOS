/**
 * Saved Searches API Endpoint
 * GET /api/search/saved - Get user's saved searches
 * POST /api/search/saved - Create a new saved search
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import type { SavedSearch, SavedSearchCreate, SearchFilters } from '@togetheros/types';
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
 * GET /api/search/saved
 * Returns user's saved searches
 */
export async function GET(): Promise<NextResponse<{ savedSearches: SavedSearch[] } | { error: string }>> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Query user's saved searches (most recently used first)
    const result = await query(
      `SELECT
        id,
        name,
        query,
        filters,
        created_at,
        last_used_at,
        use_count
      FROM search_saved_searches
      WHERE user_id = $1
      ORDER BY COALESCE(last_used_at, created_at) DESC`,
      [userId]
    );

    const savedSearches: SavedSearch[] = result.rows.map((row: Record<string, unknown>) => ({
      id: String(row.id),
      name: String(row.name),
      query: String(row.query),
      filters: (row.filters as SearchFilters) || {},
      created_at: String(row.created_at),
      last_used_at: row.last_used_at ? String(row.last_used_at) : null,
      use_count: parseInt(String(row.use_count || 0), 10),
    }));

    return NextResponse.json({ savedSearches });
  } catch (error) {
    console.error('Saved searches GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved searches' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/search/saved
 * Creates a new saved search
 */
export async function POST(request: NextRequest): Promise<NextResponse<{ savedSearch: SavedSearch } | { error: string }>> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json() as SavedSearchCreate;

    // Validate required fields
    if (!body.name || !body.query) {
      return NextResponse.json(
        { error: 'Name and query are required' },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const existing = await query(
      `SELECT id FROM search_saved_searches WHERE user_id = $1 AND name = $2`,
      [userId, body.name]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'A saved search with this name already exists' },
        { status: 409 }
      );
    }

    // Limit saved searches per user (max 25)
    const countResult = await query(
      `SELECT COUNT(*) as count FROM search_saved_searches WHERE user_id = $1`,
      [userId]
    );

    if (parseInt(countResult.rows[0].count, 10) >= 25) {
      return NextResponse.json(
        { error: 'Maximum saved searches limit reached (25)' },
        { status: 400 }
      );
    }

    // Create saved search
    const result = await query(
      `INSERT INTO search_saved_searches (user_id, name, query, filters)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, query, filters, created_at, last_used_at, use_count`,
      [userId, body.name, body.query, JSON.stringify(body.filters || {})]
    );

    const row = result.rows[0];
    const savedSearch: SavedSearch = {
      id: String(row.id),
      name: String(row.name),
      query: String(row.query),
      filters: row.filters as SearchFilters,
      created_at: String(row.created_at),
      last_used_at: null,
      use_count: 0,
    };

    return NextResponse.json({ savedSearch }, { status: 201 });
  } catch (error) {
    console.error('Saved searches POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create saved search' },
      { status: 500 }
    );
  }
}
