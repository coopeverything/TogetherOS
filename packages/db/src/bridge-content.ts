/**
 * Bridge Content Index Database Operations
 *
 * Handles indexing and retrieval of site content for Bridge RAG.
 * Trust-weighted search enables Bridge to use appropriate language
 * based on community validation.
 */

import { query } from './index';
import type {
  IndexableContentType,
  TrustTier,
  IndexedContent,
  ContentEngagement,
  ContentSearchOptions,
  ContentSearchResult,
  TrustThresholds,
  DEFAULT_TRUST_THRESHOLDS,
} from '@togetheros/types';

/**
 * Index or update content in the Bridge search index
 */
export async function indexContent(
  contentType: IndexableContentType,
  contentId: string,
  data: {
    url: string;
    title: string;
    summary?: string;
    keywords?: string[];
    fullText?: string;
    authorId?: string;
    createdAt: Date;
  },
  engagement: ContentEngagement,
  trustTier: TrustTier
): Promise<void> {
  await query(
    `INSERT INTO bridge_content_index (
      content_type, content_id, url, title, summary, keywords, full_text,
      vote_score, rating_avg, reply_count, participant_count,
      total_sp, sp_allocator_count, trust_tier,
      author_id, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    ON CONFLICT (content_type, content_id) DO UPDATE SET
      url = EXCLUDED.url,
      title = EXCLUDED.title,
      summary = EXCLUDED.summary,
      keywords = EXCLUDED.keywords,
      full_text = EXCLUDED.full_text,
      vote_score = EXCLUDED.vote_score,
      rating_avg = EXCLUDED.rating_avg,
      reply_count = EXCLUDED.reply_count,
      participant_count = EXCLUDED.participant_count,
      total_sp = EXCLUDED.total_sp,
      sp_allocator_count = EXCLUDED.sp_allocator_count,
      trust_tier = EXCLUDED.trust_tier,
      updated_at = NOW()`,
    [
      contentType,
      contentId,
      data.url,
      data.title,
      data.summary || null,
      data.keywords || [],
      data.fullText || null,
      engagement.voteScore,
      engagement.ratingAvg,
      engagement.replyCount,
      engagement.participantCount,
      engagement.totalSP,
      engagement.spAllocatorCount,
      trustTier,
      data.authorId || null,
      data.createdAt,
    ]
  );
}

/**
 * Update engagement metrics and trust tier for indexed content
 */
export async function updateContentEngagement(
  contentType: IndexableContentType,
  contentId: string,
  engagement: ContentEngagement,
  trustTier: TrustTier
): Promise<void> {
  await query(
    `UPDATE bridge_content_index SET
      vote_score = $3,
      rating_avg = $4,
      reply_count = $5,
      participant_count = $6,
      total_sp = $7,
      sp_allocator_count = $8,
      trust_tier = $9,
      updated_at = NOW()
    WHERE content_type = $1 AND content_id = $2`,
    [
      contentType,
      contentId,
      engagement.voteScore,
      engagement.ratingAvg,
      engagement.replyCount,
      engagement.participantCount,
      engagement.totalSP,
      engagement.spAllocatorCount,
      trustTier,
    ]
  );
}

/**
 * Remove content from the index (when deleted)
 */
export async function removeFromIndex(
  contentType: IndexableContentType,
  contentId: string
): Promise<void> {
  await query(
    `DELETE FROM bridge_content_index WHERE content_type = $1 AND content_id = $2`,
    [contentType, contentId]
  );
}

/**
 * Search indexed content using full-text search
 * Results are ordered by trust tier (highest first) then relevance
 */
