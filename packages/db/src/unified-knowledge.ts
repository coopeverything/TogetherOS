/**
 * Unified Knowledge System Database Operations
 *
 * Single search interface for all knowledge sources:
 * - Wiki articles (database)
 * - Forum posts/topics (database)
 * - Proposals (database)
 * - Docs (filesystem, indexed to bridge_content_index)
 *
 * Features:
 * - Synonym expansion ("SP" matches "Support Points")
 * - Trust-weighted results
 * - Minority report awareness
 * - Unanswered query tracking
 */

import { query } from './index';
import type {
  DbWikiArticle,
  DbGlossaryTerm,
  WikiMinorityReport,
  UnifiedSearchResult,
  UnifiedSearchOptions,
  BridgeUnansweredQuery,
  KnowledgeGap,
} from '@togetheros/types';

// =============================================================================
// WIKI ARTICLE OPERATIONS
// =============================================================================

/**
 * Get a wiki article by slug
 */
export async function getWikiArticleBySlug(slug: string): Promise<DbWikiArticle | null> {
  const result = await query<{
    id: string;
    slug: string;
    title: string;
    summary: string;
    content: string;
    status: string;
    tags: string[];
    cooperation_paths: string[];
    related_article_slugs: string[];
    terms: string[];
    view_count: number;
    total_sp: number;
    sp_allocator_count: number;
    contributor_count: number;
    trust_tier: string;
    discussion_topic_id: string | null;
    created_by: string | null;
    last_edited_by: string | null;
    created_at: Date;
    updated_at: Date;
    read_time_minutes: number;
  }>(
    `SELECT * FROM wiki_articles WHERE slug = $1`,
    [slug]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    content: row.content,
    status: row.status as DbWikiArticle['status'],
    tags: row.tags || [],
    cooperationPaths: row.cooperation_paths || [],
    relatedArticleSlugs: row.related_article_slugs || [],
    terms: row.terms || [],
    viewCount: row.view_count,
    totalSP: row.total_sp,
    spAllocatorCount: row.sp_allocator_count,
    contributorCount: row.contributor_count,
    trustTier: row.trust_tier as DbWikiArticle['trustTier'],
    discussionTopicId: row.discussion_topic_id,
    createdBy: row.created_by,
    lastEditedBy: row.last_edited_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    readTimeMinutes: row.read_time_minutes,
  };
}

/**
 * Get all wiki articles
 */
export async function getAllWikiArticles(): Promise<DbWikiArticle[]> {
  const result = await query<{
    id: string;
    slug: string;
    title: string;
    summary: string;
    content: string;
    status: string;
    tags: string[];
    cooperation_paths: string[];
    related_article_slugs: string[];
    terms: string[];
    view_count: number;
    total_sp: number;
    sp_allocator_count: number;
    contributor_count: number;
    trust_tier: string;
    discussion_topic_id: string | null;
    created_by: string | null;
    last_edited_by: string | null;
    created_at: Date;
    updated_at: Date;
    read_time_minutes: number;
  }>(`SELECT * FROM wiki_articles WHERE status != 'archived' ORDER BY title`);

  return result.rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    content: row.content,
    status: row.status as DbWikiArticle['status'],
    tags: row.tags || [],
    cooperationPaths: row.cooperation_paths || [],
    relatedArticleSlugs: row.related_article_slugs || [],
    terms: row.terms || [],
    viewCount: row.view_count,
    totalSP: row.total_sp,
    spAllocatorCount: row.sp_allocator_count,
    contributorCount: row.contributor_count,
    trustTier: row.trust_tier as DbWikiArticle['trustTier'],
    discussionTopicId: row.discussion_topic_id,
    createdBy: row.created_by,
    lastEditedBy: row.last_edited_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    readTimeMinutes: row.read_time_minutes,
  }));
}

/**
 * Upsert a wiki article (for seeding from wiki-data.ts)
 */
