/**
 * Search Autocomplete API Endpoint
 * GET /api/search/autocomplete - Get autocomplete suggestions
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import type { AutocompleteResponse, AutocompleteSuggestion } from '@togetheros/types';
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
 * GET /api/search/autocomplete
 * Returns autocomplete suggestions based on:
 * 1. User's recent searches (if authenticated)
 * 2. Popular searches across all users
 * 3. Content title matches
 */
export async function GET(request: NextRequest): Promise<NextResponse<AutocompleteResponse | { error: string }>> {
  try {
    const searchQuery = request.nextUrl.searchParams.get('q') || '';

    if (searchQuery.length < 2) {
      return NextResponse.json({
        suggestions: [],
        query: searchQuery,
      });
    }

    const suggestions: AutocompleteSuggestion[] = [];
    const userId = await getCurrentUserId();
    const searchPattern = `%${searchQuery.toLowerCase()}%`;

    // 1. Get user's recent matching searches (if authenticated)
    if (userId) {
      const recentSearches = await query(
        `SELECT DISTINCT query_text, result_count
         FROM search_queries
         WHERE user_id = $1
           AND query_text != '[REDACTED]'
           AND LOWER(query_text) LIKE $2
         ORDER BY created_at DESC
         LIMIT 3`,
        [userId, searchPattern]
      );

      for (const row of recentSearches.rows) {
        suggestions.push({
          text: String(row.query_text),
          type: 'recent',
          metadata: {
            result_count: parseInt(String(row.result_count || 0), 10),
          },
        });
      }
    }

    // 2. Get popular searches (anonymized - using query patterns, not actual text)
    // We aggregate by similar queries based on result counts
    const popularSearches = await query(
      `SELECT query_text, SUM(result_count) as total_results, COUNT(*) as search_count
       FROM search_queries
       WHERE query_text != '[REDACTED]'
         AND LOWER(query_text) LIKE $1
         AND result_count > 0
       GROUP BY query_text
       HAVING COUNT(*) >= 2
       ORDER BY COUNT(*) DESC, SUM(result_count) DESC
       LIMIT 3`,
      [searchPattern]
    );

    for (const row of popularSearches.rows) {
      const text = String(row.query_text);
      // Don't add duplicates
      if (!suggestions.some(s => s.text.toLowerCase() === text.toLowerCase())) {
        suggestions.push({
          text,
          type: 'popular',
          metadata: {
            result_count: parseInt(String(row.total_results || 0), 10),
          },
        });
      }
    }

    // 3. Get content title suggestions (proposals, topics)
    const contentSuggestions = await query(
      `SELECT title, 'proposal' as content_type
       FROM proposals
       WHERE LOWER(title) LIKE $1
         AND deleted_at IS NULL
       UNION ALL
       SELECT title, 'topic' as content_type
       FROM topics
       WHERE LOWER(title) LIKE $1
         AND deleted_at IS NULL
       ORDER BY title
       LIMIT 5`,
      [searchPattern]
    );

    for (const row of contentSuggestions.rows) {
      const text = String(row.title);
      // Don't add duplicates
      if (!suggestions.some(s => s.text.toLowerCase() === text.toLowerCase())) {
        suggestions.push({
          text,
          type: 'suggestion',
          metadata: {
            content_type: row.content_type as 'proposal' | 'topic',
          },
        });
      }
    }

    // Limit total suggestions to 8
    const limitedSuggestions = suggestions.slice(0, 8);

    return NextResponse.json({
      suggestions: limitedSuggestions,
      query: searchQuery,
    });
  } catch (error) {
    console.error('Autocomplete API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
