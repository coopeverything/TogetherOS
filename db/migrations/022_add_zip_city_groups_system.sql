-- Migration: Add ZIP-based City Groups System
-- Date: 2025-01-06
-- Description: User ZIP codes with geocoding, auto-created city groups, tags, RP rewards

-- ============================================================================
-- Part 1: User Geocoding Fields
-- ============================================================================

-- Add ZIP code and geocoded location fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS geocoded_city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS geocoded_state VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS geocoded_country VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS geocoded_neighborhood VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL(9,6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL(9,6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS geocoded_at TIMESTAMP;

-- Create indexes for geocoded fields
CREATE INDEX IF NOT EXISTS idx_users_zip_code ON users(zip_code);
CREATE INDEX IF NOT EXISTS idx_users_geocoded_city ON users(geocoded_city);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude);

-- ============================================================================
-- Part 2: Update Group Types Enum
-- ============================================================================

-- Update group_type enum from (local, federated) to (local, national, global)
ALTER TYPE group_type RENAME TO group_type_old;
CREATE TYPE group_type AS ENUM ('local', 'national', 'global');

-- Migrate existing groups to new types
ALTER TABLE groups
  ALTER COLUMN type TYPE group_type
  USING (CASE
    WHEN type::text = 'local' THEN 'local'::group_type
    WHEN type::text = 'federated' THEN 'global'::group_type
    ELSE 'national'::group_type
  END);

DROP TYPE group_type_old;

-- ============================================================================
-- Part 3: Add Group Tagging and City Group Metadata
-- ============================================================================

-- Add tags and cooperation path fields
ALTER TABLE groups ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS cooperation_path VARCHAR(100);
ALTER TABLE groups ADD COLUMN IF NOT EXISTS is_city_group BOOLEAN DEFAULT FALSE;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS moderator_count INTEGER DEFAULT 0;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES users(id);

-- Add geocoded location fields for city groups
ALTER TABLE groups ADD COLUMN IF NOT EXISTS geocoded_city VARCHAR(100);
ALTER TABLE groups ADD COLUMN IF NOT EXISTS geocoded_state VARCHAR(100);
ALTER TABLE groups ADD COLUMN IF NOT EXISTS latitude DECIMAL(9,6);
ALTER TABLE groups ADD COLUMN IF NOT EXISTS longitude DECIMAL(9,6);

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_groups_tags ON groups USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_groups_cooperation_path ON groups(cooperation_path);
CREATE INDEX IF NOT EXISTS idx_groups_is_city_group ON groups(is_city_group);
CREATE INDEX IF NOT EXISTS idx_groups_creator_id ON groups(creator_id);
CREATE INDEX IF NOT EXISTS idx_groups_geocoded_city ON groups(geocoded_city);

-- ============================================================================
-- Part 4: Group Moderators
-- ============================================================================

-- Create group_moderators join table
CREATE TABLE IF NOT EXISTS group_moderators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  granted_at TIMESTAMP DEFAULT NOW(),
  granted_by VARCHAR(50) DEFAULT 'system', -- 'system' or user_id
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_moderators_group ON group_moderators(group_id);
CREATE INDEX IF NOT EXISTS idx_group_moderators_user ON group_moderators(user_id);

-- ============================================================================
-- Part 5: Group Membership Tracking (Separate from members array)
-- ============================================================================

-- Create group_members table for better tracking
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'left')),
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_status ON group_members(group_id, status);

-- ============================================================================
-- Part 6: Extend Reward Events for Groups
-- ============================================================================

-- Add new event types to reward_events (no enum, uses VARCHAR)
-- New event types:
--   - 'group_created': Created a new group (not city group) - earns 15 SP
--   - 'group_joined': Joined an existing group (not city group) - earns 3 SP
--   - 'city_group_joined': Joined auto-created city group - earns 0 SP (no reward)

-- Note: event_type is already VARCHAR(50), so no schema change needed
-- We'll just document the new event types

-- Add new badge for group creation
INSERT INTO badges (id, name, description, icon, category, criteria) VALUES
  ('group-founder', 'Group Founder', 'Created a new cooperative group', '🏛️', 'milestone', '{"event_types": ["group_created"], "threshold": 1}'),
  ('community-builder', 'Community Builder', 'Joined 5+ groups', '🤝', 'milestone', '{"event_types": ["group_joined"], "threshold": 5}'),
  ('city-pioneer', 'City Pioneer', 'First 5 members of a city group (moderator)', '⭐', 'special', '{"event_types": ["city_group_moderator"], "threshold": 1}')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Part 7: Data Migration for Existing Groups
-- ============================================================================

-- Set cooperation_path for existing groups (default to "Community Connection")
UPDATE groups
SET cooperation_path = 'Community Connection'
WHERE cooperation_path IS NULL;

-- Migrate members JSONB array to group_members table for existing groups
-- This ensures existing groups maintain their member lists
INSERT INTO group_members (group_id, user_id, joined_at, status)
SELECT
  g.id as group_id,
  (jsonb_array_elements_text(g.members))::uuid as user_id,
  g.created_at as joined_at,
  'active' as status
FROM groups g
WHERE g.members IS NOT NULL
  AND jsonb_array_length(g.members) > 0
ON CONFLICT (group_id, user_id) DO NOTHING;

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON COLUMN users.zip_code IS 'User ZIP/postal code for geocoding';
COMMENT ON COLUMN users.geocoded_city IS 'City name from geocoding service';
COMMENT ON COLUMN users.geocoded_state IS 'State/province from geocoding';
COMMENT ON COLUMN users.geocoded_neighborhood IS 'Neighborhood/suburb from geocoding';
COMMENT ON COLUMN users.latitude IS 'Latitude coordinate (city-level precision)';
COMMENT ON COLUMN users.longitude IS 'Longitude coordinate (city-level precision)';
COMMENT ON COLUMN users.geocoded_at IS 'When geocoding was last performed';

COMMENT ON COLUMN groups.tags IS 'Custom searchable tags (0-5 tags, JSONB array)';
COMMENT ON COLUMN groups.cooperation_path IS 'Required: One of 8 Cooperation Paths (optional for city groups, defaults to "Community Connection")';
COMMENT ON COLUMN groups.is_city_group IS 'Whether this is an auto-created city group';
COMMENT ON COLUMN groups.moderator_count IS 'Number of moderators (first 5 members for city groups)';
COMMENT ON COLUMN groups.creator_id IS 'User who created the group (NULL for system-created city groups)';
COMMENT ON COLUMN groups.geocoded_city IS 'City name for city groups (from user geocoding)';
COMMENT ON COLUMN groups.geocoded_state IS 'State for city groups';

COMMENT ON TABLE group_moderators IS 'Moderators for city groups (first 5 members)';
COMMENT ON TABLE group_members IS 'Group membership tracking (replaces members JSONB array)';

COMMENT ON COLUMN group_moderators.granted_by IS 'system for auto-granted, or user_id for manually granted';
COMMENT ON COLUMN group_members.status IS 'active = current member, left = voluntarily left, inactive = removed';