export async function upsertWikiArticle(
  article: Omit<DbWikiArticle, 'id' | 'viewCount' | 'totalSP' | 'spAllocatorCount' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const result = await query<{ id: string }>(
    `INSERT INTO wiki_articles (
      slug, title, summary, content, status, tags, cooperation_paths,
      related_article_slugs, terms, contributor_count, trust_tier,
      discussion_topic_id, created_by, last_edited_by, read_time_minutes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      summary = EXCLUDED.summary,
      content = EXCLUDED.content,
      status = EXCLUDED.status,
      tags = EXCLUDED.tags,
      cooperation_paths = EXCLUDED.cooperation_paths,
      related_article_slugs = EXCLUDED.related_article_slugs,
      terms = EXCLUDED.terms,
      contributor_count = EXCLUDED.contributor_count,
      trust_tier = EXCLUDED.trust_tier,
      discussion_topic_id = EXCLUDED.discussion_topic_id,
      last_edited_by = EXCLUDED.last_edited_by,
      read_time_minutes = EXCLUDED.read_time_minutes,
      updated_at = NOW()
    RETURNING id`,
    [
      article.slug,
      article.title,
      article.summary,
      article.content,
      article.status,
      article.tags,
      article.cooperationPaths,
      article.relatedArticleSlugs,
      article.terms,
      article.contributorCount,
      article.trustTier,
      article.discussionTopicId,
      article.createdBy,
      article.lastEditedBy,
      article.readTimeMinutes,
    ]
  );

  return result.rows[0].id;
}

/**
 * Check if wiki articles exist (for determining if seed is needed)
 */
