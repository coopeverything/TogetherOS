-- Migration 019: Add embedded_urls column to posts table
-- Supports auto-detected social media URLs in native posts with inline previews

ALTER TABLE posts ADD COLUMN IF NOT EXISTS embedded_urls JSONB;

-- Comment for documentation
COMMENT ON COLUMN posts.embedded_urls IS 'Array of embedded URLs with previews detected in native post content (JSONB array of {url, preview, position})';

-- Index for querying posts with embeds (optional, for analytics)
CREATE INDEX IF NOT EXISTS idx_posts_has_embeds ON posts ((embedded_urls IS NOT NULL AND jsonb_array_length(embedded_urls) > 0));
