-- Migration: Add Groups Schema
-- Date: 2025-01-05
-- Description: Creates groups table for cooperative organizations

-- Create group_type enum
CREATE TYPE group_type AS ENUM ('local', 'federated');

-- Create groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core fields
  name VARCHAR(255) NOT NULL,
  handle VARCHAR(100) UNIQUE NOT NULL,
  type group_type NOT NULL DEFAULT 'local',

  -- Optional fields
  description TEXT,
  location VARCHAR(255),

  -- Members (array of user IDs)
  -- Using JSONB for flexibility and alignment with entity model
  members JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Soft delete
  deleted_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_groups_handle ON groups(handle);
CREATE INDEX idx_groups_type ON groups(type);
CREATE INDEX idx_groups_location ON groups(location);
CREATE INDEX idx_groups_created_at ON groups(created_at);
CREATE INDEX idx_groups_members ON groups USING GIN(members);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_groups_updated_at();

-- Comments for documentation
COMMENT ON TABLE groups IS 'Cooperative organizations (local or federated)';
COMMENT ON COLUMN groups.handle IS 'Unique identifier for group, used in URLs and federation (e.g., @handle@domain.tld)';
COMMENT ON COLUMN groups.type IS 'Group type: local (single location) or federated (multi-location network)';
COMMENT ON COLUMN groups.members IS 'Array of user IDs who are members of this group (JSONB for flexibility)';
COMMENT ON COLUMN groups.location IS 'Primary location for local groups (city, region, etc.)';

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE groups TO togetheros_app;
