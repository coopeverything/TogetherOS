-- Migration 029: Fix Forum posts table collision
-- Date: 2024-11-19
-- Issue: Forum and Feed modules both created "posts" table
-- Solution: Use module-prefixed names (feed_posts, forum_posts)
-- Status: MANUALLY APPLIED ON PRODUCTION (2024-11-19)
--
-- This migration has already been applied manually on production.
-- It is documented here for reference and for other environments.
--
-- Changes made:
-- 1. Renamed posts → feed_posts (Feed module)
-- 2. Renamed all feed_posts indexes
-- 3. Created forum_posts table (Forum module)
-- 4. Updated replies FK to reference forum_posts
--
-- IMPORTANT: This migration assumes migration 027 partially succeeded
-- (topics table exists, but posts table was from Feed module migration 018)

BEGIN;

-- Step 1: Check if posts table exists and rename to feed_posts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
    -- Rename Feed's posts table
    ALTER TABLE posts RENAME TO feed_posts;

    -- Rename indexes
    ALTER INDEX IF EXISTS posts_pkey RENAME TO feed_posts_pkey;
    ALTER INDEX IF EXISTS idx_posts_author_id RENAME TO idx_feed_posts_author_id;
    ALTER INDEX IF EXISTS idx_posts_group_id RENAME TO idx_feed_posts_group_id;
    ALTER INDEX IF EXISTS idx_posts_status RENAME TO idx_feed_posts_status;
    ALTER INDEX IF EXISTS idx_posts_created_at RENAME TO idx_feed_posts_created_at;
    ALTER INDEX IF EXISTS idx_posts_topics RENAME TO idx_feed_posts_topics;
    ALTER INDEX IF EXISTS idx_posts_type RENAME TO idx_feed_posts_type;
    ALTER INDEX IF EXISTS idx_posts_created RENAME TO idx_feed_posts_created;
    ALTER INDEX IF EXISTS idx_posts_has_embeds RENAME TO idx_feed_posts_has_embeds;
  END IF;
END $$;

-- Step 2: Create forum_posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 5000),
  position_stance post_stance,
  position_reasoning TEXT CHECK (position_reasoning IS NULL OR (length(position_reasoning) >= 10 AND length(position_reasoning) <= 1000)),
  position_tradeoffs TEXT[] DEFAULT ARRAY[]::TEXT[],
  position_alternatives TEXT[] DEFAULT ARRAY[]::TEXT[],
  citations JSONB DEFAULT '[]'::jsonb,
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Create forum_posts indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_forum_posts_topic ON forum_posts(topic_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(author_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_forum_posts_created ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_citations ON forum_posts USING GIN(citations);

-- Step 3: Update replies foreign key to reference forum_posts (if replies table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'replies') THEN
    -- Drop old constraint if it exists
    ALTER TABLE replies DROP CONSTRAINT IF EXISTS replies_post_id_fkey;

    -- Add new constraint to reference forum_posts
    ALTER TABLE replies
      ADD CONSTRAINT replies_post_id_fkey
      FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 4: Create/update triggers
DROP TRIGGER IF EXISTS update_forum_posts_updated_at ON forum_posts;
CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'togetheros_app') THEN
    GRANT ALL PRIVILEGES ON TABLE forum_posts TO togetheros_app;
  END IF;
END $$;

-- Add documentation
COMMENT ON TABLE forum_posts IS 'Forum module: Top-level responses to forum topics with optional deliberation positions';
COMMENT ON TABLE feed_posts IS 'Feed module: User posts in social feed (native and imported)';

-- Migration complete
COMMIT;
