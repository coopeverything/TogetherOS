-- Migration: Add OAuth auto-capture fields
-- Date: 2025-10-28

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS oauth_display_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS oauth_avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS oauth_locale VARCHAR(10),
  ADD COLUMN IF NOT EXISTS oauth_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS oauth_raw_profile JSONB;

COMMENT ON COLUMN users.oauth_display_name IS 'Display name from OAuth provider (Google, FB, etc.)';
COMMENT ON COLUMN users.oauth_avatar_url IS 'Profile picture URL from OAuth provider';
COMMENT ON COLUMN users.oauth_locale IS 'User locale from OAuth (e.g., en-US, es-ES)';
COMMENT ON COLUMN users.oauth_verified IS 'Whether OAuth provider verified the account';
COMMENT ON COLUMN users.oauth_raw_profile IS 'Complete OAuth profile for reference';
