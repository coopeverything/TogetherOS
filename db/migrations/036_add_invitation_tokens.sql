-- 036_add_invitation_tokens.sql
-- Add token support for URL-based invitation acceptance
-- Part of onboarding experience Phase 1

-- ============================================================
-- Add token column to gamification_invitations
-- Token is a 64-character random string for shareable URLs
-- ============================================================
ALTER TABLE gamification_invitations
  ADD COLUMN IF NOT EXISTS token VARCHAR(64) UNIQUE;

-- Add personal message for customized invitations
ALTER TABLE gamification_invitations
  ADD COLUMN IF NOT EXISTS personal_message TEXT;

-- Index for token lookups (only pending invitations)
CREATE INDEX IF NOT EXISTS idx_gamification_invitations_token
  ON gamification_invitations(token) WHERE status = 'pending';

-- ============================================================
-- Track invitation source on users table
-- ============================================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS invited_by_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS invitation_id UUID REFERENCES gamification_invitations(id) ON DELETE SET NULL;

-- Index for finding users by inviter (for referral tracking)
CREATE INDEX IF NOT EXISTS idx_users_invited_by
  ON users(invited_by_id) WHERE invited_by_id IS NOT NULL;

-- ============================================================
-- Run: psql -d togetheros -f db/migrations/036_add_invitation_tokens.sql
-- ============================================================
