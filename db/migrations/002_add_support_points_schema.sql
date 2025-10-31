-- Migration: Add Support Points and Rewards System
-- Date: 2025-10-31
-- Description: Support Points allocation, reward events, and member balances

-- Support Points Balances
-- Tracks each member's SP wallet (total earned, available, allocated)
CREATE TABLE IF NOT EXISTS support_points_balances (
  member_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Balance tracking
  total_earned INTEGER NOT NULL DEFAULT 100,      -- All-time earned (starts with 100)
  available INTEGER NOT NULL DEFAULT 100,         -- Current balance (not allocated)
  allocated INTEGER NOT NULL DEFAULT 0,           -- Locked in active proposals

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Support Points Transactions
-- Immutable log of all SP movements
CREATE TABLE IF NOT EXISTS support_points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Transaction details
  type VARCHAR(20) NOT NULL CHECK (type IN ('initial', 'earn', 'allocate', 'reclaim', 'expire')),
  amount INTEGER NOT NULL,                        -- Can be positive (earn) or negative (allocate)

  -- Context
  target_type VARCHAR(50),                        -- 'proposal', 'initiative', etc.
  target_id UUID,                                 -- ID of target entity
  event_id UUID,                                  -- Link to reward_event if applicable
  reason TEXT,                                    -- Human-readable reason

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  INDEX idx_sp_tx_member (member_id, created_at DESC),
  INDEX idx_sp_tx_target (target_type, target_id)
);

-- Reward Events
-- Tracks contribution events that earn Support Points
CREATE TABLE IF NOT EXISTS reward_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Actor
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Event details
  event_type VARCHAR(50) NOT NULL,                -- e.g., 'pr_merged_medium', 'code_review'
  sp_weight INTEGER NOT NULL,                     -- Support Points awarded
  source VARCHAR(50) NOT NULL,                    -- 'github', 'manual', 'bridge', etc.

  -- Deduplication
  dedup_key VARCHAR(255) UNIQUE NOT NULL,         -- Prevents double-counting

  -- Context (flexible JSON for event-specific data)
  context JSONB DEFAULT '{}'::jsonb,

  -- Processing
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  processed_at TIMESTAMP,
  error_message TEXT,

  -- Metadata
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),

  -- Indexes
  INDEX idx_reward_events_member (member_id, timestamp DESC),
  INDEX idx_reward_events_dedup (dedup_key),
  INDEX idx_reward_events_status (status, created_at),
  INDEX idx_reward_events_type (event_type)
);

-- Badges
-- Definitions of achievable badges
CREATE TABLE IF NOT EXISTS badges (
  id VARCHAR(50) PRIMARY KEY,                     -- e.g., 'first-pr', 'bug-hunter'
  name VARCHAR(100) NOT NULL,                     -- Display name
  description TEXT NOT NULL,
  icon VARCHAR(10) NOT NULL,                      -- Emoji or icon identifier
  category VARCHAR(50) NOT NULL CHECK (category IN ('contribution', 'milestone', 'special')),

  -- Criteria (stored as JSONB for flexibility)
  criteria JSONB NOT NULL,                        -- Rules for earning badge

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Member Badges
-- Tracks which badges each member has earned
CREATE TABLE IF NOT EXISTS member_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id VARCHAR(50) NOT NULL REFERENCES badges(id),

  -- Context
  earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  event_id UUID REFERENCES reward_events(id),    -- Which event triggered the badge

  -- Unique constraint: one badge per member
  UNIQUE(member_id, badge_id),

  -- Indexes
  INDEX idx_member_badges_member (member_id, earned_at DESC)
);

-- Allocations
-- Tracks Support Points allocated to proposals/initiatives
CREATE TABLE IF NOT EXISTS support_points_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Target
  target_type VARCHAR(50) NOT NULL,               -- 'proposal', 'initiative', etc.
  target_id UUID NOT NULL,                        -- ID of target entity

  -- Allocation details
  amount INTEGER NOT NULL CHECK (amount > 0 AND amount <= 10), -- Max 10 SP per target
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'reclaimed', 'expired')),

  -- Lifecycle
  allocated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  reclaimed_at TIMESTAMP,

  -- Unique constraint: one allocation per member per target
  UNIQUE(member_id, target_id),

  -- Indexes
  INDEX idx_sp_alloc_member (member_id, status),
  INDEX idx_sp_alloc_target (target_type, target_id, status)
);

-- Initialize Support Points for existing users
-- Give 100 SP to all users who don't have a balance yet
INSERT INTO support_points_balances (member_id, total_earned, available, allocated)
SELECT id, 100, 100, 0
FROM users
WHERE id NOT IN (SELECT member_id FROM support_points_balances)
ON CONFLICT (member_id) DO NOTHING;

-- Create initial transaction record for new balances
INSERT INTO support_points_transactions (member_id, type, amount, reason)
SELECT member_id, 'initial', 100, 'Initial Support Points allocation'
FROM support_points_balances
WHERE total_earned = 100 AND allocated = 0
ON CONFLICT DO NOTHING;

-- Seed initial badges
INSERT INTO badges (id, name, description, icon, category, criteria) VALUES
  ('first-pr', 'First PR', 'Merged your first pull request', '🔧', 'milestone', '{"event_types": ["pr_merged_small", "pr_merged_medium", "pr_merged_large"], "threshold": 1}'),
  ('foundation-builder', 'Foundation Builder', 'Merged 10+ PRs', '🏗️', 'milestone', '{"event_types": ["pr_merged_small", "pr_merged_medium", "pr_merged_large"], "threshold": 10}'),
  ('bug-hunter', 'Bug Hunter', 'Fixed 5+ critical bugs', '🐛', 'contribution', '{"event_types": ["bug_fix"], "threshold": 5}'),
  ('docs-champion', 'Docs Champion', 'Contributed 5+ documentation improvements', '📚', 'contribution', '{"event_types": ["docs_contribution"], "threshold": 5}'),
  ('code-reviewer', 'Code Reviewer', 'Reviewed 10+ pull requests', '🔍', 'contribution', '{"event_types": ["code_review"], "threshold": 10}')
ON CONFLICT (id) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sp_balance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Trigger to auto-update updated_at on balance changes
CREATE TRIGGER update_sp_balance_timestamp
BEFORE UPDATE ON support_points_balances
FOR EACH ROW
EXECUTE FUNCTION update_sp_balance_updated_at();

-- Comments for documentation
COMMENT ON TABLE support_points_balances IS 'Member Support Points wallet balances';
COMMENT ON TABLE support_points_transactions IS 'Immutable log of all SP movements';
COMMENT ON TABLE reward_events IS 'Contribution events that earn Support Points';
COMMENT ON TABLE badges IS 'Achievable badge definitions';
COMMENT ON TABLE member_badges IS 'Badges earned by members';
COMMENT ON TABLE support_points_allocations IS 'SP allocated to proposals/initiatives';

COMMENT ON COLUMN support_points_balances.total_earned IS 'All-time SP earned (never decreases)';
COMMENT ON COLUMN support_points_balances.available IS 'SP available to allocate (total - allocated)';
COMMENT ON COLUMN support_points_balances.allocated IS 'SP currently locked in active proposals';

COMMENT ON COLUMN reward_events.dedup_key IS 'Prevents duplicate event processing (source + context hash)';
COMMENT ON COLUMN reward_events.sp_weight IS 'Support Points awarded for this event';

COMMENT ON COLUMN support_points_allocations.amount IS 'SP allocated (max 10 per target)';
COMMENT ON COLUMN support_points_allocations.status IS 'active = locked, reclaimed = returned, expired = lost';
