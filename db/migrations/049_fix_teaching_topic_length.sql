-- Migration: 049_fix_teaching_topic_length.sql
-- Description: Properly increase topic length to TEXT
--
-- Migration 048 failed because bridge_pattern_summary view depends on the topic column
-- This migration drops the view, alters the column, and recreates the view

-- Step 1: Drop the view that depends on the topic column
DROP VIEW IF EXISTS bridge_pattern_summary;

-- Step 2: Alter the column type from VARCHAR(100) to TEXT
ALTER TABLE bridge_teaching_sessions
  ALTER COLUMN topic TYPE TEXT;

-- Step 3: Recreate the view (from migration 046)
CREATE OR REPLACE VIEW bridge_pattern_summary AS
SELECT
  p.id,
  p.archetype,
  p.principle,
  p.confidence,
  p.usage_count,
  p.is_active,
  p.created_at,
  p.refined_at,
  s.topic,
  s.id as session_id,
  u.id as trainer_id,
  u.name as trainer_name,
  u.email as trainer_email,
  -- Calculate effectiveness from usage
  COALESCE(
    (SELECT AVG(user_rating) FROM bridge_pattern_usage pu WHERE pu.pattern_id = p.id),
    0
  ) as avg_rating,
  COALESCE(
    (SELECT COUNT(*) FILTER (WHERE was_helpful = TRUE) * 100.0 / NULLIF(COUNT(*), 0)
     FROM bridge_pattern_usage pu WHERE pu.pattern_id = p.id),
    0
  ) as helpful_rate
FROM bridge_learned_patterns p
LEFT JOIN bridge_teaching_sessions s ON p.session_id = s.id
LEFT JOIN users u ON s.trainer_id = u.id
ORDER BY p.created_at DESC;

COMMENT ON VIEW bridge_pattern_summary IS 'Admin view showing pattern effectiveness metrics';
