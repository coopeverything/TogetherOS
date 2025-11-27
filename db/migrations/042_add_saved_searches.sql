-- Migration: 042_add_saved_searches
-- Add saved_searches table for Phase 3 search functionality
-- Created: 2025-11-27

-- Create saved_searches table
CREATE TABLE IF NOT EXISTS search_saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  use_count INTEGER DEFAULT 0,
  CONSTRAINT search_saved_searches_name_length CHECK (char_length(name) >= 1)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_search_saved_searches_user_id
  ON search_saved_searches(user_id);

CREATE INDEX IF NOT EXISTS idx_search_saved_searches_last_used
  ON search_saved_searches(user_id, last_used_at DESC NULLS LAST);

-- Add index on search_queries for autocomplete (popular searches)
CREATE INDEX IF NOT EXISTS idx_search_queries_hash_count
  ON search_queries(query_hash, result_count);

-- Comment on table
COMMENT ON TABLE search_saved_searches IS 'User saved searches for quick access';
COMMENT ON COLUMN search_saved_searches.filters IS 'JSONB containing search filters (type, path, keywords, dateRange)';
COMMENT ON COLUMN search_saved_searches.use_count IS 'Number of times this saved search has been used';
