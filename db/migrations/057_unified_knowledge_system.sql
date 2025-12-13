-- Migration: Unified Knowledge System for Bridge
-- Date: 2025-12-13
-- Description: Complete knowledge architecture enabling Bridge to read wiki, forum, docs
--              with unified search, synonym expansion, governance, and gap tracking
--
-- Phases covered:
-- Phase 1: Wiki tables, synonym expansion, unified index
-- Phase 2: Wiki governance (edits as proposals, minority reports)
-- Phase 3: Semantic search prep, unanswered query tracking
-- Phase 4: Export/federation metadata

-- =============================================================================
-- PHASE 1: WIKI ARTICLES IN DATABASE
-- =============================================================================

-- Wiki Articles Table
-- Stores community-owned knowledge articles (migrated from wiki-data.ts)
CREATE TABLE IF NOT EXISTS wiki_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,

  -- Status and consensus
  status VARCHAR(20) DEFAULT 'stable'
    CHECK (status IN ('draft', 'proposed', 'stable', 'evolving', 'contested', 'archived')),

  -- Categorization
  tags TEXT[] DEFAULT '{}',
  cooperation_paths TEXT[] DEFAULT '{}',
  related_article_slugs TEXT[] DEFAULT '{}',
  terms TEXT[] DEFAULT '{}',  -- Glossary terms that appear in this article

  -- Engagement metrics
  view_count INTEGER DEFAULT 0,
  total_sp INTEGER DEFAULT 0,
  sp_allocator_count INTEGER DEFAULT 0,
  contributor_count INTEGER DEFAULT 1,

  -- Trust tier (computed from engagement)
  trust_tier VARCHAR(20) DEFAULT 'stable'
    CHECK (trust_tier IN ('unvalidated', 'low', 'medium', 'high', 'consensus', 'stable')),

  -- Linked discussion
  discussion_topic_id UUID REFERENCES forum_topics(id) ON DELETE SET NULL,

  -- Audit trail
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  last_edited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  read_time_minutes INTEGER DEFAULT 3
);

-- Full-text search on wiki articles
CREATE INDEX IF NOT EXISTS idx_wiki_articles_fts
  ON wiki_articles
  USING GIN(to_tsvector('english', title || ' ' || summary || ' ' || content));

CREATE INDEX IF NOT EXISTS idx_wiki_articles_slug ON wiki_articles(slug);
CREATE INDEX IF NOT EXISTS idx_wiki_articles_status ON wiki_articles(status);
CREATE INDEX IF NOT EXISTS idx_wiki_articles_tags ON wiki_articles USING GIN(tags);

-- Glossary Terms Table
CREATE TABLE IF NOT EXISTS glossary_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  short_definition TEXT NOT NULL,

  -- Links to deeper content
  wiki_article_slug VARCHAR(100) REFERENCES wiki_articles(slug) ON DELETE SET NULL,
  discussion_topic_id UUID REFERENCES forum_topics(id) ON DELETE SET NULL,

  -- Related terms
  related_term_slugs TEXT[] DEFAULT '{}',
  cooperation_path VARCHAR(100),

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_glossary_terms_slug ON glossary_terms(slug);
CREATE INDEX IF NOT EXISTS idx_glossary_terms_fts
  ON glossary_terms
  USING GIN(to_tsvector('english', word || ' ' || short_definition));

-- =============================================================================
-- PHASE 1: SYNONYM TABLE FOR SEARCH EXPANSION
-- =============================================================================

-- Search Synonyms Table
-- Enables "SP" to find "Support Points" and vice versa
CREATE TABLE IF NOT EXISTS search_synonyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The canonical term (what we normalize to)
  canonical_term VARCHAR(100) NOT NULL,

  -- Alternative forms that should match
  synonyms TEXT[] NOT NULL DEFAULT '{}',

  -- Abbreviations (bidirectional matching)
  abbreviations TEXT[] NOT NULL DEFAULT '{}',

  -- Category for organizing
  category VARCHAR(50) DEFAULT 'general',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_search_synonyms_canonical
  ON search_synonyms(LOWER(canonical_term));

