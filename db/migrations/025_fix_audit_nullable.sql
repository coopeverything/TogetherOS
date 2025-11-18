-- Migration 025: Fix system_settings_audit to allow NULL new_value for deletions
-- Purpose: Allow recording deletions in audit log (new_value = NULL when deleted)
-- Date: 2025-11-17

-- Make new_value nullable to support deletion records
ALTER TABLE system_settings_audit
  ALTER COLUMN new_value DROP NOT NULL;

-- Add comment explaining the schema
COMMENT ON COLUMN system_settings_audit.new_value IS 'New value after change. NULL indicates deletion.';
