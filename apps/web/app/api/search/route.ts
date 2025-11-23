/**
 * Search API Endpoint
 * GET /api/search
 *
 * Provides global search across proposals (Phase 1)
 * Future phases: forum topics, posts, profiles
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import type {
  SearchQuery,
  SearchResponse,
  SearchResult,
  SearchContentType,
  CooperationPathSlug,
} from '@togetheros/types';
import { query } from '@togetheros/db';

/**
 * Validate and sanitize search query parameters
 */
function parseSearchParams(searchParams: URLSearchParams): SearchQuery {
  const q = searchParams.get('q') || '';
  const type = (searchParams.get('type') || 'all') as SearchContentType;
  const path = searchParams.get('path') as CooperationPathSlug | null;
  const keywords = searchParams.get('keywords')?.split(',').filter(Boolean) || [];
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  return {
    q: q.trim(),
    type,
    path: path || undefined,
    keywords: keywords.length > 0 ? keywords : undefined,
    limit,
    offset,
  };
}

/**
 * Calculate relevance score for search results
 */
function calculateRelevanceScore(
  titleMatch: boolean,
  bodyMatch: boolean,
  exactMatch: boolean,
  daysOld: number,
  engagement: number
): number {
  // Text match score (0-1)
  let textScore = 0;
  if (exactMatch) textScore = 1.0;
  else if (titleMatch) textScore = 0.8;
  else if (bodyMatch) textScore = 0.5;

  // Recency score (0-1)
  let recencyScore = 0.1;
  if (daysOld < 7) recencyScore = 1.0;
  else if (daysOld < 30) recencyScore = 0.5;
  else if (daysOld < 90) recencyScore = 0.25;

  // Engagement score (normalized 0-1)
  const engagementScore = Math.min(engagement / 100, 1.0);

  // Weighted average
  return textScore * 0.5 + recencyScore * 0.3 + engagementScore * 0.2;
}

/**
 * Search proposals (Phase 1 only)
 */
async function searchProposals(
  searchTerm: string,
  path?: CooperationPathSlug,
  limit = 20,
  offset = 0
): Promise<{ results: SearchResult[]; total: number }> {
  const searchPattern = `%${searchTerm.toLowerCase()}%`;

  // Build WHERE clause for filters
  const whereConditions: string[] = ['(LOWER(title) LIKE $1 OR LOWER(description) LIKE $1)'];
  const params: unknown[] = [searchPattern];

  if (path) {
    whereConditions.push(`category = $${params.length + 1}`);
    params.push(path);
  }

  const whereClause = whereConditions.join(' AND ');

  // Query proposals
  const proposals = await query(
    `SELECT
      id,
      title,
      description,
      category,
      status,
      created_by,
      created_at,
      updated_at,
      (SELECT COUNT(*) FROM governance_votes WHERE proposal_id = governance_proposals.id) as vote_count,
      (SELECT SUM(sp_allocated) FROM governance_votes WHERE proposal_id = governance_proposals.id) as total_sp
    FROM governance_proposals
    WHERE ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total FROM governance_proposals WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].total, 10);

  // Transform to SearchResult format
  const results: SearchResult[] = proposals.rows.map((row: Record<string, unknown>) => {
    const title = String(row.title);
    const description = String(row.description || '');
    const createdAt = new Date(String(row.created_at));
    const daysOld = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // Check for matches
    const titleMatch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const bodyMatch = description.toLowerCase().includes(searchTerm.toLowerCase());
    const exactMatch = title.toLowerCase() === searchTerm.toLowerCase();

    // Calculate engagement
    const voteCount = parseInt(String(row.vote_count || 0), 10);
    const totalSp = parseInt(String(row.total_sp || 0), 10);
    const engagement = voteCount + totalSp / 10;

    // Create excerpt (first 200 chars with highlight)
    const excerpt = description.substring(0, 200) + (description.length > 200 ? '...' : '');

    return {
      id: String(row.id),
      type: 'proposal' as const,
      title,
      excerpt,
      url: `/governance/${row.id}`,
      metadata: {
        author_id: String(row.created_by),
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
        path: row.category as CooperationPathSlug,
        engagement: {
          comments: voteCount,
          support_points: totalSp,
        },
      },
      relevance_score: calculateRelevanceScore(
        titleMatch,
        bodyMatch,
        exactMatch,
        daysOld,
        engagement
      ),
    };
  });

  // Sort by relevance score
  results.sort((a, b) => b.relevance_score - a.relevance_score);

  return { results, total };
}

/**
 * Track search query (privacy-preserving)
 */
async function trackSearchQuery(
  searchQuery: string,
  filters: Record<string, unknown>,
  resultCount: number,
  userId?: string
): Promise<void> {
  // Hash query for privacy
  const queryHash = createHash('sha256')
    .update(searchQuery + (userId || 'anonymous'))
    .digest('hex');

  try {
    await query(
      `INSERT INTO search_queries (user_id, query_text, query_hash, filters, result_count)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId || null, '[REDACTED]', queryHash, JSON.stringify(filters), resultCount]
    );
  } catch (error) {
    // Log error but don't fail the search
    console.error('Failed to track search query:', error);
  }
}

/**
 * GET /api/search
 */
export async function GET(request: NextRequest): Promise<NextResponse<SearchResponse | { error: string }>> {
  const startTime = Date.now();

  try {
    // Parse query parameters
    const params = parseSearchParams(request.nextUrl.searchParams);

    // Validate query
    if (!params.q || params.q.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Perform search (Phase 1: proposals only)
    let results: SearchResult[] = [];
    let total = 0;

    if (params.type === 'all' || params.type === 'proposal') {
      const proposalResults = await searchProposals(
        params.q,
        params.path,
        params.limit,
        params.offset
      );
      results = proposalResults.results;
      total = proposalResults.total;
    }

    // Track search query (async, non-blocking)
    trackSearchQuery(
      params.q,
      { type: params.type, path: params.path, keywords: params.keywords },
      total
    ).catch((err) => console.error('Search tracking failed:', err));

    // Build response
    const response: SearchResponse = {
      results,
      total,
      query: params.q,
      filters: {
        type: params.type,
        path: params.path,
        keywords: params.keywords,
      },
      took_ms: Date.now() - startTime,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
