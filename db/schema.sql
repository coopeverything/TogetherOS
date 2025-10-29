-- TogetherOS Database Schema
-- Progressive user profiling: start minimal, grow during onboarding

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Required (minimal intake)
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,

  -- Basic profile (collected during onboarding)
  name VARCHAR(255),
  username VARCHAR(50) UNIQUE,
  bio TEXT,
  avatar_url TEXT,

  -- Location (optional)
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  timezone VARCHAR(50),

  -- Cooperation paths (JSON array of path IDs user is interested in)
  -- Paths: education, economy, wellbeing, technology, governance, community, media, planet
  paths JSONB DEFAULT '[]'::jsonb,

  -- Skills & offers (collected progressively)
  skills TEXT[], -- Array of skill tags
  can_offer TEXT, -- What they can contribute
  seeking_help TEXT, -- What they need

  -- Onboarding progress
  onboarding_step VARCHAR(50) DEFAULT 'welcome', -- welcome, paths, profile, skills, complete
  onboarding_completed_at TIMESTAMP,

  -- Authentication
  password_hash TEXT, -- For email/password auth

  -- OAuth provider IDs (for social login)
  google_id VARCHAR(255) UNIQUE,
  facebook_id VARCHAR(255) UNIQUE,
  bluesky_handle VARCHAR(255) UNIQUE,
  mastodon_handle VARCHAR(255) UNIQUE,
  instagram_id VARCHAR(255) UNIQUE,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP,

  -- Soft delete
  deleted_at TIMESTAMP
);

-- Sessions table (for auth)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- User activity log (for dashboard stats)
CREATE TABLE user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- login, profile_update, path_selected, etc.
  metadata JSONB, -- Extra context about the action
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_paths ON users USING GIN(paths);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_created_at ON user_activity(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO togetheros_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO togetheros_app;
