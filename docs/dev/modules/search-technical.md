# Search & Tags Module — Technical Implementation

> This document contains technical implementation details for developers. For user-facing documentation, see [docs/modules/search.md](../../modules/search.md).

**Path:** `path:cooperative-technology`

---

## Implementation Phases

### Phase 1: Foundation (Complete - 50%)

**Implemented:**
- Module specification and architecture
- Search database schema (search_queries, search_filters)
- TypeScript types for search entities
- Basic search API (`/api/search`) with production schema
- Search UI component with filters
- Search page (`/search`)
- Integration with proposals module
- Production deployment verified (Nov 24, 2025)
- Database queries optimized for actual schema (proposals, support_points_allocations)
- Cooperation path taxonomy linking (migration 033)
- Cooperation path filtering in search API

### Phase 2: Expanded Coverage (Complete - 85%)

**Implemented:**
- Forum topic search with cooperation path filtering
- Forum post search with cooperation path filtering (via parent topic)
- Merged results (proposals + topics + posts) sorted by relevance
- Type-specific search: `all`, `proposal`, `topic`, `post`
- Full-text search across all discussion content

### Phase 3: Advanced Features (Complete - 100%)

**Implemented:**
- Profile search (members by name, handle, bio)
- Saved searches functionality (max 25 per user)
- Autocomplete with recent, popular, and content suggestions
- Search history API with GDPR compliance

### Phase 4: Optimization (Future)

**Planned:**
- Full-text search with PostgreSQL tsvector
- Semantic search (embeddings-based)
- Search analytics (trending queries, zero-result queries)
- Advanced filters (by author, date range, engagement)
- Export search results
- Search result caching
- Query optimization and indexing
- Federated search (cross-group)
- Search API rate limiting
- Search quality monitoring dashboard

---

## Key Files

```
docs/modules/search.md                           - User-facing specification
db/migrations/20250123000000_create_search_tables.sql - Database schema
packages/types/src/search.ts                     - Type definitions
apps/web/app/api/search/route.ts                 - Search API
apps/web/components/search/SearchBar.tsx         - Search input
apps/web/components/search/SearchFilters.tsx     - Filter controls
apps/web/components/search/SearchResults.tsx     - Results display
apps/web/app/search/page.tsx                     - Main search page
```

---

## Database Schema

### search_queries Table

```sql
CREATE TABLE search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  query_text TEXT NOT NULL,
  query_hash VARCHAR(64) NOT NULL, -- SHA-256 hash for privacy
  filters JSONB DEFAULT '{}',
  result_count INTEGER DEFAULT 0,
  clicked_result_id UUID,
  clicked_result_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_search_queries_user_id ON search_queries(user_id);
CREATE INDEX idx_search_queries_query_hash ON search_queries(query_hash);
CREATE INDEX idx_search_queries_created_at ON search_queries(created_at DESC);
```

### search_filters Table

```sql
CREATE TABLE search_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  filter_type VARCHAR(50) NOT NULL, -- 'path', 'keyword', 'content_type', 'date_range'
  filter_value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_search_filters_type ON search_filters(filter_type);
CREATE INDEX idx_search_filters_active ON search_filters(is_active);
```

---

## API Endpoints

### GET /api/search

**Query Parameters:**

```typescript
{
  q: string;                    // Search query (required)
  type?: 'all' | 'proposal' | 'topic' | 'post' | 'profile'; // Content type filter
  path?: string;                // Cooperation Path filter (e.g., 'collective-governance')
  keywords?: string[];          // Keyword filters
  limit?: number;               // Results per page (default: 20, max: 100)
  offset?: number;              // Pagination offset
}
```

**Response:**

```typescript
{
  results: SearchResult[];
  total: number;
  query: string;
  filters: {
    type?: string;
    path?: string;
    keywords?: string[];
  };
  took_ms: number;
}

interface SearchResult {
  id: string;
  type: 'proposal' | 'topic' | 'post' | 'profile';
  title: string;
  excerpt: string;              // Highlighted snippet
  url: string;
  metadata: {
    author?: string;
    created_at: string;
    path?: string;
    keywords?: string[];
    engagement?: {
      views?: number;
      comments?: number;
      reactions?: number;
    };
  };
  relevance_score: number;      // 0-1, higher = more relevant
}
```

**Example:**

```bash
GET /api/search?q=governance&type=proposal&path=collective-governance&limit=10
```

---

## Search Ranking Algorithm

### Basic Ranking (Phase 1)

```typescript
relevance_score =
  text_match_score * 0.5 +      // Exact/partial match in title/body
  recency_score * 0.3 +          // Newer content ranked higher
  engagement_score * 0.2;        // Views, comments, reactions

text_match_score: 0-1 (0.8 for title match, 0.5 for body match, 1.0 for exact match)
recency_score: 1.0 for <7 days, 0.5 for <30 days, 0.25 for <90 days, 0.1 for older
engagement_score: normalized 0-1 based on percentile rank
```

### Semantic Ranking (Future Phase 4)

