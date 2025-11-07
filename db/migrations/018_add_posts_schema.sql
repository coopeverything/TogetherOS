-- Migration 018: Add posts table for Feed module
-- This table stores both native posts and social media imports

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Post type and ownership
  type VARCHAR(20) NOT NULL CHECK (type IN ('native', 'instagram', 'tiktok', 'twitter', 'facebook', 'other')),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,

  -- Native post content
  title VARCHAR(200),
  content TEXT,

  -- Social media import fields
  source_url TEXT,
  source_preview JSONB,  -- MediaPreview object: {thumbnailUrl, title, description, authorName, platform}

  -- Metadata
  topics TEXT[] NOT NULL,  -- 1-5 topics from taxonomy
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'flagged', 'hidden')),

  -- Discussion tracking
  discussion_thread_id UUID,  -- Will reference discussion_threads table when created
  discussion_count INTEGER NOT NULL DEFAULT 0 CHECK (discussion_count >= 0),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Business logic constraints
  CHECK (array_length(topics, 1) >= 1 AND array_length(topics, 1) <= 5),
  CHECK (
    (type = 'native' AND content IS NOT NULL) OR
    (type != 'native' AND source_url IS NOT NULL)
  )
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_group_id ON posts(group_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_topics ON posts USING GIN(topics);  -- For topic filtering
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fix foreign key constraint in post_ratings table
-- This table was created in migration 004 but couldn't reference posts table
ALTER TABLE post_ratings
  DROP CONSTRAINT IF EXISTS fk_post_ratings_post_id,
  ADD CONSTRAINT fk_post_ratings_post_id
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

-- Fix foreign key constraint in discussion_evidence table
-- This table was created in migration 005 but couldn't reference posts table
ALTER TABLE IF EXISTS discussion_evidence
  DROP CONSTRAINT IF EXISTS fk_discussion_evidence_post_id,
  ADD CONSTRAINT fk_discussion_evidence_post_id
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;

-- Comment for documentation
COMMENT ON TABLE posts IS 'Feed posts: both user-created (native) and social media imports';
COMMENT ON COLUMN posts.type IS 'Post origin: native (created in-app) or social media platform';
COMMENT ON COLUMN posts.source_preview IS 'Cached metadata from social media oEmbed/OpenGraph (JSONB)';
COMMENT ON COLUMN posts.topics IS 'Array of 1-5 topic tags from Cooperation Paths taxonomy';
COMMENT ON COLUMN posts.discussion_thread_id IS 'Links to discussion_threads table (to be created)';
