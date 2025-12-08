-- Migration: Add Group Roles Schema
-- Date: 2025-12-08
-- Description: Creates group_roles table for role management with rotation and accountability

-- ============================================================================
-- Part 1: Create group_roles table
-- ============================================================================

CREATE TABLE IF NOT EXISTS group_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'coordinator', 'member')),
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- Optional term limit
  granted_by UUID NOT NULL REFERENCES users(id),
  recallable BOOLEAN DEFAULT TRUE,

  -- Ensure a member can only have one instance of each role in a group
  UNIQUE(group_id, member_id, role)
);

-- ============================================================================
-- Part 2: Indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_group_roles_group ON group_roles(group_id);
CREATE INDEX IF NOT EXISTS idx_group_roles_member ON group_roles(member_id);
CREATE INDEX IF NOT EXISTS idx_group_roles_role ON group_roles(role);
CREATE INDEX IF NOT EXISTS idx_group_roles_expires ON group_roles(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- Part 3: Comments for documentation
-- ============================================================================

COMMENT ON TABLE group_roles IS 'Role assignments within groups, supporting rotation and recall';
COMMENT ON COLUMN group_roles.role IS 'Role type: admin (full control), coordinator (manage content), member (participate)';
COMMENT ON COLUMN group_roles.expires_at IS 'Optional expiration for term-limited roles (rotation support)';
COMMENT ON COLUMN group_roles.granted_by IS 'User who assigned this role (accountability)';
COMMENT ON COLUMN group_roles.recallable IS 'Whether group can vote to recall this role';

-- ============================================================================
-- Part 4: Grant permissions
-- ============================================================================

GRANT ALL PRIVILEGES ON TABLE group_roles TO togetheros_app;
