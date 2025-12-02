-- Migration: 047_make_teaching_archetype_optional.sql
-- Description: Make archetype optional in teaching sessions and add session intent
--
-- This allows members to start sessions without a specific archetype for:
-- - Information lookup: Just want to access CoopEverything's knowledge base
-- - Brainstorming: Want to explore and develop an idea
-- - Articulation: Need help putting words on something they've been thinking
-- - Role-play: Traditional archetype-based training (optional now)

-- ============================================================================
-- MAKE ARCHETYPE OPTIONAL
-- ============================================================================

-- Drop NOT NULL constraint on archetype_id
ALTER TABLE bridge_teaching_sessions
  ALTER COLUMN archetype_id DROP NOT NULL;

-- ============================================================================
-- ADD SESSION INTENT
-- ============================================================================

-- Add intent column to track the purpose of the session
ALTER TABLE bridge_teaching_sessions
  ADD COLUMN IF NOT EXISTS intent VARCHAR(30) DEFAULT 'general'
    CHECK (intent IN ('information', 'brainstorm', 'articulation', 'roleplay', 'general'));

-- Update existing sessions to have 'roleplay' intent since they all have archetypes
UPDATE bridge_teaching_sessions
SET intent = 'roleplay'
WHERE archetype_id IS NOT NULL AND intent = 'general';

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN bridge_teaching_sessions.intent IS
  'Session purpose: information (knowledge lookup), brainstorm (idea exploration), articulation (help expressing thoughts), roleplay (archetype-based training), general (unspecified)';

COMMENT ON COLUMN bridge_teaching_sessions.archetype_id IS
  'Optional reference to a user archetype for roleplay-style sessions';
