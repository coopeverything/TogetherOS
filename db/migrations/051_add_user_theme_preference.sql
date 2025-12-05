-- Migration: Add theme preference to users table
-- Purpose: Allow users to save their preferred theme

ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_theme VARCHAR(50) DEFAULT 'default';

-- Add index for potential future queries by theme
CREATE INDEX IF NOT EXISTS idx_users_preferred_theme ON users(preferred_theme);

-- Comment on column
COMMENT ON COLUMN users.preferred_theme IS 'User preferred UI theme (e.g., default, sage-earth, fresh-peach, etc.)';