-- Seed initial synonyms for TogetherOS concepts
INSERT INTO search_synonyms (canonical_term, synonyms, abbreviations, category) VALUES
  ('support points', ARRAY['governance points', 'governance power', 'voting weight'], ARRAY['SP', 'SPs'], 'economy'),
  ('reward points', ARRAY['economic points', 'contribution rewards', 'activity rewards'], ARRAY['RP', 'RPs'], 'economy'),
  ('coordinator', ARRAY['facilitator', 'organizer', 'manager', 'leader'], ARRAY[], 'governance'),
  ('consent-based', ARRAY['consent based', 'consent decision', 'sociocracy', 'no objection'], ARRAY[], 'governance'),
  ('minority report', ARRAY['dissenting view', 'dissent', 'objection record'], ARRAY[], 'governance'),
  ('cooperation paths', ARRAY['8 paths', 'paths', 'categories'], ARRAY[], 'taxonomy'),
  ('coopeverything', ARRAY['coop everything', 'the cooperative', 'the movement'], ARRAY[], 'foundation'),
  ('togetheros', ARRAY['together os', 'the OS', 'the platform', 'operating system'], ARRAY['TOS'], 'foundation'),
  ('mutual aid', ARRAY['solidarity', 'reciprocal support', 'community support'], ARRAY[], 'economy'),
  ('timebank', ARRAY['time bank', 'time banking', 'hour exchange', 'labor exchange'], ARRAY[], 'economy'),
  ('four ledger system', ARRAY['4 ledger', 'ledgers', 'economic system'], ARRAY[], 'economy'),
  ('recall mechanism', ARRAY['recall', 'removal process', 'coordinator removal'], ARRAY[], 'governance'),
  ('proposal', ARRAY['initiative', 'motion', 'suggestion'], ARRAY[], 'governance'),
  ('deliberation', ARRAY['discussion', 'debate', 'discourse'], ARRAY[], 'governance')
ON CONFLICT (LOWER(canonical_term)) DO NOTHING;

-- =============================================================================
-- PHASE 2: WIKI GOVERNANCE - EDITS AS PROPOSALS
-- =============================================================================

-- Wiki Edit Proposals
-- Edits to wiki articles go through governance
CREATE TABLE IF NOT EXISTS wiki_edit_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES wiki_articles(id) ON DELETE CASCADE,

  -- The proposed changes
  proposed_title TEXT,
  proposed_summary TEXT,
  proposed_content TEXT NOT NULL,
  proposed_tags TEXT[],

  -- Edit metadata
  change_description TEXT NOT NULL,
  rationale TEXT,

  -- Status workflow
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'withdrawn')),

  -- Link to governance proposal (for major edits)
  governance_proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,

  -- Author
  proposed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Review
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  review_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  applied_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_wiki_edit_proposals_article
  ON wiki_edit_proposals(article_id);
CREATE INDEX IF NOT EXISTS idx_wiki_edit_proposals_status
  ON wiki_edit_proposals(status);
CREATE INDEX IF NOT EXISTS idx_wiki_edit_proposals_author
  ON wiki_edit_proposals(proposed_by);

-- Wiki Edit History
-- Track all changes to wiki articles
CREATE TABLE IF NOT EXISTS wiki_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES wiki_articles(id) ON DELETE CASCADE,

  -- What changed
  previous_content TEXT NOT NULL,
  new_content TEXT NOT NULL,
  change_description TEXT,

  -- Who and when
  editor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  edited_at TIMESTAMPTZ DEFAULT NOW(),

  -- Source of change
  edit_proposal_id UUID REFERENCES wiki_edit_proposals(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_wiki_edit_history_article
  ON wiki_edit_history(article_id);
CREATE INDEX IF NOT EXISTS idx_wiki_edit_history_date
  ON wiki_edit_history(edited_at DESC);

-- =============================================================================
-- PHASE 2: WIKI MINORITY REPORTS
-- =============================================================================

-- Wiki Minority Reports
-- Dissenting views on wiki articles, preserved like governance minority reports
CREATE TABLE IF NOT EXISTS wiki_minority_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES wiki_articles(id) ON DELETE CASCADE,

  -- The dissenting view
  dissenting_view TEXT NOT NULL,
  evidence TEXT,
  predictions TEXT,  -- What the dissenter predicts will happen

  -- Author
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Community backing
  total_sp INTEGER DEFAULT 0,
  sp_allocator_count INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'validated', 'invalidated', 'superseded')),

  -- Validation
  validation_notes TEXT,
  validated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wiki_minority_reports_article
  ON wiki_minority_reports(article_id);
