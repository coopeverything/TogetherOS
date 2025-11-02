-- Feed Ratings & Reputation Schema
-- Multi-dimensional rating system for thread posts and user reputation

-- Post ratings table
CREATE TABLE IF NOT EXISTS post_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL, -- References thread_posts when that table exists
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  language_score INTEGER NOT NULL CHECK (language_score >= 1 AND language_score <= 5),
  originality_score INTEGER NOT NULL CHECK (originality_score >= 1 AND originality_score <= 5),
  tone_score INTEGER NOT NULL CHECK (tone_score >= 1 AND tone_score <= 5),
  argument_score INTEGER NOT NULL CHECK (argument_score >= 1 AND argument_score <= 5),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id) -- One rating per user per post
);

-- Indexes
CREATE INDEX idx_post_ratings_post_id ON post_ratings(post_id);
CREATE INDEX idx_post_ratings_user_id ON post_ratings(user_id);

-- Aggregate ratings view (for performance)
CREATE MATERIALIZED VIEW post_rating_aggregates AS
SELECT
  post_id,
  COUNT(*) AS rating_count,
  ROUND(AVG(language_score), 1) AS avg_language,
  ROUND(AVG(originality_score), 1) AS avg_originality,
  ROUND(AVG(tone_score), 1) AS avg_tone,
  ROUND(AVG(argument_score), 1) AS avg_argument,
  ROUND((AVG(language_score) + AVG(originality_score) + AVG(tone_score) + AVG(argument_score)) / 4, 1) AS avg_overall
FROM post_ratings
GROUP BY post_id;

CREATE UNIQUE INDEX idx_rating_agg_post_id ON post_rating_aggregates(post_id);

-- User reputation table
CREATE TABLE IF NOT EXISTS user_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  total_posts INTEGER DEFAULT 0,
  total_ratings_received INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,1) DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb, -- Array of badge objects
  reputation_score INTEGER DEFAULT 0, -- Calculated score
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_reputation_user_id ON user_reputation(user_id);
CREATE INDEX idx_user_reputation_score ON user_reputation(reputation_score DESC);

-- Badge types (stored as JSONB in badges array):
-- {
--   "type": "ClearCommunicator" | "NovelThinker" | "RespectfulDebater" |
--           "LogicalAnalyst" | "EvidenceBased" | "AllAround",
--   "level": "Bronze" | "Silver" | "Gold",
--   "awarded_at": "2025-01-01T00:00:00Z"
-- }

-- Function to update user reputation after rating
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS TRIGGER AS $$
DECLARE
  author_id UUID;
  new_avg DECIMAL(3,1);
  new_count INTEGER;
BEGIN
  -- Get the author of the rated post
  -- TODO: Replace with actual post lookup when thread_posts table exists
  -- For now, this is a placeholder

  -- Calculate new average and count
  SELECT
    COUNT(*),
    ROUND((AVG(language_score) + AVG(originality_score) + AVG(tone_score) + AVG(argument_score)) / 4, 1)
  INTO new_count, new_avg
  FROM post_ratings
  WHERE post_id = NEW.post_id;

  -- Update reputation (using post_id as placeholder for author_id)
  -- TODO: Fix when thread_posts table exists

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update reputation on new rating
CREATE TRIGGER update_reputation_on_rating
AFTER INSERT ON post_ratings
FOR EACH ROW
EXECUTE FUNCTION update_user_reputation();

-- Function to refresh aggregate ratings
CREATE OR REPLACE FUNCTION refresh_rating_aggregates()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY post_rating_aggregates;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to refresh aggregates
CREATE TRIGGER refresh_ratings_after_change
AFTER INSERT OR UPDATE OR DELETE ON post_ratings
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_rating_aggregates();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_rating_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rating_updated_at
BEFORE UPDATE ON post_ratings
FOR EACH ROW
EXECUTE FUNCTION update_rating_timestamp();

CREATE TRIGGER reputation_updated_at
BEFORE UPDATE ON user_reputation
FOR EACH ROW
EXECUTE FUNCTION update_rating_timestamp();
