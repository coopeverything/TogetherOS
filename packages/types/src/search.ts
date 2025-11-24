/**
 * Search & Tags Module Types
 * Provides types for search queries, filters, and results
 */

/**
 * Cooperation Path (kebab-case for URLs)
 */
export type CooperationPathSlug =
  | 'collaborative-education'
  | 'social-economy'
  | 'common-wellbeing'
  | 'cooperative-technology'
  | 'collective-governance'
  | 'community-connection'
  | 'collaborative-media-culture'
  | 'common-planet';

/**
 * Content types that can be searched
 */
export type SearchContentType = 'all' | 'proposal' | 'topic' | 'post' | 'profile';

/**
 * Filter types available in search
 */
export type SearchFilterType = 'path' | 'keyword' | 'content_type' | 'date_range';

/**
 * Search query parameters
 */
export interface SearchQuery {
  q: string;                          // Search query text
  type?: SearchContentType;           // Content type filter
  path?: CooperationPathSlug;         // Cooperation Path filter
  keywords?: string[];                // Keyword filters
  limit: number;                      // Results per page (default: 20, max: 100)
  offset: number;                     // Pagination offset (default: 0)
}

/**
 * Search result metadata for different content types
 */
export interface SearchResultMetadata {
  author?: string;
  author_id?: string;
  created_at: string;
  updated_at?: string;
  path?: CooperationPathSlug;
  keywords?: string[];
  engagement?: {
    views?: number;
    comments?: number;
    reactions?: number;
    support_points?: number;
  };
}

/**
 * Individual search result
 */
export interface SearchResult {
  id: string;
  type: Exclude<SearchContentType, 'all'>;  // Specific type, not 'all'
  title: string;
  excerpt: string;                    // Highlighted snippet (max 200 chars)
  url: string;
  metadata: SearchResultMetadata;
  relevance_score: number;            // 0-1, higher = more relevant
}

/**
 * Search API response
 */
export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  filters: {
    type?: SearchContentType;
    path?: CooperationPathSlug;
    keywords?: string[];
  };
  took_ms: number;                    // Query execution time
}

/**
 * Search query database entity
 */
export interface SearchQueryEntity {
  id: string;
  user_id: string | null;
  query_text: string;
  query_hash: string;
  filters: Record<string, unknown>;
  result_count: number;
  clicked_result_id: string | null;
  clicked_result_type: string | null;
  created_at: string;
}

/**
 * Search filter database entity
 */
export interface SearchFilterEntity {
  id: string;
  name: string;
  filter_type: SearchFilterType;
  filter_value: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Search filters for UI components
 */
export interface SearchFilters {
  type?: SearchContentType;
  path?: CooperationPathSlug;
  keywords?: string[];
  dateRange?: {
    from?: string;
    to?: string;
  };
}

/**
 * Available filters (fetched from search_filters table)
 */
export interface AvailableFilters {
  paths: Array<{ value: CooperationPathSlug; label: string }>;
  keywords: Array<{ value: string; label: string }>;
  contentTypes: Array<{ value: SearchContentType; label: string }>;
}

/**
 * Search history entry
 */
export interface SearchHistoryEntry {
  id: string;
  query: string;
  filters: SearchFilters;
  result_count: number;
  timestamp: string;
}

/**
 * Saved search
 */
export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  created_at: string;
  last_used_at: string | null;
}
