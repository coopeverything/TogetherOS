-- Migration: Add Bridge Content Index
-- Date: 2025-12-12
-- Description: Index table for Bridge to search and retrieve site content with trust weighting
--
-- This enables Bridge to:
-- 1. Search forum posts, articles, proposals, wiki pages
-- 2. Weight content by community validation (votes, replies, SP)
-- 3. Use appropriate language based on trust tier

-- Bridge Content Index
-- Stores searchable content with trust signals for Bridge RAG
CREATE TABLE IF NOT EXISTS bridge_content_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content reference
  content_type VARCHAR(50) NOT NULL,  -- 'forum_post', 'forum_topic', 'article', 'proposal', 'wiki', 'event'
  content_id UUID NOT NULL,
  url TEXT NOT NULL,

  -- Searchable content
  title TEXT NOT NULL,
  summary TEXT,                       -- Excerpt or AI-generated summary
  keywords TEXT[],                    -- Extracted keywords for search
  full_text TEXT,                     -- Full content for deep search

  -- Trust signals (updated via triggers or periodic job)
  vote_score INTEGER DEFAULT 0,       -- Net votes (upvotes - downvotes)
  rating_avg DECIMAL(3,2),            -- Average rating if applicable (0.00-5.00)
  reply_count INTEGER DEFAULT 0,      -- Number of direct replies
  participant_count INTEGER DEFAULT 0, -- Unique users engaged
  total_sp INTEGER DEFAULT 0,         -- Total Support Points allocated
  sp_allocator_count INTEGER DEFAULT 0, -- Number of members who allocated SP

  -- Computed trust tier
  trust_tier VARCHAR(20) DEFAULT 'unvalidated'
    CHECK (trust_tier IN ('unvalidated', 'low', 'medium', 'high', 'consensus')),

  -- Metadata
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL,    -- Original content creation time
  indexed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate indexing
  UNIQUE(content_type, content_id)
);

-- Full-text search index
-- Enables efficient text search across title, summary, and full_text
CREATE INDEX IF NOT EXISTS idx_bridge_content_search
  ON bridge_content_index
  USING GIN(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(summary, '') || ' ' || COALESCE(full_text, '')));

-- Type filter index
CREATE INDEX IF NOT EXISTS idx_bridge_content_type
  ON bridge_content_index(content_type);

-- Trust tier filter index
CREATE INDEX IF NOT EXISTS idx_bridge_content_trust
  ON bridge_content_index(trust_tier);

-- Author lookup index
CREATE INDEX IF NOT EXISTS idx_bridge_content_author
  ON bridge_content_index(author_id);

-- Recency index for "latest content" queries
CREATE INDEX IF NOT EXISTS idx_bridge_content_created
  ON bridge_content_index(created_at DESC);

-- SP-weighted content (high-value content discovery)
CREATE INDEX IF NOT EXISTS idx_bridge_content_sp
  ON bridge_content_index(total_sp DESC)
  WHERE total_sp > 0;

-- Trust Thresholds Configuration
-- Stores admin-configurable trust tier thresholds
-- Uses system_settings table (already exists from migration 024)
INSERT INTO system_settings (key, value, description, category)
VALUES (
  'bridge_trust_thresholds',
  '{
    "newContentHours": 24,
    "low": {"minVotes": 1, "minReplies": 1},
    "medium": {"minVotes": 3, "minReplies": 3, "minSP": 5},
    "high": {"minVotes": 10, "minReplies": 5, "minSP": 20},
    "consensus": {"minVotes": 20, "minParticipants": 10, "minSP": 50}
  }',
  'Trust tier thresholds for Bridge content weighting. SP (Support Points) is weighted heavily.',
  'bridge'
)
ON CONFLICT (key) DO NOTHING;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_bridge_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trigger_bridge_content_updated_at ON bridge_content_index;
CREATE TRIGGER trigger_bridge_content_updated_at
BEFORE UPDATE ON bridge_content_index
FOR EACH ROW
EXECUTE FUNCTION update_bridge_content_updated_at();

-- Comments for documentation
COMMENT ON TABLE bridge_content_index IS 'Searchable content index for Bridge AI assistant with trust-weighted retrieval';
COMMENT ON COLUMN bridge_content_index.content_type IS 'Type of content: forum_post, forum_topic, article, proposal, wiki, event';
COMMENT ON COLUMN bridge_content_index.trust_tier IS 'Community validation level: unvalidated, low, medium, high, consensus';
COMMENT ON COLUMN bridge_content_index.total_sp IS 'Total Support Points allocated to this content - weighted heavily in trust calculation';
COMMENT ON COLUMN bridge_content_index.sp_allocator_count IS 'Number of unique members who allocated SP - diversity signal';
