/**
 * Search API Endpoint
 * GET /api/search
 *
 * Provides global search across:
 * - Proposals (Phase 1)
 * - Forum topics and posts (Phase 2)
 * - Member profiles (Phase 3)
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
  const whereConditions: string[] = ['(LOWER(title) LIKE $1 OR LOWER(summary) LIKE $1)', 'deleted_at IS NULL'];
  const params: unknown[] = [searchPattern];

  // Add cooperation path filter if provided
  if (path) {
    params.push(path);
    whereConditions.push(`cooperation_path = $${params.length}`);
  }

  const whereClause = whereConditions.join(' AND ');

  // Query proposals
  const proposals = await query(
    `SELECT
      id,
      title,
      summary as description,
      status,
      cooperation_path,
      author_id as created_by,
      created_at,
      updated_at,
      (SELECT COUNT(*) FROM proposal_votes WHERE proposal_id = proposals.id) as vote_count,
      (SELECT COALESCE(SUM(amount), 0) FROM support_points_allocations
       WHERE target_type = 'proposal' AND target_id = proposals.id AND status = 'active') as total_sp
    FROM proposals
    WHERE ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total FROM proposals WHERE ${whereClause}`,
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
        path: row.cooperation_path as CooperationPathSlug | undefined,
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
 * Search forum topics (Phase 2)
 */
