-- Bridge Recommendations Migration
-- Stores personalized recommendations for users based on context

-- Create trigger function to auto-update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE bridge_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User relationship
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Recommendation type
  type VARCHAR(50) NOT NULL, -- 'local_group', 'event', 'discussion', 'activity', 'thematic_group', 'social_share'

  -- Content
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,

  -- Target resource (what the recommendation points to)
  target_id VARCHAR(255), -- ID of the resource (group ID, event ID, post ID, etc.)
  target_url TEXT, -- URL to the resource

  -- Targeting
  matched_interests TEXT[], -- Interests that matched (e.g., ['housing', 'climate'])
  city_context VARCHAR(100), -- City where recommendation is relevant

  -- Scoring
  relevance_score INTEGER NOT NULL CHECK (relevance_score >= 0 AND relevance_score <= 100),
  urgency VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'

  -- State management
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'shown', 'acted_on', 'dismissed'
  nudge_count INTEGER NOT NULL DEFAULT 0,
  max_nudges INTEGER NOT NULL DEFAULT 2,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  shown_at TIMESTAMP,
  acted_on_at TIMESTAMP,
  dismissed_at TIMESTAMP,

  -- Optional metadata
  metadata JSONB, -- Extra data (e.g., event dates, group IDs, reward points)

  -- Indexes for common queries
  CONSTRAINT valid_status CHECK (status IN ('pending', 'shown', 'acted_on', 'dismissed'))
);

-- Indexes for performance
CREATE INDEX idx_recommendations_user_id ON bridge_recommendations(user_id);
CREATE INDEX idx_recommendations_status ON bridge_recommendations(status);
CREATE INDEX idx_recommendations_type ON bridge_recommendations(type);
CREATE INDEX idx_recommendations_created_at ON bridge_recommendations(created_at);
CREATE INDEX idx_recommendations_relevance_score ON bridge_recommendations(relevance_score DESC);

-- Composite index for common query pattern: get pending recommendations for user by relevance
CREATE INDEX idx_recommendations_user_status_score ON bridge_recommendations(user_id, status, relevance_score DESC);

-- GIN index for array searches on matched_interests
CREATE INDEX idx_recommendations_interests ON bridge_recommendations USING GIN(matched_interests);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_recommendations_updated_at
  BEFORE UPDATE ON bridge_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON bridge_recommendations TO togetheros_app;