export async function getWikiArticleCount(): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM wiki_articles`
  );
  return parseInt(result.rows[0].count, 10);
}

// =============================================================================
// GLOSSARY TERM OPERATIONS
// =============================================================================

/**
 * Upsert a glossary term
 */
export async function upsertGlossaryTerm(
  term: Omit<DbGlossaryTerm, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const result = await query<{ id: string }>(
    `INSERT INTO glossary_terms (
      word, slug, short_definition, wiki_article_slug,
      discussion_topic_id, related_term_slugs, cooperation_path
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (slug) DO UPDATE SET
      word = EXCLUDED.word,
      short_definition = EXCLUDED.short_definition,
      wiki_article_slug = EXCLUDED.wiki_article_slug,
      discussion_topic_id = EXCLUDED.discussion_topic_id,
      related_term_slugs = EXCLUDED.related_term_slugs,
      cooperation_path = EXCLUDED.cooperation_path,
      updated_at = NOW()
    RETURNING id`,
    [
      term.word,
      term.slug,
      term.shortDefinition,
      term.wikiArticleSlug,
      term.discussionTopicId,
      term.relatedTermSlugs,
      term.cooperationPath,
    ]
  );

  return result.rows[0].id;
}

// =============================================================================
// SYNONYM EXPANSION
// =============================================================================

/**
 * Expand a search query using synonyms
 * Returns the original query plus any synonyms/abbreviations that match
 */
export async function expandQueryWithSynonyms(queryText: string): Promise<string[]> {
  const normalizedQuery = queryText.toLowerCase().trim();
  const terms: Set<string> = new Set([normalizedQuery]);

  // Find matching synonyms
  const result = await query<{
    canonical_term: string;
    synonyms: string[];
    abbreviations: string[];
  }>(
    `SELECT canonical_term, synonyms, abbreviations
     FROM search_synonyms
     WHERE LOWER(canonical_term) = $1
        OR $1 = ANY(SELECT LOWER(s) FROM unnest(synonyms) s)
        OR $1 = ANY(SELECT LOWER(a) FROM unnest(abbreviations) a)`,
    [normalizedQuery]
  );

  for (const row of result.rows) {
    terms.add(row.canonical_term.toLowerCase());
    for (const syn of row.synonyms) {
      terms.add(syn.toLowerCase());
    }
    for (const abbr of row.abbreviations) {
      terms.add(abbr.toLowerCase());
    }
  }

  return Array.from(terms);
}

// =============================================================================
// UNIFIED SEARCH
// =============================================================================

/**
 * Search all knowledge sources with unified interface
 *
 * Searches: wiki, forum posts, forum topics, proposals, glossary
 * Features: synonym expansion, trust weighting, minority report detection
 */
export async function unifiedKnowledgeSearch(
  searchQuery: string,
  options: UnifiedSearchOptions = {}
): Promise<UnifiedSearchResult[]> {
  const {
    sources = ['wiki', 'forum', 'proposal', 'glossary'],
    minTrust,
    includeContested = true,
    expandSynonyms = true,
    limit = 20,
    offset = 0,
  } = options;

  const results: UnifiedSearchResult[] = [];

  // Expand query with synonyms if enabled
  const searchTerms = expandSynonyms
    ? await expandQueryWithSynonyms(searchQuery)
    : [searchQuery.toLowerCase().trim()];

  // Build search pattern for ILIKE
  const searchPatterns = searchTerms.map((t) => `%${t}%`);

  // Search wiki articles
  if (sources.includes('wiki')) {
    const wikiResults = await query<{
      id: string;
      slug: string;
      title: string;
      summary: string;
      content: string;
      status: string;
      trust_tier: string;
      total_sp: number;
      has_minority_report: boolean;
    }>(
      `SELECT
        w.id,
        w.slug,
        w.title,
        w.summary,
        w.content,
        w.status,
        w.trust_tier,
        w.total_sp,
        EXISTS(SELECT 1 FROM wiki_minority_reports mr WHERE mr.article_id = w.id AND mr.status = 'active') as has_minority_report
      FROM wiki_articles w
      WHERE w.status != 'archived'
        AND (
          to_tsvector('english', w.title || ' ' || w.summary || ' ' || w.content)
            @@ plainto_tsquery('english', $1)
          OR w.title ILIKE ANY($2)
          OR w.summary ILIKE ANY($2)
          OR w.content ILIKE ANY($2)
        )
        ${!includeContested ? "AND w.status != 'contested'" : ''}
      ORDER BY w.total_sp DESC, w.trust_tier DESC
      LIMIT $3`,
      [searchQuery, searchPatterns, limit]
    );

    for (const row of wikiResults.rows) {
      results.push({
        source: 'wiki',
        sourceId: row.id,
        title: row.title,
        summary: row.summary,
        content: row.content,
        url: `/wiki/${row.slug}`,
        trustTier: row.trust_tier as UnifiedSearchResult['trustTier'],
        totalSP: row.total_sp,
        hasMinorityReport: row.has_minority_report,
        isContested: row.status === 'contested',
        score: row.total_sp + (row.trust_tier === 'stable' ? 100 : 0),
        matchType: 'exact',
        matchedTerms: searchTerms,
      });
    }
  }

  // Search forum posts
  if (sources.includes('forum')) {
    const forumResults = await query<{
      id: string;
      topic_id: string;
      topic_title: string;
      content: string;
      total_sp: number;
      reply_count: number;
    }>(
      `SELECT
        p.id,
        p.topic_id,
        t.title as topic_title,
        p.content,
        COALESCE((SELECT SUM(amount) FROM support_points_allocations
          WHERE target_type = 'forum_post' AND target_id = p.id::text AND status = 'active'), 0)::integer as total_sp,
        p.reply_count
      FROM forum_posts p
      JOIN forum_topics t ON t.id = p.topic_id
      WHERE p.deleted_at IS NULL
        AND t.deleted_at IS NULL
        AND (
          to_tsvector('english', p.content) @@ plainto_tsquery('english', $1)
          OR p.content ILIKE ANY($2)
        )
      ORDER BY total_sp DESC, p.created_at DESC
      LIMIT $3`,
      [searchQuery, searchPatterns, limit]
    );

    for (const row of forumResults.rows) {
      const trustTier = calculateTrustTier(row.total_sp, row.reply_count);
      results.push({
        source: 'forum',
        sourceId: row.id,
        title: row.topic_title,
        summary: row.content.substring(0, 200) + (row.content.length > 200 ? '...' : ''),
        content: row.content,
        url: `/forum/topic/${row.topic_id}#post-${row.id}`,
        trustTier,
        totalSP: row.total_sp,
        hasMinorityReport: false,
        isContested: false,
        score: row.total_sp,
        matchType: 'exact',
        matchedTerms: searchTerms,
      });
    }
  }

  // Search proposals
  if (sources.includes('proposal')) {
    const proposalResults = await query<{
      id: string;
      title: string;
      summary: string;
      status: string;
      total_sp: number;
    }>(
      `SELECT
        p.id,
        p.title,
        p.summary,
        p.status,
        COALESCE((SELECT SUM(amount) FROM support_points_allocations
          WHERE target_type = 'proposal' AND target_id = p.id::text AND status = 'active'), 0)::integer as total_sp
      FROM proposals p
      WHERE p.deleted_at IS NULL
        AND (
          to_tsvector('english', p.title || ' ' || COALESCE(p.summary, ''))
            @@ plainto_tsquery('english', $1)
          OR p.title ILIKE ANY($2)
          OR p.summary ILIKE ANY($2)
        )
      ORDER BY total_sp DESC
      LIMIT $3`,
      [searchQuery, searchPatterns, limit]
    );

    for (const row of proposalResults.rows) {
      results.push({
        source: 'proposal',
        sourceId: row.id,
        title: row.title,
        summary: row.summary || '',
        content: null,
        url: `/governance/${row.id}`,
        trustTier: 'medium',
        totalSP: row.total_sp,
        hasMinorityReport: false, // TODO: Check minority_reports table
        isContested: false,
        score: row.total_sp,
        matchType: 'exact',
        matchedTerms: searchTerms,
      });
    }
  }

  // Search glossary
  if (sources.includes('glossary')) {
    const glossaryResults = await query<{
      id: string;
      word: string;
      slug: string;
      short_definition: string;
      wiki_article_slug: string | null;
    }>(
      `SELECT id, word, slug, short_definition, wiki_article_slug
       FROM glossary_terms
       WHERE word ILIKE ANY($1)
          OR short_definition ILIKE ANY($1)
       LIMIT $2`,
      [searchPatterns, limit]
    );

    for (const row of glossaryResults.rows) {
      results.push({
        source: 'glossary',
        sourceId: row.id,
        title: row.word,
        summary: row.short_definition,
        content: null,
        url: row.wiki_article_slug ? `/wiki/${row.wiki_article_slug}` : `/glossary/${row.slug}`,
        trustTier: 'stable',
        totalSP: 0,
        hasMinorityReport: false,
        isContested: false,
        score: 50, // Base score for glossary matches
        matchType: 'exact',
        matchedTerms: searchTerms,
      });
    }
  }

  // Sort by score (trust + SP + relevance)
  results.sort((a, b) => b.score - a.score);

  // Apply offset and limit
  return results.slice(offset, offset + limit);
}

