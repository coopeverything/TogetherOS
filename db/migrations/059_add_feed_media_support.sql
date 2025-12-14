-- 059_add_feed_media_support.sql
-- Add media_urls column to feed_posts for image uploads

-- Add media_urls column (JSONB array of uploaded image URLs)
ALTER TABLE feed_posts
ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]'::jsonb;

-- Add check constraint to limit array size (max 4 images)
ALTER TABLE feed_posts
ADD CONSTRAINT feed_posts_media_urls_max_4
CHECK (jsonb_array_length(COALESCE(media_urls, '[]'::jsonb)) <= 4);

-- Add index for posts with media (useful for filtering)
CREATE INDEX IF NOT EXISTS idx_feed_posts_has_media
ON feed_posts ((jsonb_array_length(media_urls) > 0));

-- Comment for documentation
COMMENT ON COLUMN feed_posts.media_urls IS 'Array of uploaded image URLs (max 4), e.g. ["/uploads/feed/abc123.jpg"]';
