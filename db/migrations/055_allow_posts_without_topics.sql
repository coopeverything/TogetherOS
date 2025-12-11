-- Migration 055: Allow feed posts without topics
-- Fixes: posts_topics_check constraint required at least 1 topic
-- Related: feed POST validation was updated to allow empty topics array

-- Drop the old constraint that required >= 1 topic
ALTER TABLE feed_posts DROP CONSTRAINT IF EXISTS posts_topics_check;

-- Add new constraint allowing 0-5 topics (empty array is valid)
-- array_length returns NULL for empty arrays, so we check for that
ALTER TABLE feed_posts ADD CONSTRAINT posts_topics_check
  CHECK (array_length(topics, 1) IS NULL OR (array_length(topics, 1) >= 0 AND array_length(topics, 1) <= 5));

-- Comment for documentation
COMMENT ON CONSTRAINT posts_topics_check ON feed_posts IS 'Allow 0-5 topics per post (was previously 1-5)';
