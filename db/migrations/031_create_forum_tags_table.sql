-- Migration 031: Create forum_tags table for standalone tag management
-- Purpose: Allow admins to pre-create tags for autocomplete without requiring topics
-- Date: 2025-11-20

-- Create forum_tags table
CREATE TABLE IF NOT EXISTS forum_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tag TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Index for tag lookup
CREATE INDEX IF NOT EXISTS idx_forum_tags_tag ON forum_tags(tag);

-- Index for created_at (for ordering)
CREATE INDEX IF NOT EXISTS idx_forum_tags_created ON forum_tags(created_at DESC);

-- Comments
COMMENT ON TABLE forum_tags IS 'Standalone forum tags for autocomplete - independent of topics';
COMMENT ON COLUMN forum_tags.tag IS 'Tag name - must be unique';
COMMENT ON COLUMN forum_tags.created_by IS 'Admin user who created the tag';
