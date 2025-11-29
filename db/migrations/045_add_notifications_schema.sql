-- Migration 045: Add notifications schema
-- Notifications & Inbox module - database persistence

-- Notification type enum
DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'mention',
    'proposal_update',
    'discussion_reply',
    'group_update',
    'system_message',
    'support_points',
    'badge_earned',
    'reaction'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Notification status enum
DO $$ BEGIN
  CREATE TYPE notification_status AS ENUM (
    'unread',
    'read',
    'archived'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Notification priority enum
DO $$ BEGIN
  CREATE TYPE notification_priority AS ENUM (
    'normal',
    'high'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Email digest frequency enum
DO $$ BEGIN
  CREATE TYPE email_digest_frequency AS ENUM (
    'realtime',
    'daily',
    'weekly',
    'disabled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Main notifications table (module prefix per convention)
CREATE TABLE IF NOT EXISTS notifications_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  icon VARCHAR(10),
  priority notification_priority NOT NULL DEFAULT 'normal',
  status notification_status NOT NULL DEFAULT 'unread',

  -- Reference to source entity
  reference_type VARCHAR(50),
  reference_id UUID,
  reference_url VARCHAR(500),

  -- Who triggered the notification (optional)
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Additional metadata as JSONB
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_reference CHECK (
    (reference_type IS NULL AND reference_id IS NULL) OR
    (reference_type IS NOT NULL AND reference_id IS NOT NULL)
  )
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications_notifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications_notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications_notifications(user_id) WHERE status = 'unread';
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications_notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_actor ON notifications_notifications(actor_id) WHERE actor_id IS NOT NULL;

-- User notification preferences table
CREATE TABLE IF NOT EXISTS notifications_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Enable/disable by type
  enable_mention BOOLEAN NOT NULL DEFAULT TRUE,
  enable_proposal_update BOOLEAN NOT NULL DEFAULT TRUE,
  enable_discussion_reply BOOLEAN NOT NULL DEFAULT TRUE,
  enable_group_update BOOLEAN NOT NULL DEFAULT TRUE,
  enable_system_message BOOLEAN NOT NULL DEFAULT TRUE,
  enable_support_points BOOLEAN NOT NULL DEFAULT TRUE,
  enable_badge_earned BOOLEAN NOT NULL DEFAULT TRUE,
  enable_reaction BOOLEAN NOT NULL DEFAULT TRUE,

  -- Delivery preferences
  email_digest email_digest_frequency NOT NULL DEFAULT 'daily',
  push_enabled BOOLEAN NOT NULL DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for preferences lookups
CREATE INDEX IF NOT EXISTS idx_notifications_prefs_email ON notifications_preferences(email_digest) WHERE email_digest != 'disabled';

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_notifications_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for preferences updated_at
DROP TRIGGER IF EXISTS trigger_notifications_preferences_updated ON notifications_preferences;
CREATE TRIGGER trigger_notifications_preferences_updated
  BEFORE UPDATE ON notifications_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_preferences_timestamp();

-- Comments for documentation
COMMENT ON TABLE notifications_notifications IS 'User notifications for various platform events';
COMMENT ON TABLE notifications_preferences IS 'User preferences for notification delivery';
COMMENT ON COLUMN notifications_notifications.reference_type IS 'Type: post, proposal, discussion, group, user, badge';
COMMENT ON COLUMN notifications_notifications.metadata IS 'Additional context stored as JSON';
