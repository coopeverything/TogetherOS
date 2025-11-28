-- Migration 043: Mystery Onboarding with Progressive Disclosure
-- Adds unlock levels for progressive feature disclosure and personality questionnaires
-- Dependencies: users table, questionnaires table, bridge_preferences table

-- ===========================
-- Add Unlock Level to Users
-- ===========================

-- Progressive disclosure levels:
-- 0: The Threshold (just signed up - Bridge chat + first questionnaire)
-- 1: First Steps (personality questionnaire done - microlessons + first challenge)
-- 2: Awakening (1 challenge done - member count teaser)
-- 3: Community Peek (3 challenges done - feed preview, groups list)
-- 4: Group Discovery (joined first group - full feed, member profiles)
-- 5: Citizen (first week complete OR 7 challenges - full access)

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS unlock_level INTEGER DEFAULT 0;

COMMENT ON COLUMN users.unlock_level IS 'Progressive disclosure level (0-5): 0=Threshold, 1=First Steps, 2=Awakening, 3=Community Peek, 4=Group Discovery, 5=Citizen';

CREATE INDEX IF NOT EXISTS idx_users_unlock_level ON users(unlock_level);

-- ===========================
-- Extend Questionnaire Types
-- ===========================

-- First, drop the existing constraint
ALTER TABLE questionnaires DROP CONSTRAINT IF EXISTS questionnaires_type_check;

-- Add new constraint with personality types
ALTER TABLE questionnaires
ADD CONSTRAINT questionnaires_type_check CHECK (type IN (
  -- Original types
  'location', 'interests', 'experience', 'resources', 'network-size',
  'time-commitment', 'goals', 'obstacles', 'skills', 'values',
  -- New personality types
  'communication-style', 'motivation-type', 'learning-preference', 'guidance-level'
));

-- ===========================
-- Extend Bridge Preferences
-- ===========================

ALTER TABLE bridge_preferences
  ADD COLUMN IF NOT EXISTS motivation_type TEXT DEFAULT 'community' CHECK (motivation_type IN ('achievement', 'community', 'learning', 'impact')),
  ADD COLUMN IF NOT EXISTS learning_preference TEXT DEFAULT 'doing' CHECK (learning_preference IN ('reading', 'watching', 'doing', 'discussing'));

COMMENT ON COLUMN bridge_preferences.motivation_type IS 'What drives the user: achievement, community, learning, or impact';
COMMENT ON COLUMN bridge_preferences.learning_preference IS 'How user prefers to learn: reading, watching videos, doing hands-on, discussing';

-- ===========================
-- Add Personality Questionnaires
-- ===========================

-- Note: sequence_number 11-14 to avoid conflicts with existing 1-10

INSERT INTO questionnaires (type, question, description, answer_type, options, sequence_number, estimated_time_seconds, rp_reward) VALUES
  ('communication-style',
   'How would you like me to talk to you?',
   'This helps Bridge personalize how it communicates with you',
   'single_choice',
   '[
     {"value": "formal", "label": "Straight to the point", "description": "Direct, efficient, no fluff"},
     {"value": "casual", "label": "Friendly and casual", "description": "Relaxed, conversational tone"},
     {"value": "empathetic", "label": "Warm and supportive", "description": "Encouraging, patient guidance"}
   ]'::JSONB,
   11, 30, 15),

  ('motivation-type',
   'What drives you most?',
   'Understanding your motivation helps Bridge suggest relevant actions',
   'single_choice',
   '[
     {"value": "achievement", "label": "Achieving goals", "description": "I like tracking progress and hitting targets"},
     {"value": "community", "label": "Connecting with others", "description": "I want to meet like-minded people"},
     {"value": "learning", "label": "Learning new things", "description": "I love discovering and understanding"},
     {"value": "impact", "label": "Making a difference", "description": "I want my actions to matter"}
   ]'::JSONB,
   12, 30, 15),

  ('learning-preference',
   'How do you prefer to learn?',
   'Bridge will adapt content delivery to your style',
   'single_choice',
   '[
     {"value": "reading", "label": "Reading articles", "description": "I absorb info best through text"},
     {"value": "watching", "label": "Watching videos", "description": "Visual demonstrations work for me"},
     {"value": "doing", "label": "Hands-on practice", "description": "I learn by doing and experimenting"},
     {"value": "discussing", "label": "Discussing with others", "description": "Conversation helps me process ideas"}
   ]'::JSONB,
   13, 30, 15),

  ('guidance-level',
   'How much guidance do you want?',
   'This affects how proactive Bridge is with suggestions',
   'single_choice',
   '[
     {"value": "minimal", "label": "Just point me in the right direction", "description": "I prefer to explore on my own"},
     {"value": "balanced", "label": "Some hand-holding please", "description": "Guide me but let me decide"},
     {"value": "proactive", "label": "Walk me through everything", "description": "Full step-by-step support"}
   ]'::JSONB,
   14, 30, 15)
ON CONFLICT (type) DO UPDATE SET
  question = EXCLUDED.question,
  description = EXCLUDED.description,
  options = EXCLUDED.options,
  sequence_number = EXCLUDED.sequence_number,
  estimated_time_seconds = EXCLUDED.estimated_time_seconds,
  rp_reward = EXCLUDED.rp_reward,
  updated_at = NOW();

-- ===========================
-- Unlock Tracking Table
-- ===========================

CREATE TABLE IF NOT EXISTS unlock_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Milestone info
  level INTEGER NOT NULL CHECK (level BETWEEN 0 AND 5),
  level_name TEXT NOT NULL,

  -- What unlocked this level
  unlocked_by TEXT NOT NULL CHECK (unlocked_by IN (
    'signup', 'personality_questionnaire', 'first_challenge',
    'three_challenges', 'first_group', 'first_week', 'seven_challenges'
  )),
  unlocked_by_id TEXT, -- Reference to the specific item (challenge_id, group_id, etc.)

  -- Timing
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Celebration shown?
  celebration_shown BOOLEAN NOT NULL DEFAULT FALSE,
  celebration_shown_at TIMESTAMPTZ,

  -- Unique: one unlock event per (user, level)
  UNIQUE(user_id, level)
);

CREATE INDEX idx_unlock_milestones_user ON unlock_milestones(user_id);
CREATE INDEX idx_unlock_milestones_level ON unlock_milestones(level);
CREATE INDEX idx_unlock_milestones_pending ON unlock_milestones(user_id) WHERE celebration_shown = FALSE;

COMMENT ON TABLE unlock_milestones IS 'Tracks when users unlock progressive disclosure levels';

-- ===========================
-- Update sequence numbers for existing questionnaires
-- ===========================

-- Fix the sequence_number uniqueness by updating the constraint
ALTER TABLE questionnaires DROP CONSTRAINT IF EXISTS questionnaires_sequence_number_check;
ALTER TABLE questionnaires ADD CONSTRAINT questionnaires_sequence_number_check CHECK (sequence_number BETWEEN 1 AND 20);

-- ===========================
-- Comments
-- ===========================

COMMENT ON COLUMN users.unlock_level IS 'Progressive unlock level for mystery onboarding (0=signup, 5=full access)';
