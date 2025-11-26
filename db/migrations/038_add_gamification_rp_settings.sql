-- Migration 038: Add Gamification RP Settings
-- Purpose: Configurable RP rewards for onboarding, challenges, and streaks
-- Date: 2025-11-25

-- ============================================================================
-- GAMIFICATION RP SETTINGS
-- ============================================================================
-- These settings control RP rewards throughout the gamification system
-- Admins can adjust these via /admin/settings

-- -----------------------------------
-- ONBOARDING RP REWARDS
-- -----------------------------------
-- RP earned for completing each onboarding step

INSERT INTO system_settings (key, value, category, description, min_value, max_value) VALUES
  ('rp_earnings.onboarding_step_2', '15', 'rp_earnings', 'RP for completing profile basics (step 2)', 1, 100),
  ('rp_earnings.onboarding_step_3', '10', 'rp_earnings', 'RP for uploading avatar (step 3)', 1, 100),
  ('rp_earnings.onboarding_step_4', '20', 'rp_earnings', 'RP for selecting cooperation paths (step 4)', 1, 100),
  ('rp_earnings.onboarding_step_5', '15', 'rp_earnings', 'RP for adding skills/bio (step 5)', 1, 100),
  ('rp_earnings.onboarding_step_6', '30', 'rp_earnings', 'RP for completing questionnaire (step 6)', 1, 100),
  ('rp_earnings.onboarding_step_7', '25', 'rp_earnings', 'RP for joining first group (step 7)', 1, 100),
  ('rp_earnings.onboarding_complete', '50', 'rp_earnings', 'Bonus RP for completing full onboarding', 1, 200)
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------
-- CHALLENGE RP REWARDS
-- -----------------------------------
-- Base RP for daily challenges by category

INSERT INTO system_settings (key, value, category, description, min_value, max_value) VALUES
  ('rp_earnings.challenge_easy', '10', 'rp_earnings', 'Base RP for easy daily challenge', 1, 100),
  ('rp_earnings.challenge_medium', '25', 'rp_earnings', 'Base RP for medium daily challenge', 1, 100),
  ('rp_earnings.challenge_hard', '50', 'rp_earnings', 'Base RP for hard daily challenge', 1, 100),
  ('rp_earnings.first_week_day', '15', 'rp_earnings', 'RP for completing first-week daily challenge', 1, 100),
  ('rp_earnings.first_week_complete', '100', 'rp_earnings', 'Bonus RP for completing entire first week', 1, 500)
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------
-- STREAK MULTIPLIERS
-- -----------------------------------
-- Bonus multipliers for maintaining streaks

INSERT INTO system_settings (key, value, category, description, min_value, max_value) VALUES
  ('rp_earnings.streak_3_days', '1.1', 'rp_earnings', 'RP multiplier for 3-day streak (10% bonus)', 1.0, 2.0),
  ('rp_earnings.streak_7_days', '1.25', 'rp_earnings', 'RP multiplier for 7-day streak (25% bonus)', 1.0, 2.0),
  ('rp_earnings.streak_14_days', '1.5', 'rp_earnings', 'RP multiplier for 14-day streak (50% bonus)', 1.0, 3.0),
  ('rp_earnings.streak_30_days', '2.0', 'rp_earnings', 'RP multiplier for 30-day streak (100% bonus)', 1.0, 3.0)
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------
-- INVITATION RP REWARDS
-- -----------------------------------
-- RP earned for inviting and onboarding new members

INSERT INTO system_settings (key, value, category, description, min_value, max_value) VALUES
  ('rp_earnings.invitation_sent', '5', 'rp_earnings', 'RP for sending an invitation', 1, 50),
  ('rp_earnings.invitation_accepted', '25', 'rp_earnings', 'RP when invited user creates account', 1, 100),
  ('rp_earnings.invitation_onboarded', '50', 'rp_earnings', 'RP when invited user completes onboarding', 1, 200)
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------
-- SOCIAL ACTIONS RP
-- -----------------------------------
-- RP for community engagement actions

INSERT INTO system_settings (key, value, category, description, min_value, max_value) VALUES
  ('rp_earnings.first_post', '15', 'rp_earnings', 'RP for creating first feed post', 1, 100),
  ('rp_earnings.first_proposal_vote', '10', 'rp_earnings', 'RP for first governance vote', 1, 100),
  ('rp_earnings.first_forum_reply', '10', 'rp_earnings', 'RP for first forum reply', 1, 100),
  ('rp_earnings.profile_complete', '25', 'rp_earnings', 'RP for completing 100% of profile', 1, 100)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- DOCUMENTATION SYNC
-- ============================================================================

INSERT INTO documentation_references (setting_key, file_path, marker_tag) VALUES
  ('rp_earnings.onboarding_step_2', 'docs/modules/gamification.md', 'AUTO-GENERATED:onboarding_rp'),
  ('rp_earnings.challenge_easy', 'docs/modules/gamification.md', 'AUTO-GENERATED:challenge_rp'),
  ('rp_earnings.streak_7_days', 'docs/modules/gamification.md', 'AUTO-GENERATED:streak_rp'),
  ('rp_earnings.invitation_accepted', 'docs/modules/gamification.md', 'AUTO-GENERATED:invitation_rp')
ON CONFLICT DO NOTHING;