export async function searchContent(
  searchQuery: string,
  options: ContentSearchOptions = {}
): Promise<ContentSearchResult[]> {
  const { types, minTrust, limit = 10, offset = 0 } = options;

  // Build dynamic WHERE clauses
  const conditions: string[] = [
    `to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(summary, '') || ' ' || COALESCE(full_text, ''))
     @@ plainto_tsquery('english', $1)`,
  ];
  const params: any[] = [searchQuery];
  let paramIndex = 2;

  if (types && types.length > 0) {
    conditions.push(`content_type = ANY($${paramIndex})`);
    params.push(types);
    paramIndex++;
  }

  if (minTrust) {
    const tierOrder = ['unvalidated', 'low', 'medium', 'high', 'consensus'];
    const minIndex = tierOrder.indexOf(minTrust);
    const allowedTiers = tierOrder.slice(minIndex);
    conditions.push(`trust_tier = ANY($${paramIndex})`);
    params.push(allowedTiers);
    paramIndex++;
  }

  params.push(limit, offset);

  const result = await query<ContentSearchResult>(
    `SELECT
      id,
      content_type as "contentType",
      content_id as "contentId",
      url,
      title,
      summary,
      keywords,
      full_text as "fullText",
      vote_score as "voteScore",
      rating_avg as "ratingAvg",
      reply_count as "replyCount",
      participant_count as "participantCount",
      total_sp as "totalSP",
      sp_allocator_count as "spAllocatorCount",
      trust_tier as "trustTier",
      author_id as "authorId",
      created_at as "createdAt",
      indexed_at as "indexedAt",
      ts_rank(
        to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(summary, '')),
        plainto_tsquery('english', $1)
      ) as rank
    FROM bridge_content_index
    WHERE ${conditions.join(' AND ')}
    ORDER BY
      CASE trust_tier
        WHEN 'consensus' THEN 5
        WHEN 'high' THEN 4
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 2
        ELSE 1
      END DESC,
      total_sp DESC,
      rank DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    params
  );

  return result.rows;
}

/**
 * Get content with significant SP backing
 * Useful for highlighting "community-backed" content
 */
export async function getHighSPContent(
  minSP: number = 10,
  limit: number = 10
): Promise<IndexedContent[]> {
  const result = await query<IndexedContent>(
    `SELECT
      id,
      content_type as "contentType",
      content_id as "contentId",
      url,
      title,
      summary,
      keywords,
      full_text as "fullText",
      vote_score as "voteScore",
      rating_avg as "ratingAvg",
      reply_count as "replyCount",
      participant_count as "participantCount",
      total_sp as "totalSP",
      sp_allocator_count as "spAllocatorCount",
      trust_tier as "trustTier",
      author_id as "authorId",
      created_at as "createdAt",
      indexed_at as "indexedAt"
    FROM bridge_content_index
    WHERE total_sp >= $1
    ORDER BY total_sp DESC, sp_allocator_count DESC
    LIMIT $2`,
    [minSP, limit]
  );

  return result.rows;
}

/**
 * Get recent content (for "what's new" queries)
 */
export async function getRecentContent(
  hours: number = 24,
  limit: number = 10
): Promise<IndexedContent[]> {
  const result = await query<IndexedContent>(
    `SELECT
      id,
      content_type as "contentType",
      content_id as "contentId",
      url,
      title,
      summary,
      keywords,
      full_text as "fullText",
      vote_score as "voteScore",
      rating_avg as "ratingAvg",
      reply_count as "replyCount",
      participant_count as "participantCount",
      total_sp as "totalSP",
      sp_allocator_count as "spAllocatorCount",
      trust_tier as "trustTier",
      author_id as "authorId",
      created_at as "createdAt",
      indexed_at as "indexedAt"
    FROM bridge_content_index
    WHERE created_at >= NOW() - INTERVAL '1 hour' * $1
    ORDER BY created_at DESC
    LIMIT $2`,
    [hours, limit]
  );

  return result.rows;
}

/**
 * Get SP allocations for a piece of content
 * Used to calculate total_sp and sp_allocator_count
 */
export async function getContentSPStats(
  contentType: string,
  contentId: string
): Promise<{ totalSP: number; allocatorCount: number }> {
  const result = await query<{ total_sp: string; allocator_count: string }>(
    `SELECT
      COALESCE(SUM(amount), 0) as total_sp,
      COUNT(DISTINCT member_id) as allocator_count
    FROM support_points_allocations
    WHERE target_type = $1 AND target_id = $2 AND status = 'active'`,
    [contentType, contentId]
  );

  const row = result.rows[0];
  return {
    totalSP: parseInt(row?.total_sp || '0', 10),
    allocatorCount: parseInt(row?.allocator_count || '0', 10),
  };
}

/**
 * Get trust thresholds from system settings
 */
export async function getTrustThresholds(): Promise<TrustThresholds> {
  const result = await query<{ value: TrustThresholds }>(
    `SELECT value FROM system_settings WHERE key = 'bridge_trust_thresholds'`
  );

  if (result.rows.length === 0) {
    // Return defaults if not configured
    return {
      newContentHours: 24,
      low: { minVotes: 1, minReplies: 1 },
      medium: { minVotes: 3, minReplies: 3, minSP: 5 },
      high: { minVotes: 10, minReplies: 5, minSP: 20 },
      consensus: { minVotes: 20, minParticipants: 10, minSP: 50 },
    };
  }

  return result.rows[0].value;
}

/**
 * Update trust thresholds in system settings
 */
export async function updateTrustThresholds(
  thresholds: TrustThresholds
): Promise<void> {
  await query(
    `UPDATE system_settings
     SET value = $1, updated_at = NOW()
     WHERE key = 'bridge_trust_thresholds'`,
    [JSON.stringify(thresholds)]
  );
}

/**
 * Get index statistics for admin dashboard
 */
export async function getIndexStats(): Promise<{
  totalIndexed: number;
  byType: Record<string, number>;
  byTrust: Record<string, number>;
  avgSP: number;
  lastIndexed: Date | null;
}> {
  const [total, byType, byTrust, avgSP, lastIndexed] = await Promise.all([
    query<{ count: string }>(`SELECT COUNT(*) as count FROM bridge_content_index`),
    query<{ content_type: string; count: string }>(
      `SELECT content_type, COUNT(*) as count
       FROM bridge_content_index
       GROUP BY content_type`
    ),
    query<{ trust_tier: string; count: string }>(
      `SELECT trust_tier, COUNT(*) as count
       FROM bridge_content_index
       GROUP BY trust_tier`
    ),
    query<{ avg_sp: string }>(
      `SELECT COALESCE(AVG(total_sp), 0) as avg_sp FROM bridge_content_index`
    ),
    query<{ max_indexed: Date }>(
      `SELECT MAX(indexed_at) as max_indexed FROM bridge_content_index`
    ),
  ]);

  return {
    totalIndexed: parseInt(total.rows[0]?.count || '0', 10),
    byType: Object.fromEntries(
      byType.rows.map((r) => [r.content_type, parseInt(r.count, 10)])
    ),
    byTrust: Object.fromEntries(
      byTrust.rows.map((r) => [r.trust_tier, parseInt(r.count, 10)])
    ),
    avgSP: parseFloat(avgSP.rows[0]?.avg_sp || '0'),
    lastIndexed: lastIndexed.rows[0]?.max_indexed || null,
  };
}