CREATE INDEX IF NOT EXISTS idx_wiki_minority_reports_author
  ON wiki_minority_reports(author_id);
CREATE INDEX IF NOT EXISTS idx_wiki_minority_reports_status
  ON wiki_minority_reports(status);

-- =============================================================================
-- PHASE 3: UNANSWERED QUERY TRACKING
-- =============================================================================

-- Bridge Unanswered Queries
-- Track what Bridge couldn't answer to identify wiki gaps
CREATE TABLE IF NOT EXISTS bridge_unanswered_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- The query that couldn't be answered
  query_text TEXT NOT NULL,
  query_normalized TEXT NOT NULL,  -- Lowercase, trimmed for grouping

  -- Context
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_context JSONB,  -- Optional: what the user was doing

  -- Search results info
  search_results_count INTEGER DEFAULT 0,
  content_types_searched TEXT[],  -- ['wiki', 'forum', 'docs']

  -- Frequency tracking
  occurrence_count INTEGER DEFAULT 1,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),

  -- Resolution
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by_article_id UUID REFERENCES wiki_articles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ
);

-- Group similar queries
CREATE INDEX IF NOT EXISTS idx_bridge_unanswered_normalized
  ON bridge_unanswered_queries(query_normalized);
CREATE INDEX IF NOT EXISTS idx_bridge_unanswered_count
  ON bridge_unanswered_queries(occurrence_count DESC);
CREATE INDEX IF NOT EXISTS idx_bridge_unanswered_resolved
  ON bridge_unanswered_queries(resolved);

-- Bridge Search Analytics
-- Track what's being searched for (anonymized)
CREATE TABLE IF NOT EXISTS bridge_search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Query info (no PII)
  query_hash VARCHAR(64) NOT NULL,  -- SHA-256 of normalized query
  query_category VARCHAR(50),  -- 'governance', 'economy', 'technical', etc.

  -- Results
  result_count INTEGER DEFAULT 0,
  top_result_type VARCHAR(20),  -- 'wiki', 'forum', 'docs', 'proposal'
  top_result_trust_tier VARCHAR(20),

  -- Outcome
  user_followed_link BOOLEAN DEFAULT FALSE,
  user_asked_followup BOOLEAN DEFAULT FALSE,

  searched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bridge_search_analytics_hash
  ON bridge_search_analytics(query_hash);
CREATE INDEX IF NOT EXISTS idx_bridge_search_analytics_date
  ON bridge_search_analytics(searched_at DESC);

-- =============================================================================
-- PHASE 4: EXPORT/FEDERATION METADATA
-- =============================================================================

-- Wiki Export History
-- Track exports of wiki to git or other formats
CREATE TABLE IF NOT EXISTS wiki_export_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  export_type VARCHAR(20) NOT NULL CHECK (export_type IN ('git', 'markdown', 'json', 'federation')),

  -- What was exported
  article_count INTEGER NOT NULL,
  export_path TEXT,  -- e.g., 'docs/wiki/' for git exports

  -- Git info (if applicable)
  commit_sha VARCHAR(40),
  branch_name VARCHAR(100),

  -- Status
  status VARCHAR(20) DEFAULT 'completed'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  error_message TEXT,

  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  initiated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================================================
-- TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_wiki_article_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_wiki_articles_updated_at ON wiki_articles;
CREATE TRIGGER trigger_wiki_articles_updated_at
BEFORE UPDATE ON wiki_articles
FOR EACH ROW
EXECUTE FUNCTION update_wiki_article_updated_at();

