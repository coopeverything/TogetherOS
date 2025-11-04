-- Migration: Add admin role to users
-- Created: 2025-11-04
-- Purpose: Add is_admin field to support admin-only features (Bridge training, etc.)

-- Add is_admin column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- Add index for admin users (for efficient lookups)
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = TRUE;

-- Add comment
COMMENT ON COLUMN users.is_admin IS 'Admin flag for platform administrators. Grants access to admin-only features like Bridge training data management.';

-- Optional: Set first user as admin (if exists)
-- Uncomment and modify email if you want to automatically promote a user
-- UPDATE users SET is_admin = TRUE WHERE email = 'your-email@example.com';
