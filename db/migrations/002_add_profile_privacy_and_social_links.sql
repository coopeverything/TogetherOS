-- Migration: Add profile privacy settings and social links
-- Date: 2025-10-31

-- Add privacy settings to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_visibility VARCHAR(20) DEFAULT 'public' CHECK (profile_visibility IN ('public', 'members', 'private'));

-- Add social links to users table (JSONB for flexibility)
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- Example social_links structure:
-- {
--   "github": "username",
--   "twitter": "username",
--   "linkedin": "username",
--   "website": "https://example.com",
--   "mastodon": "@user@instance.social",
--   "bluesky": "@user.bsky.social"
-- }

-- Add index for profile visibility queries
CREATE INDEX IF NOT EXISTS idx_users_profile_visibility ON users(profile_visibility) WHERE deleted_at IS NULL;

-- Add comment
COMMENT ON COLUMN users.profile_visibility IS 'Profile visibility: public (anyone), members (logged-in users), private (only self)';
COMMENT ON COLUMN users.social_links IS 'Social media links and personal website (JSON object)';
