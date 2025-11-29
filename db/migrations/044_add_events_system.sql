-- Events & Calendar System
-- Module: events
-- Dependencies: users, groups

-- Event types enum
CREATE TYPE event_type AS ENUM (
  'deadline',
  'milestone',
  'meeting.workgroup',
  'meeting.assembly',
  'meeting.deliberation',
  'meeting.review',
  'gathering.social',
  'gathering.workshop',
  'gathering.celebration',
  'reminder.custom'
);

-- Event status enum
CREATE TYPE event_status AS ENUM (
  'scheduled',
  'in_progress',
  'completed',
  'canceled',
  'postponed'
);

-- Event location type enum
CREATE TYPE event_location_type AS ENUM (
  'virtual',
  'physical',
  'hybrid'
);

-- Event visibility enum
CREATE TYPE event_visibility AS ENUM (
  'public',
  'members_only',
  'group_only',
  'private'
);

-- RSVP status enum
CREATE TYPE rsvp_status AS ENUM (
  'going',
  'maybe',
  'not_going',
  'no_response'
);

-- Attendee role enum
CREATE TYPE attendee_role AS ENUM (
  'organizer',
  'facilitator',
  'note_taker',
  'participant'
);

-- Decision outcome enum
CREATE TYPE decision_outcome AS ENUM (
  'approved',
  'rejected',
  'deferred'
);

-- Recurrence frequency enum
CREATE TYPE recurrence_frequency AS ENUM (
  'daily',
  'weekly',
  'monthly',
  'yearly'
);

-- Main events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  type event_type NOT NULL,

  -- Scheduling
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  all_day BOOLEAN DEFAULT FALSE,

  -- Location
  location event_location_type NOT NULL DEFAULT 'virtual',
  physical_address TEXT,
  virtual_link TEXT,

  -- Ownership
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,

  -- Associations (for future integration)
  initiative_id UUID,
  proposal_id UUID,

  -- Attendance settings
  max_attendees INTEGER,
  rsvp_required BOOLEAN DEFAULT FALSE,

  -- Status
  status event_status DEFAULT 'scheduled',
  completed_at TIMESTAMPTZ,
  notes TEXT,

  -- Visibility
  visibility event_visibility DEFAULT 'members_only',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  canceled_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_title CHECK (char_length(title) >= 3),
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date),
  CONSTRAINT virtual_needs_link CHECK (
    location != 'virtual' AND location != 'hybrid' OR virtual_link IS NOT NULL
  ),
  CONSTRAINT physical_needs_address CHECK (
    location != 'physical' AND location != 'hybrid' OR physical_address IS NOT NULL
  )
);

-- Event recurrence rules (one-to-one with events)
CREATE TABLE IF NOT EXISTS events_recurrence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  frequency recurrence_frequency NOT NULL,
  interval_count INTEGER NOT NULL DEFAULT 1,
  days_of_week INTEGER[], -- [0-6] for weekly (0 = Sunday)
  day_of_month INTEGER, -- 1-31 for monthly
  end_date TIMESTAMPTZ,
  occurrences INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT one_recurrence_per_event UNIQUE (event_id),
  CONSTRAINT valid_interval CHECK (interval_count > 0),
  CONSTRAINT valid_day_of_month CHECK (day_of_month IS NULL OR (day_of_month >= 1 AND day_of_month <= 31))
);

-- Event attendees (many-to-many between events and users)
CREATE TABLE IF NOT EXISTS events_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rsvp_status rsvp_status DEFAULT 'no_response',
  attended BOOLEAN DEFAULT FALSE,
  role attendee_role DEFAULT 'participant',
  rsvp_at TIMESTAMPTZ,
  attended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_attendee_per_event UNIQUE (event_id, member_id)
);

-- Meeting notes table
CREATE TABLE IF NOT EXISTS events_meeting_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  taken_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_content CHECK (char_length(content) >= 10)
);

-- Meeting decisions (associated with notes)
CREATE TABLE IF NOT EXISTS events_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notes_id UUID NOT NULL REFERENCES events_meeting_notes(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  voted_by UUID[] DEFAULT '{}',
  outcome decision_outcome NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_summary CHECK (char_length(summary) >= 3)
);

-- Action items from meetings
CREATE TABLE IF NOT EXISTS events_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notes_id UUID NOT NULL REFERENCES events_meeting_notes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  assigned_to UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_description CHECK (char_length(description) >= 3)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_creator ON events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_group ON events(group_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_visibility ON events(visibility);
CREATE INDEX IF NOT EXISTS idx_events_attendees_event ON events_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_events_attendees_member ON events_attendees(member_id);
CREATE INDEX IF NOT EXISTS idx_events_meeting_notes_event ON events_meeting_notes(event_id);
CREATE INDEX IF NOT EXISTS idx_events_action_items_assigned ON events_action_items(assigned_to);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();

CREATE TRIGGER events_attendees_updated_at
  BEFORE UPDATE ON events_attendees
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();

CREATE TRIGGER events_meeting_notes_updated_at
  BEFORE UPDATE ON events_meeting_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();

CREATE TRIGGER events_action_items_updated_at
  BEFORE UPDATE ON events_action_items
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();
