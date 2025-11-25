-- 035_add_gamification_schema.sql
-- Gamification module: milestones, invitations, and celebration tracking
-- Based on docs/modules/gamification.md

-- ============================================================
-- Table: gamification_milestones
-- Tracks group milestone achievements (5, 15, 25, 50, 100, 150 members)
-- ============================================================
CREATE TABLE IF NOT EXISTS gamification_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  threshold INT NOT NULL,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  member_count INT NOT NULL,
  triggered_by_member_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching group milestones
CREATE INDEX IF NOT EXISTS idx_gamification_milestones_group
  ON gamification_milestones(group_id);

-- Index for finding milestones by threshold
CREATE INDEX IF NOT EXISTS idx_gamification_milestones_threshold
  ON gamification_milestones(group_id, threshold);

-- ============================================================
-- Table: gamification_milestone_celebrations
-- Tracks which users have seen which milestone celebrations
-- (Celebrations shown sequentially when user comes online)
-- ============================================================
CREATE TABLE IF NOT EXISTS gamification_milestone_celebrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES gamification_milestones(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shown_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action_taken BOOLEAN DEFAULT FALSE,
  action_taken_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(milestone_id, user_id)
);

-- Index for pending celebrations per user
CREATE INDEX IF NOT EXISTS idx_gamification_celebrations_user
  ON gamification_milestone_celebrations(user_id);

-- Index for finding unshown celebrations
CREATE INDEX IF NOT EXISTS idx_gamification_celebrations_pending
  ON gamification_milestone_celebrations(user_id, shown_at);

-- ============================================================
-- Table: gamification_invitations
-- Three-stage invitation reward system:
--   Stage 1: +25 RP on send
--   Stage 2: +50 RP on accept (inviter), +100 RP (invitee)
--   Stage 3: +25 RP on first contribution
-- ============================================================
CREATE TABLE IF NOT EXISTS gamification_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  invitee_member_id UUID REFERENCES users(id) ON DELETE SET NULL,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'expired', 'declined')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  -- RP reward tracking (prevents double-awarding)
  rp_awarded_stage_1 BOOLEAN DEFAULT FALSE,
  rp_awarded_stage_2 BOOLEAN DEFAULT FALSE,
  rp_awarded_stage_3 BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for inviter's invitations
CREATE INDEX IF NOT EXISTS idx_gamification_invitations_inviter
  ON gamification_invitations(inviter_id);

-- Index for tracking invitee (for quality score calculation)
CREATE INDEX IF NOT EXISTS idx_gamification_invitations_invitee
  ON gamification_invitations(invitee_member_id);

-- Index for pending invitations
CREATE INDEX IF NOT EXISTS idx_gamification_invitations_status
  ON gamification_invitations(status);

-- Index for group invitations
CREATE INDEX IF NOT EXISTS idx_gamification_invitations_group
  ON gamification_invitations(group_id);

-- ============================================================
-- Table: gamification_user_settings
-- User-level gamification preferences (quiet mode, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS gamification_user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  quiet_mode BOOLEAN DEFAULT FALSE,
  hide_rp_balance BOOLEAN DEFAULT FALSE,
  show_milestones BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Add gamification RP event types to existing rp_earning_rules
-- ============================================================
INSERT INTO rp_earning_rules (event_type, rp_amount, active) VALUES
  ('invitation_sent', 25, true),
  ('invitation_accepted', 50, true),
  ('invitation_contributed', 25, true),
  ('meetup_organized', 100, true),
  ('federated_connection', 75, true),
  ('working_group_launched', 150, true),
  ('group_mentored', 200, true),
  ('governance_proposal_drafted', 250, true)
ON CONFLICT (event_type) DO NOTHING;

-- ============================================================
-- MSSP: Update this migration run marker
-- ============================================================
-- Run: psql -d togetheros -f db/migrations/035_add_gamification_schema.sql
