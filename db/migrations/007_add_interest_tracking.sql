-- User Interest Tracking Schema
-- Tracks user engagement patterns for personalized recommendations

CREATE TABLE IF NOT EXISTS user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(100) NOT NULL,
  engagement_count INTEGER DEFAULT 0,
  last_engaged TIMESTAMP DEFAULT NOW(),
  interest_score DECIMAL(3,2) DEFAULT 0 CHECK (interest_score >= 0 AND interest_score <= 1),
  trend VARCHAR(20) DEFAULT 'stable' CHECK (trend IN ('rising', 'stable', 'declining')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, topic)
);

-- Indexes
CREATE INDEX idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX idx_user_interests_topic ON user_interests(topic);
CREATE INDEX idx_user_interests_score ON user_interests(user_id, interest_score DESC);

-- Engagement events log (for calculating interest over time)
CREATE TABLE IF NOT EXISTS interest_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(100) NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- 'post', 'reaction', 'rating', 'evidence', 'comment'
  event_weight DECIMAL(3,2) DEFAULT 1.0, -- Different event types have different weights
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for event tracking
CREATE INDEX idx_interest_events_user_id ON interest_events(user_id);
CREATE INDEX idx_interest_events_topic ON interest_events(topic);
CREATE INDEX idx_interest_events_created_at ON interest_events(created_at);

-- Function to update user interests based on activity
CREATE OR REPLACE FUNCTION update_user_interest(
  p_user_id UUID,
  p_topic VARCHAR,
  p_event_type VARCHAR
)
RETURNS void AS $$
DECLARE
  event_weight DECIMAL;
  current_score DECIMAL;
  current_count INTEGER;
  last_event TIMESTAMP;
  days_since_last INTEGER;
  new_score DECIMAL;
  trend_direction VARCHAR;
BEGIN
  -- Determine event weight
  event_weight := CASE p_event_type
    WHEN 'post' THEN 1.0
    WHEN 'rating' THEN 0.8
    WHEN 'evidence' THEN 0.8
    WHEN 'comment' THEN 0.6
    WHEN 'reaction' THEN 0.3
    ELSE 0.5
  END;

  -- Log the event
  INSERT INTO interest_events (user_id, topic, event_type, event_weight)
  VALUES (p_user_id, p_topic, p_event_type, event_weight);

  -- Get current interest data
  SELECT interest_score, engagement_count, last_engaged
  INTO current_score, current_count, last_event
  FROM user_interests
  WHERE user_id = p_user_id AND topic = p_topic;

  IF NOT FOUND THEN
    -- First interaction with this topic
    INSERT INTO user_interests (user_id, topic, engagement_count, interest_score, last_engaged, trend)
    VALUES (p_user_id, p_topic, 1, LEAST(event_weight, 1.0), NOW(), 'rising');
    RETURN;
  END IF;

  -- Calculate days since last engagement
  days_since_last := EXTRACT(DAY FROM NOW() - last_event);

  -- Calculate new interest score (decay over time, boost from new activity)
  -- Score decays 10% per week of inactivity, increases with new events
  new_score := current_score * POWER(0.9, days_since_last / 7.0) + (event_weight * 0.1);
  new_score := LEAST(new_score, 1.0); -- Cap at 1.0

  -- Determine trend
  IF new_score > current_score * 1.1 THEN
    trend_direction := 'rising';
  ELSIF new_score < current_score * 0.9 THEN
    trend_direction := 'declining';
  ELSE
    trend_direction := 'stable';
  END IF;

  -- Update interest record
  UPDATE user_interests
  SET
    engagement_count = current_count + 1,
    last_engaged = NOW(),
    interest_score = new_score,
    trend = trend_direction,
    updated_at = NOW()
  WHERE user_id = p_user_id AND topic = p_topic;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old interest events (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_interest_events()
RETURNS void AS $$
BEGIN
  DELETE FROM interest_events
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Scheduled cleanup (can be called by cron job)
-- Example: SELECT cleanup_old_interest_events();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_interests_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER interests_updated_at
BEFORE UPDATE ON user_interests
FOR EACH ROW
EXECUTE FUNCTION update_interests_timestamp();