DROP TRIGGER IF EXISTS trigger_glossary_terms_updated_at ON glossary_terms;
CREATE TRIGGER trigger_glossary_terms_updated_at
BEFORE UPDATE ON glossary_terms
FOR EACH ROW
EXECUTE FUNCTION update_wiki_article_updated_at();

DROP TRIGGER IF EXISTS trigger_wiki_minority_reports_updated_at ON wiki_minority_reports;
CREATE TRIGGER trigger_wiki_minority_reports_updated_at
BEFORE UPDATE ON wiki_minority_reports
FOR EACH ROW
EXECUTE FUNCTION update_wiki_article_updated_at();

-- Function to expand search query with synonyms
CREATE OR REPLACE FUNCTION expand_search_query(query_text TEXT)
RETURNS TEXT AS $$
DECLARE
  expanded TEXT := query_text;
  synonym_record RECORD;
BEGIN
  -- Find matching synonyms and add them to the query
  FOR synonym_record IN
    SELECT canonical_term, synonyms, abbreviations
    FROM search_synonyms
    WHERE LOWER(query_text) LIKE '%' || LOWER(canonical_term) || '%'
       OR EXISTS (
         SELECT 1 FROM unnest(synonyms) s WHERE LOWER(query_text) LIKE '%' || LOWER(s) || '%'
       )
       OR EXISTS (
         SELECT 1 FROM unnest(abbreviations) a WHERE LOWER(query_text) LIKE '%' || LOWER(a) || '%'
       )
  LOOP
    -- Add canonical term and abbreviations to search
    expanded := expanded || ' ' || synonym_record.canonical_term;
    expanded := expanded || ' ' || array_to_string(synonym_record.abbreviations, ' ');
  END LOOP;

  RETURN expanded;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to record unanswered query
CREATE OR REPLACE FUNCTION record_unanswered_query(
  p_query TEXT,
  p_user_id UUID DEFAULT NULL,
  p_results_count INTEGER DEFAULT 0,
  p_content_types TEXT[] DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  normalized TEXT := LOWER(TRIM(p_query));
  existing_id UUID;
  new_id UUID;
BEGIN
  -- Check if similar query already exists
  SELECT id INTO existing_id
  FROM bridge_unanswered_queries
  WHERE query_normalized = normalized
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    -- Update existing record
    UPDATE bridge_unanswered_queries
    SET occurrence_count = occurrence_count + 1,
        last_seen_at = NOW()
    WHERE id = existing_id;
    RETURN existing_id;
  ELSE
    -- Insert new record
    INSERT INTO bridge_unanswered_queries (
      query_text, query_normalized, user_id,
      search_results_count, content_types_searched
    ) VALUES (
      p_query, normalized, p_user_id,
      p_results_count, p_content_types
    )
    RETURNING id INTO new_id;
    RETURN new_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE wiki_articles IS 'Community-owned wiki articles, editable through governance';
COMMENT ON TABLE glossary_terms IS 'Brief definitions with links to deeper wiki content';
COMMENT ON TABLE search_synonyms IS 'Synonym expansion for Bridge search (SP↔Support Points)';
COMMENT ON TABLE wiki_edit_proposals IS 'Proposed edits to wiki articles, subject to review';
COMMENT ON TABLE wiki_edit_history IS 'Full history of changes to wiki articles';
COMMENT ON TABLE wiki_minority_reports IS 'Dissenting views on wiki content, preserved for accountability';
COMMENT ON TABLE bridge_unanswered_queries IS 'Queries Bridge could not answer, identifies wiki gaps';
COMMENT ON TABLE bridge_search_analytics IS 'Anonymized search analytics for improving content';
COMMENT ON TABLE wiki_export_history IS 'History of wiki exports to git/markdown/federation';

COMMENT ON FUNCTION expand_search_query IS 'Expands search query with synonyms and abbreviations';
COMMENT ON FUNCTION record_unanswered_query IS 'Records a query Bridge could not answer for gap analysis';
