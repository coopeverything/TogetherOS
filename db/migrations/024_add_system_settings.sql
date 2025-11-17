-- Migration 024: Add System Settings Infrastructure
-- Purpose: Centralized configuration management with transparency & audit trail
-- Date: 2025-11-17

-- ============================================================================
-- SYSTEM SETTINGS TABLE
-- ============================================================================
-- Centralized key-value configuration storage
-- Replaces hardcoded constants in TypeScript with database-driven config

CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  category VARCHAR(50) NOT NULL,           -- 'sp_weights', 'rp_earnings', 'conversion_rates', 'constraints'
  description TEXT NOT NULL,
  min_value NUMERIC,                       -- Optional validation constraint
  max_value NUMERIC,                       -- Optional validation constraint
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for category-based queries
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

-- ============================================================================
-- SYSTEM SETTINGS AUDIT LOG
-- ============================================================================
-- Append-only transparency log for all settings changes
-- Public record of who changed what, when, and why

CREATE TABLE IF NOT EXISTS system_settings_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) NOT NULL,
  old_value JSONB,
  new_value JSONB NOT NULL,
  changed_by UUID NOT NULL REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,                             -- Why was this changed?
  ip_address INET                          -- For accountability
);

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_settings_audit_key ON system_settings_audit(setting_key, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_settings_audit_user ON system_settings_audit(changed_by, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_settings_audit_time ON system_settings_audit(changed_at DESC);

-- ============================================================================
-- SEED INITIAL SETTINGS
-- ============================================================================
-- Migrate existing hardcoded values to database

-- -----------------------------------
-- SUPPORT POINTS (SP) WEIGHTS
-- -----------------------------------
-- Currently hardcoded in packages/types/src/rewards.ts (SP_WEIGHTS)
-- Moving to database for admin configurability

INSERT INTO system_settings (key, value, category, description, min_value, max_value) VALUES
  ('sp_weights.pr_merged_small', '5', 'sp_weights', 'SP earned for small PR merge (< 50 lines)', 1, 100),
  ('sp_weights.pr_merged_medium', '10', 'sp_weights', 'SP earned for medium PR merge (50-200 lines)', 1, 100),
  ('sp_weights.pr_merged_large', '20', 'sp_weights', 'SP earned for large PR merge (> 200 lines)', 1, 100),
  ('sp_weights.docs_contribution', '8', 'sp_weights', 'SP earned for documentation contribution', 1, 100),
  ('sp_weights.code_review', '3', 'sp_weights', 'SP earned for code review', 1, 100),
  ('sp_weights.issue_triage', '2', 'sp_weights', 'SP earned for issue triage', 1, 100),
  ('sp_weights.bug_fix', '15', 'sp_weights', 'SP earned for bug fix', 1, 100),
  ('sp_weights.group_created', '15', 'sp_weights', 'SP earned for creating a group', 1, 100),
  ('sp_weights.group_joined', '3', 'sp_weights', 'SP earned for joining a group', 1, 100),
  ('sp_weights.city_group_joined', '0', 'sp_weights', 'SP earned for joining city-based group (no reward)', 0, 100),
  ('sp_weights.proposal_rating_submitted', '2', 'sp_weights', 'SP earned for submitting proposal rating', 1, 100),
  ('sp_weights.proposal_rating_quality', '5', 'sp_weights', 'SP earned for high-quality rating feedback', 1, 100),
  ('sp_weights.proposal_rating_innovative', '3', 'sp_weights', 'SP earned for marking proposal as innovative', 1, 100),
  ('sp_weights.proposal_highly_rated', '10', 'sp_weights', 'SP earned when proposal receives high ratings', 1, 100)
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------
-- REPUTATION POINTS (RP) EARNINGS
-- -----------------------------------
-- Currently in rp_earning_rules table (migration 023)
-- Migrating to system_settings for unified management

INSERT INTO system_settings (key, value, category, description, min_value, max_value) VALUES
  ('rp_earnings.pr_merged_small', '25', 'rp_earnings', 'RP earned for small PR merge (< 50 lines)', 1, 1000),
  ('rp_earnings.pr_merged_medium', '50', 'rp_earnings', 'RP earned for medium PR merge (50-200 lines)', 1, 1000),
  ('rp_earnings.pr_merged_large', '100', 'rp_earnings', 'RP earned for large PR merge (> 200 lines)', 1, 1000),
  ('rp_earnings.docs_contribution', '40', 'rp_earnings', 'RP earned for documentation contribution', 1, 1000),
  ('rp_earnings.code_review', '15', 'rp_earnings', 'RP earned for code review', 1, 1000),
  ('rp_earnings.issue_triage', '10', 'rp_earnings', 'RP earned for issue triage', 1, 1000),
  ('rp_earnings.bug_fix', '75', 'rp_earnings', 'RP earned for bug fix', 1, 1000),
  ('rp_earnings.monthly_dues_paid', '100', 'rp_earnings', 'RP earned for paying monthly dues', 1, 1000),
  ('rp_earnings.donation', '200', 'rp_earnings', 'RP earned for donation (min $10)', 1, 1000)
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------
-- CONVERSION RATES & CAPS
-- -----------------------------------
-- Currently hardcoded in packages/db/src/reward-points.ts
-- Moving to database for flexibility

INSERT INTO system_settings (key, value, category, description, min_value, max_value) VALUES
  ('conversion.rp_to_tbc_rate', '100', 'conversion_rates', 'RP required to convert to 1 TBC', 1, 10000),
  ('conversion.monthly_tbc_cap', '1', 'conversion_rates', 'Maximum TBC conversions per member per month', 0, 100),
  ('conversion.sp_to_rp_enabled', 'false', 'conversion_rates', 'Whether SP→RP conversion is allowed', NULL, NULL)
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------
-- ALLOCATION CONSTRAINTS
-- -----------------------------------
-- Currently hardcoded constraints
-- Moving to database for admin control

INSERT INTO system_settings (key, value, category, description, min_value, max_value) VALUES
  ('constraints.max_sp_per_proposal', '10', 'constraints', 'Maximum SP a member can allocate to one proposal', 1, 100),
  ('constraints.initial_sp_balance', '100', 'constraints', 'Initial SP balance for new members', 0, 1000),
  ('constraints.min_sp_for_voting', '0', 'constraints', 'Minimum SP required to vote on proposals', 0, 100)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- DOCUMENTATION SYNC METADATA
-- ============================================================================
-- Track which documentation files reference these settings
-- Used by auto-update system to know what to regenerate

CREATE TABLE IF NOT EXISTS documentation_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) NOT NULL REFERENCES system_settings(key) ON DELETE CASCADE,
  file_path TEXT NOT NULL,                -- Relative path from repo root
  marker_tag VARCHAR(50),                  -- Comment marker for replacement
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for finding docs that reference a setting
CREATE INDEX IF NOT EXISTS idx_doc_refs_setting_key ON documentation_references(setting_key);

-- Seed initial documentation references
INSERT INTO documentation_references (setting_key, file_path, marker_tag) VALUES
  ('sp_weights.pr_merged_small', 'docs/modules/rewards.md', 'AUTO-GENERATED:sp_weights'),
  ('sp_weights.pr_merged_medium', 'docs/modules/rewards.md', 'AUTO-GENERATED:sp_weights'),
  ('sp_weights.pr_merged_large', 'docs/modules/rewards.md', 'AUTO-GENERATED:sp_weights'),
  ('sp_weights.docs_contribution', 'docs/modules/rewards.md', 'AUTO-GENERATED:sp_weights'),
  ('sp_weights.code_review', 'docs/modules/rewards.md', 'AUTO-GENERATED:sp_weights'),
  ('sp_weights.issue_triage', 'docs/modules/rewards.md', 'AUTO-GENERATED:sp_weights'),
  ('sp_weights.bug_fix', 'docs/modules/rewards.md', 'AUTO-GENERATED:sp_weights'),
  ('rp_earnings.pr_merged_small', 'docs/modules/rewards.md', 'AUTO-GENERATED:rp_earnings'),
  ('rp_earnings.pr_merged_medium', 'docs/modules/rewards.md', 'AUTO-GENERATED:rp_earnings'),
  ('rp_earnings.pr_merged_large', 'docs/modules/rewards.md', 'AUTO-GENERATED:rp_earnings'),
  ('conversion.rp_to_tbc_rate', 'docs/guides/4-ledger-system.md', 'AUTO-GENERATED:conversion_rates'),
  ('constraints.max_sp_per_proposal', 'docs/modules/support-points-ui.md', 'AUTO-GENERATED:constraints')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get setting value (with type casting)
CREATE OR REPLACE FUNCTION get_setting(setting_key VARCHAR, default_value JSONB DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT value INTO result FROM system_settings WHERE key = setting_key;
  IF result IS NULL THEN
    RETURN default_value;
  END IF;
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to update setting with automatic audit logging
CREATE OR REPLACE FUNCTION update_setting(
  setting_key VARCHAR,
  new_value JSONB,
  user_id UUID,
  change_reason TEXT DEFAULT NULL,
  user_ip INET DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  old_val JSONB;
BEGIN
  -- Get current value
  SELECT value INTO old_val FROM system_settings WHERE key = setting_key;

  -- Insert audit record
  INSERT INTO system_settings_audit (setting_key, old_value, new_value, changed_by, reason, ip_address)
  VALUES (setting_key, old_val, new_value, user_id, change_reason, user_ip);

  -- Update setting
  UPDATE system_settings
  SET value = new_value, updated_by = user_id, updated_at = NOW()
  WHERE key = setting_key;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE system_settings IS 'Centralized configuration for all TogetherOS reward values and constraints';
COMMENT ON TABLE system_settings_audit IS 'Append-only transparency log for settings changes - public audit trail';
COMMENT ON TABLE documentation_references IS 'Tracks which documentation files reference settings for auto-sync';
COMMENT ON FUNCTION get_setting IS 'Retrieve setting value with optional default';
COMMENT ON FUNCTION update_setting IS 'Update setting with automatic audit logging';
