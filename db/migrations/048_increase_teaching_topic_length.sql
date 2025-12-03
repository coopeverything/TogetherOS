-- Increase topic length for teaching sessions
-- Topic can be a full question/prompt, needs more than 100 chars

ALTER TABLE bridge_teaching_sessions
  ALTER COLUMN topic TYPE TEXT;
