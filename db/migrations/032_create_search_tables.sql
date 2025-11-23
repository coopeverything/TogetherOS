-- Migration: Create Search Tables
-- Purpose: Enable search queries, filters, and search history tracking
-- Module: Search & Tags

-- Create search_queries table for tracking search activity
CREATE TABLE IF NOT EXISTS search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  query_hash VARCHAR(64) NOT NULL, -- SHA-256 hash for privacy
  filters JSONB DEFAULT '{}',
  result_count INTEGER DEFAULT 0,
  clicked_result_id UUID,
  clicked_result_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for search_queries
CREATE INDEX IF NOT EXISTS idx_search_queries_user_id ON search_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_query_hash ON search_queries(query_hash);
CREATE INDEX IF NOT EXISTS idx_search_queries_created_at ON search_queries(created_at DESC);

-- Create search_filters table for filter configuration
CREATE TABLE IF NOT EXISTS search_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  filter_type VARCHAR(50) NOT NULL, -- 'path', 'keyword', 'content_type', 'date_range'
  filter_value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for search_filters
CREATE INDEX IF NOT EXISTS idx_search_filters_type ON search_filters(filter_type);
CREATE INDEX IF NOT EXISTS idx_search_filters_active ON search_filters(is_active);
CREATE INDEX IF NOT EXISTS idx_search_filters_order ON search_filters(display_order);

-- Seed default filters (8 Cooperation Paths)
INSERT INTO search_filters (name, filter_type, filter_value, display_order, is_active) VALUES
('Collaborative Education', 'path', 'collaborative-education', 1, true),
('Social Economy', 'path', 'social-economy', 2, true),
('Common Wellbeing', 'path', 'common-wellbeing', 3, true),
('Cooperative Technology', 'path', 'cooperative-technology', 4, true),
('Collective Governance', 'path', 'collective-governance', 5, true),
('Community Connection', 'path', 'community-connection', 6, true),
('Collaborative Media & Culture', 'path', 'collaborative-media-culture', 7, true),
('Common Planet', 'path', 'common-planet', 8, true)
ON CONFLICT DO NOTHING;

-- Seed content type filters
INSERT INTO search_filters (name, filter_type, filter_value, display_order, is_active) VALUES
('All Content', 'content_type', 'all', 1, true),
('Proposals', 'content_type', 'proposal', 2, true),
('Forum Topics', 'content_type', 'topic', 3, true),
('Forum Posts', 'content_type', 'post', 4, true),
('Profiles', 'content_type', 'profile', 5, true)
ON CONFLICT DO NOTHING;
