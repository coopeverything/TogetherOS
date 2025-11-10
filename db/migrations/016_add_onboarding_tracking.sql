-- Migration 016: Add Onboarding Tracking Fields
-- Adds fields to track user onboarding progress and completion
-- Dependencies: users table

-- Add onboarding tracking columns
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS onboarding_step VARCHAR(50),
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_progress JSONB DEFAULT '{}'::JSONB;

-- Create index for querying incomplete onboarding users
CREATE INDEX IF NOT EXISTS idx_users_onboarding_incomplete
  ON users(onboarding_started_at)
  WHERE onboarding_completed_at IS NULL AND deleted_at IS NULL;

-- Comments
COMMENT ON COLUMN users.onboarding_step IS 'Current step in onboarding flow (e.g., "questionnaires", "profile", "interests")';
COMMENT ON COLUMN users.onboarding_completed_at IS 'Timestamp when user completed full onboarding';
COMMENT ON COLUMN users.onboarding_started_at IS 'Timestamp when user first started onboarding';
COMMENT ON COLUMN users.onboarding_progress IS 'JSON object tracking progress: {questionnaires: 5, groups: 0, profile_complete: true}';