/**
 * Calculate trust tier from engagement metrics
 */
function calculateTrustTier(
  totalSP: number,
  replyCount: number
): UnifiedSearchResult['trustTier'] {
  if (totalSP >= 50) return 'consensus';
  if (totalSP >= 20) return 'high';
  if (totalSP >= 5 || replyCount >= 3) return 'medium';
  if (totalSP > 0 || replyCount >= 1) return 'low';
  return 'unvalidated';
}

// =============================================================================
// UNANSWERED QUERY TRACKING
// =============================================================================

/**
 * Record a query that Bridge couldn't answer well
 */
export async function recordUnansweredQuery(
  queryText: string,
  options: {
    userId?: string;
    resultsCount?: number;
    contentTypes?: string[];
  } = {}
): Promise<string> {
  const { userId, resultsCount = 0, contentTypes = [] } = options;

  const result = await query<{ id: string }>(
    `SELECT record_unanswered_query($1, $2, $3, $4) as id`,
    [queryText, userId || null, resultsCount, contentTypes]
  );

  return result.rows[0].id;
}

/**
 * Get top knowledge gaps (most frequently unanswered queries)
 */
export async function getKnowledgeGaps(limit: number = 20): Promise<KnowledgeGap[]> {
  const result = await query<{
    query_normalized: string;
    occurrence_count: number;
    first_seen_at: Date;
    last_seen_at: Date;
  }>(
    `SELECT query_normalized, occurrence_count, first_seen_at, last_seen_at
     FROM bridge_unanswered_queries
     WHERE resolved = FALSE
     ORDER BY occurrence_count DESC, last_seen_at DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows.map((row) => ({
    queryNormalized: row.query_normalized,
    occurrenceCount: row.occurrence_count,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    suggestedTopic: null, // Could be AI-generated in future
    relatedArticles: [],
  }));
}

/**
 * Mark an unanswered query as resolved by a wiki article
 */
export async function resolveKnowledgeGap(
  queryNormalized: string,
  articleId: string
): Promise<void> {
  await query(
    `UPDATE bridge_unanswered_queries
     SET resolved = TRUE,
         resolved_by_article_id = $2,
         resolved_at = NOW()
     WHERE query_normalized = $1`,
    [queryNormalized.toLowerCase().trim(), articleId]
  );
}

// =============================================================================
// WIKI MINORITY REPORTS
// =============================================================================

/**
 * Get minority reports for a wiki article
 */
export async function getWikiMinorityReports(articleId: string): Promise<WikiMinorityReport[]> {
  const result = await query<{
    id: string;
    article_id: string;
    dissenting_view: string;
    evidence: string | null;
    predictions: string | null;
    author_id: string;
    total_sp: number;
    sp_allocator_count: number;
    status: string;
    validation_notes: string | null;
    validated_at: Date | null;
    created_at: Date;
    updated_at: Date;
  }>(
    `SELECT * FROM wiki_minority_reports
     WHERE article_id = $1 AND status = 'active'
     ORDER BY total_sp DESC, created_at DESC`,
    [articleId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    articleId: row.article_id,
    dissentingView: row.dissenting_view,
    evidence: row.evidence,
    predictions: row.predictions,
    authorId: row.author_id,
    totalSP: row.total_sp,
    spAllocatorCount: row.sp_allocator_count,
    status: row.status as WikiMinorityReport['status'],
    validationNotes: row.validation_notes,
    validatedAt: row.validated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

// =============================================================================
// INDEX STATISTICS
// =============================================================================

/**
 * Get knowledge index statistics for admin dashboard
 */
export async function getKnowledgeIndexStats(): Promise<{
  wikiArticles: number;
  glossaryTerms: number;
  synonymEntries: number;
  unansweredQueries: number;
  topGaps: KnowledgeGap[];
}> {
  const [wiki, glossary, synonyms, unanswered] = await Promise.all([
    query<{ count: string }>(`SELECT COUNT(*) as count FROM wiki_articles WHERE status != 'archived'`),
    query<{ count: string }>(`SELECT COUNT(*) as count FROM glossary_terms`),
    query<{ count: string }>(`SELECT COUNT(*) as count FROM search_synonyms`),
    query<{ count: string }>(`SELECT COUNT(*) as count FROM bridge_unanswered_queries WHERE resolved = FALSE`),
  ]);

  const topGaps = await getKnowledgeGaps(5);

  return {
    wikiArticles: parseInt(wiki.rows[0].count, 10),
    glossaryTerms: parseInt(glossary.rows[0].count, 10),
    synonymEntries: parseInt(synonyms.rows[0].count, 10),
    unansweredQueries: parseInt(unanswered.rows[0].count, 10),
    topGaps,
  };
}
