-- Migration: Add Group Resources and Events
-- Date: 2025-12-08
-- Description: Shared resource pools and group events for cooperative organizations

-- ============================================================================
-- Part 1: Group Resources (Shared Resource Pools)
-- ============================================================================

-- Resource type enum
CREATE TYPE group_resource_type AS ENUM (
  'money',      -- Financial contributions (cooperative treasury)
  'time',       -- Time contributions (timebanking)
  'equipment',  -- Shared tools/equipment
  'space',      -- Meeting rooms, venues
  'skill',      -- Professional skills/expertise
  'material'    -- Physical materials/supplies
);

-- Group resources table
CREATE TABLE IF NOT EXISTS group_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

  -- Resource details
  name VARCHAR(100) NOT NULL,
  description TEXT,
  resource_type group_resource_type NOT NULL,

  -- Quantity tracking (flexible units)
  quantity DECIMAL(12,2) DEFAULT 0,
  unit VARCHAR(50), -- e.g., 'USD', 'hours', 'units'

  -- Availability
  is_available BOOLEAN DEFAULT TRUE,
  available_from TIMESTAMP,
  available_until TIMESTAMP,

  -- Ownership/contribution
  contributed_by UUID REFERENCES users(id),
  contributed_at TIMESTAMP DEFAULT NOW(),

  -- Metadata
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Resource allocations (tracking who uses what)
CREATE TABLE IF NOT EXISTS group_resource_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES group_resources(id) ON DELETE CASCADE,

  -- Who and what
  allocated_to UUID NOT NULL REFERENCES users(id),
  quantity DECIMAL(12,2) NOT NULL,

  -- Purpose
  purpose VARCHAR(255),
  proposal_id UUID REFERENCES governance_proposals(id), -- If allocation was decided by proposal

  -- Timing
  allocated_at TIMESTAMP DEFAULT NOW(),
  return_by TIMESTAMP,
  returned_at TIMESTAMP,

  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'returned', 'consumed'))
);

-- ============================================================================
-- Part 2: Group Events
-- ============================================================================

-- Event type enum
CREATE TYPE group_event_type AS ENUM (
  'meeting',       -- Regular meetings
  'workshop',      -- Skill-sharing workshops
  'social',        -- Social gatherings
  'action',        -- Community actions
  'assembly',      -- General assemblies
  'deliberation',  -- Deliberation sessions
  'other'
);

-- Event recurrence enum
CREATE TYPE event_recurrence AS ENUM (
  'none',
  'daily',
  'weekly',
  'biweekly',
  'monthly',
  'custom'
);

-- Group events table
CREATE TABLE IF NOT EXISTS group_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

  -- Event details
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_type group_event_type NOT NULL DEFAULT 'meeting',

  -- Timing
  starts_at TIMESTAMP NOT NULL,
  ends_at TIMESTAMP,
  timezone VARCHAR(50) DEFAULT 'UTC',

  -- Recurrence
  recurrence event_recurrence DEFAULT 'none',
  recurrence_end_date DATE,

  -- Location
  location VARCHAR(255),
  is_virtual BOOLEAN DEFAULT FALSE,
  virtual_link VARCHAR(500),

  -- Organizer
  created_by UUID NOT NULL REFERENCES users(id),

  -- Capacity
  max_attendees INTEGER,

  -- Related items
  proposal_id UUID REFERENCES governance_proposals(id), -- If event discusses a proposal

  -- Metadata
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Event RSVPs
CREATE TABLE IF NOT EXISTS group_event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES group_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- RSVP status
  status VARCHAR(20) NOT NULL CHECK (status IN ('going', 'maybe', 'not_going')),

  -- Notes
  notes TEXT,

  -- Timestamps
  responded_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(event_id, user_id)
);

-- ============================================================================
-- Part 3: Indexes
-- ============================================================================

-- Resources
CREATE INDEX IF NOT EXISTS idx_group_resources_group ON group_resources(group_id);
CREATE INDEX IF NOT EXISTS idx_group_resources_type ON group_resources(resource_type);
CREATE INDEX IF NOT EXISTS idx_group_resources_available ON group_resources(is_available);
CREATE INDEX IF NOT EXISTS idx_group_resources_tags ON group_resources USING GIN(tags);

-- Resource allocations
CREATE INDEX IF NOT EXISTS idx_resource_allocations_resource ON group_resource_allocations(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_user ON group_resource_allocations(allocated_to);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_status ON group_resource_allocations(status);

-- Events
CREATE INDEX IF NOT EXISTS idx_group_events_group ON group_events(group_id);
CREATE INDEX IF NOT EXISTS idx_group_events_starts ON group_events(starts_at);
CREATE INDEX IF NOT EXISTS idx_group_events_type ON group_events(event_type);
CREATE INDEX IF NOT EXISTS idx_group_events_created_by ON group_events(created_by);

-- RSVPs
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON group_event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user ON group_event_rsvps(user_id);

-- ============================================================================
-- Part 4: Comments
-- ============================================================================

COMMENT ON TABLE group_resources IS 'Shared resource pools for cooperative groups (equipment, funds, space, skills)';
COMMENT ON TABLE group_resource_allocations IS 'Tracks who is using shared resources and when';
COMMENT ON TABLE group_events IS 'Group meetings, workshops, and community events';
COMMENT ON TABLE group_event_rsvps IS 'Event attendance tracking';

-- ============================================================================
-- Part 5: Permissions
-- ============================================================================

GRANT ALL PRIVILEGES ON TABLE group_resources TO togetheros_app;
GRANT ALL PRIVILEGES ON TABLE group_resource_allocations TO togetheros_app;
GRANT ALL PRIVILEGES ON TABLE group_events TO togetheros_app;
GRANT ALL PRIVILEGES ON TABLE group_event_rsvps TO togetheros_app;