- Add embeddings-based similarity (0.4 weight)
- Personalization based on user's path interests (0.1 weight)

---

## UI Components

### SearchBar Component

```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}
```

**Features:**
- Debounced input (300ms)
- Loading state indicator
- Clear button
- Keyboard shortcuts (Cmd/Ctrl+K to focus)

### SearchFilters Component

```typescript
interface SearchFiltersProps {
  filters: {
    type?: string;
    path?: string;
    keywords?: string[];
  };
  onFilterChange: (filters: Filters) => void;
  availablePaths: string[];
  availableKeywords: string[];
}
```

**Features:**
- Content type selector (proposals, topics, posts, profiles)
- Path filter dropdown (8 Cooperation Paths)
- Keyword multi-select
- Active filter badges with remove buttons

### SearchResults Component

```typescript
interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
  onResultClick: (result: SearchResult) => void;
}
```

**Features:**
- Result cards with title, excerpt, metadata
- Highlight matching terms
- Pagination controls
- Empty state ("No results found")

---

## Privacy & Security

### Query Storage

**Privacy-first approach:**

```typescript
// Before storing
const queryHash = createHash('sha256')
  .update(query_text + user_id)
  .digest('hex');

// Store only hash, not raw text
await db.searchQueries.create({
  user_id,
  query_hash: queryHash,
  query_text: '[REDACTED]', // Never store raw query
  filters: sanitizedFilters,
  result_count: results.length,
});
```

### Data Retention

- **Search queries:** 90 days retention
- **Search filters:** No expiration (config data)
- **Clicked results:** 30 days retention (for relevance tuning)

### GDPR Compliance

- Users can export search history: `GET /api/search/history/export`
- Users can delete search history: `DELETE /api/search/history`
- Search data automatically deleted after retention period

---

## Integration Points

### Module Integrations

**Phase 1:**
- **Proposals & Decisions** — Search proposals by title, description, cooperation path

**Phase 2:**
- **Forum Topics** — Search topics by title, description, cooperation path
- **Forum Posts** — Full-text search with cooperation path filtering (via parent topic)

**Phase 3:**
- **Profiles** — Search members by name, skills, paths

**Future:**
- **Groups** — Search groups by name, description, location
- **Bridge** — Search knowledge base articles
- **Feed** — Search posts and comments
- **Events** — Search events by title, location, date

### Cooperation Paths Integration

All search results include path classification:

```typescript
const COOPERATION_PATHS = [
  'collaborative-education',
  'social-economy',
  'common-wellbeing',
  'cooperative-technology',
  'collective-governance',
  'community-connection',
  'collaborative-media-culture',
  'common-planet',
] as const;
```

Path filtering uses canonical taxonomy from `codex/taxonomy/CATEGORY_TREE.json`.

---

## Performance Targets

### Current Targets

| Metric | Target | Status |
|--------|--------|--------|
| Search latency (p95) | <200ms | Active |
| Results per page | 20 (default) | Implemented |
| Max results | 100 | Implemented |
| Coverage | Proposals + Topics + Posts + Profiles | Complete |

### Future Targets (Phase 4)

| Metric | Target |
|--------|--------|
| Search latency (p95) | <100ms |
| Zero-result rate | <10% |
| Click-through rate (top 3) | >80% |
| Query cache hit rate | >60% |

---

## Testing Strategy

### Unit Tests

- Search query parsing and sanitization
- Filter validation and combination logic
- Result ranking algorithm
- Privacy: query hashing, PII redaction

### Integration Tests

- Search API endpoint with various filters
- Database query performance (<200ms)
- Pagination correctness

### E2E Tests

- User enters search query → sees results
- User applies filters → results update
- User clicks result → tracking recorded
- Empty search query → shows validation error

---

## Metrics & Monitoring

### Key Metrics

**Usage:**
- Daily active searchers
- Searches per user (median)
- Most common queries (hashed)
- Zero-result queries (for improvement)

**Performance:**
- Search latency (p50, p95, p99)
- Result count distribution
- Filter usage breakdown

**Quality:**
- Click-through rate (CTR) on results
- Clicked result position (1-10)
- Refinement rate (search → filter → new search)

### Monitoring Dashboard

Available at `/test/search/metrics`:
- Real-time search volume
- Latency percentiles chart
- Top filters used
- Zero-result queries list

---

## Future Enhancements

### Semantic Search (Phase 4)

- Generate embeddings for content using OpenAI/local model
- Store embeddings in pgvector extension
- Hybrid search: text + semantic similarity

### Federated Search (Phase 4)

- Search across multiple groups (opt-in)
- Cross-group result ranking
- Privacy-preserving query federation

### Search Suggestions

- Auto-suggest queries based on popular searches
- Did-you-mean corrections for typos
- Related searches based on current query

---

## Related Documentation

- [Cooperation Paths Taxonomy](../../TogetherOS_CATEGORIES_AND_KEYWORDS.md)
- [Privacy & Security Module](./security-technical.md)
- [Proposals Module](./governance-technical.md)
- [Forum Module](./forum-technical.md)