async function searchTopics(
  searchTerm: string,
  path?: CooperationPathSlug,
  limit = 20,
  offset = 0
): Promise<{ results: SearchResult[]; total: number }> {
  const searchPattern = `%${searchTerm.toLowerCase()}%`;

  // Build WHERE clause for filters
  const whereConditions: string[] = [
    '(LOWER(title) LIKE $1 OR LOWER(description) LIKE $1)',
    'deleted_at IS NULL'
  ];
  const params: unknown[] = [searchPattern];

  // Add cooperation path filter if provided
  if (path) {
    params.push(path);
    whereConditions.push(`cooperation_path = $${params.length}`);
  }

  const whereClause = whereConditions.join(' AND ');

  // Query topics
  const topics = await query(
    `SELECT
      id,
      title,
      description,
      category,
      cooperation_path,
      author_id,
      created_at,
      updated_at,
      post_count,
      participant_count
    FROM topics
    WHERE ${whereClause}
    ORDER BY last_activity_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total FROM topics WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].total, 10);

  // Transform to SearchResult format
  const results: SearchResult[] = topics.rows.map((row: Record<string, unknown>) => {
    const title = String(row.title);
    const description = String(row.description || '');
    const createdAt = new Date(String(row.created_at));
    const daysOld = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // Check for matches
    const titleMatch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const bodyMatch = description.toLowerCase().includes(searchTerm.toLowerCase());
    const exactMatch = title.toLowerCase() === searchTerm.toLowerCase();

    // Calculate engagement
    const postCount = parseInt(String(row.post_count || 0), 10);
    const participantCount = parseInt(String(row.participant_count || 0), 10);
    const engagement = postCount + participantCount * 2;

    // Create excerpt (first 200 chars)
    const excerpt = description.substring(0, 200) + (description.length > 200 ? '...' : '');

    return {
      id: String(row.id),
      type: 'topic' as const,
      title,
      excerpt,
      url: `/forum/${row.id}`,
      metadata: {
        author_id: String(row.author_id),
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
        path: row.cooperation_path as CooperationPathSlug | undefined,
        engagement: {
          comments: postCount,
          views: participantCount,
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
 * Search forum posts (Phase 2)
 */
async function searchPosts(
  searchTerm: string,
  path?: CooperationPathSlug,
  limit = 20,
  offset = 0
): Promise<{ results: SearchResult[]; total: number }> {
  const searchPattern = `%${searchTerm.toLowerCase()}%`;

  // Build WHERE clause for filters
  const whereConditions: string[] = [
    'LOWER(forum_posts.content) LIKE $1',
    'forum_posts.deleted_at IS NULL'
  ];
  const params: unknown[] = [searchPattern];

  // Add cooperation path filter if provided (via parent topic)
  if (path) {
    params.push(path);
    whereConditions.push(`topics.cooperation_path = $${params.length}`);
  }

  const whereClause = whereConditions.join(' AND ');

  // Query posts with topic context
  const posts = await query(
    `SELECT
      forum_posts.id,
      forum_posts.content,
      forum_posts.author_id,
      forum_posts.created_at,
      forum_posts.updated_at,
      topics.id as topic_id,
      topics.title as topic_title,
      topics.cooperation_path
    FROM forum_posts
    INNER JOIN topics ON forum_posts.topic_id = topics.id
    WHERE ${whereClause}
    ORDER BY forum_posts.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total
    FROM forum_posts
    INNER JOIN topics ON forum_posts.topic_id = topics.id
    WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].total, 10);

  // Transform to SearchResult format
  const results: SearchResult[] = posts.rows.map((row: Record<string, unknown>) => {
    const content = String(row.content);
    const topicTitle = String(row.topic_title);
    const createdAt = new Date(String(row.created_at));
    const daysOld = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // Check for matches
    const bodyMatch = content.toLowerCase().includes(searchTerm.toLowerCase());
    const exactMatch = content.toLowerCase() === searchTerm.toLowerCase();

    // Calculate engagement (posts are less prominent than topics/proposals)
    const engagement = 5; // Base engagement for posts

    // Create excerpt (first 200 chars with highlight)
    const excerpt = content.substring(0, 200) + (content.length > 200 ? '...' : '');

    return {
      id: String(row.id),
      type: 'post' as const,
      title: `Re: ${topicTitle}`,
      excerpt,
      url: `/forum/${row.topic_id}#post-${row.id}`,
      metadata: {
        author_id: String(row.author_id),
        created_at: row.created_at as string,
        updated_at: row.updated_at as string,
        path: row.cooperation_path as CooperationPathSlug | undefined,
        engagement: {
          comments: 0,
        },
      },
      relevance_score: calculateRelevanceScore(
        false, // posts don't match titles
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
 * Search profiles (Phase 3)
 */
async function searchProfiles(
  searchTerm: string,
  path?: CooperationPathSlug,
  limit = 20,
  offset = 0
): Promise<{ results: SearchResult[]; total: number }> {
  const searchPattern = `%${searchTerm.toLowerCase()}%`;

  // Build WHERE clause for filters
  const whereConditions: string[] = [
    "(LOWER(display_name) LIKE $1 OR LOWER(handle) LIKE $1 OR LOWER(bio) LIKE $1)",
    "is_active = true",
    "profile_visibility IN ('public', 'members')"
  ];
  const params: unknown[] = [searchPattern];

  // Add cooperation path filter if provided (via user's primary path interest)
  if (path) {
    params.push(path);
    whereConditions.push(`primary_cooperation_path = $${params.length}`);
  }

  const whereClause = whereConditions.join(' AND ');

  // Query profiles
  const profiles = await query(
    `SELECT
      id,
      display_name,
      handle,
      bio,
      avatar_url,
      primary_cooperation_path,
      skills,
      created_at,
      reputation_points,
      (SELECT COUNT(*) FROM proposals WHERE author_id = users.id AND deleted_at IS NULL) as proposal_count
    FROM users
    WHERE ${whereClause}
    ORDER BY reputation_points DESC, created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset]
  );

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total FROM users WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].total, 10);

  // Transform to SearchResult format
  const results: SearchResult[] = profiles.rows.map((row: Record<string, unknown>) => {
    const displayName = String(row.display_name || row.handle);
    const handle = String(row.handle);
    const bio = String(row.bio || '');
    const createdAt = new Date(String(row.created_at));
    const daysOld = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // Check for matches
    const nameMatch = displayName.toLowerCase().includes(searchTerm.toLowerCase());
    const handleMatch = handle.toLowerCase().includes(searchTerm.toLowerCase());
    const bioMatch = bio.toLowerCase().includes(searchTerm.toLowerCase());
    const exactMatch = displayName.toLowerCase() === searchTerm.toLowerCase() ||
                       handle.toLowerCase() === searchTerm.toLowerCase();

    // Calculate engagement based on reputation and proposals
    const reputationPoints = parseInt(String(row.reputation_points || 0), 10);
    const proposalCount = parseInt(String(row.proposal_count || 0), 10);
    const engagement = reputationPoints / 10 + proposalCount * 5;

    // Create excerpt from bio
    const excerpt = bio.substring(0, 200) + (bio.length > 200 ? '...' : '');

    return {
      id: String(row.id),
      type: 'profile' as const,
      title: displayName,
      excerpt: excerpt || `@${handle}`,
      url: `/members/${handle}`,
      metadata: {
        author: displayName,
        author_id: String(row.id),
        created_at: row.created_at as string,
        path: row.primary_cooperation_path as CooperationPathSlug | undefined,
        engagement: {
          reactions: reputationPoints,
          comments: proposalCount,
        },
      },
      relevance_score: calculateRelevanceScore(
        nameMatch || handleMatch,
        bioMatch,
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

    // Perform search
    let results: SearchResult[] = [];
    let total = 0;

    if (params.type === 'all') {
      // Search proposals, topics, posts, and profiles - merge results
      const [proposalResults, topicResults, postResults, profileResults] = await Promise.all([
        searchProposals(params.q, params.path, params.limit, params.offset),
        searchTopics(params.q, params.path, params.limit, params.offset),
        searchPosts(params.q, params.path, params.limit, params.offset),
        searchProfiles(params.q, params.path, params.limit, params.offset),
      ]);

      // Merge and sort by relevance
      results = [
        ...proposalResults.results,
        ...topicResults.results,
        ...postResults.results,
        ...profileResults.results
      ];
      results.sort((a, b) => b.relevance_score - a.relevance_score);
      results = results.slice(0, params.limit);

      total = proposalResults.total + topicResults.total + postResults.total + profileResults.total;
    } else if (params.type === 'proposal') {
      const proposalResults = await searchProposals(
        params.q,
        params.path,
        params.limit,
        params.offset
      );
      results = proposalResults.results;
      total = proposalResults.total;
    } else if (params.type === 'topic') {
      const topicResults = await searchTopics(
        params.q,
        params.path,
        params.limit,
        params.offset
      );
      results = topicResults.results;
      total = topicResults.total;
    } else if (params.type === 'post') {
      const postResults = await searchPosts(
        params.q,
        params.path,
        params.limit,
        params.offset
      );
      results = postResults.results;
      total = postResults.total;
    } else if (params.type === 'profile') {
      const profileResults = await searchProfiles(
        params.q,
        params.path,
        params.limit,
        params.offset
      );
      results = profileResults.results;
      total = profileResults.total;
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
