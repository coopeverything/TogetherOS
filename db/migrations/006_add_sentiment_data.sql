-- Feed Sentiment Tracking Schema
-- Stores aggregated sentiment data over time for visualization

CREATE TABLE IF NOT EXISTS topic_sentiment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic VARCHAR(100) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  consensus_score DECIMAL(3,2) NOT NULL CHECK (consensus_score >= 0 AND consensus_score <= 1),
  avg_sentiment DECIMAL(3,2) NOT NULL CHECK (avg_sentiment >= -1 AND avg_sentiment <= 1),
  engagement_level INTEGER NOT NULL DEFAULT 0,
  action_readiness DECIMAL(3,2) DEFAULT 0 CHECK (action_readiness >= 0 AND action_readiness <= 1),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(topic, date)
);

-- Indexes
CREATE INDEX idx_topic_sentiment_topic ON topic_sentiment(topic);
CREATE INDEX idx_topic_sentiment_date ON topic_sentiment(date);
CREATE INDEX idx_topic_sentiment_action_readiness ON topic_sentiment(action_readiness);

-- Current sentiment view (latest for each topic)
CREATE MATERIALIZED VIEW current_topic_sentiment AS
SELECT DISTINCT ON (topic)
  topic,
  consensus_score,
  avg_sentiment,
  engagement_level,
  action_readiness,
  date AS last_updated
FROM topic_sentiment
ORDER BY topic, date DESC;

CREATE UNIQUE INDEX idx_current_sentiment_topic ON current_topic_sentiment(topic);

-- Function to calculate sentiment from reactions and ratings
CREATE OR REPLACE FUNCTION calculate_topic_sentiment(topic_name VARCHAR)
RETURNS TABLE(
  consensus_score DECIMAL,
  avg_sentiment DECIMAL,
  engagement_level INTEGER,
  action_readiness DECIMAL
) AS $$
DECLARE
  total_reactions INTEGER;
  positive_reactions INTEGER;
  negative_reactions INTEGER;
  neutral_reactions INTEGER;
  total_ratings INTEGER;
  avg_rating_score DECIMAL;
  variance DECIMAL;
  consensus DECIMAL;
  sentiment DECIMAL;
  engagement INTEGER;
  readiness DECIMAL;
BEGIN
  -- Count reactions by type (assuming reactions table exists or will exist)
  -- For now, use placeholder logic
  SELECT
    COALESCE(COUNT(*), 0),
    COALESCE(COUNT(*) FILTER (WHERE reaction_type IN ('like', 'love', 'celebrate')), 0),
    COALESCE(COUNT(*) FILTER (WHERE reaction_type IN ('dislike', 'angry')), 0),
    COALESCE(COUNT(*) FILTER (WHERE reaction_type IN ('thinking', 'curious')), 0)
  INTO total_reactions, positive_reactions, negative_reactions, neutral_reactions
  FROM reactions r
  JOIN posts p ON r.post_id = p.id
  WHERE p.topic = topic_name
    AND r.created_at > NOW() - INTERVAL '7 days';

  -- Get rating statistics
  SELECT
    COALESCE(COUNT(*), 0),
    COALESCE(AVG((language_score + originality_score + tone_score + argument_score) / 4.0), 0),
    COALESCE(VARIANCE((language_score + originality_score + tone_score + argument_score) / 4.0), 0)
  INTO total_ratings, avg_rating_score, variance
  FROM post_ratings pr
  JOIN posts p ON pr.post_id = p.id
  WHERE p.topic = topic_name
    AND pr.created_at > NOW() - INTERVAL '7 days';

  -- Calculate consensus (inverse of variance, normalized)
  -- Low variance = high consensus
  IF variance IS NULL OR variance = 0 THEN
    consensus := 1.0;
  ELSE
    consensus := GREATEST(0, 1.0 - (variance / 5.0)); -- Normalize assuming max variance ~5
  END IF;

  -- Calculate sentiment (-1 to +1)
  IF total_reactions > 0 THEN
    sentiment := (positive_reactions::DECIMAL - negative_reactions::DECIMAL) / total_reactions::DECIMAL;
  ELSE
    sentiment := 0;
  END IF;

  -- Engagement = total interactions
  engagement := total_reactions + total_ratings;

  -- Action readiness (high consensus + high engagement + positive sentiment)
  readiness := 0;
  IF engagement > 20 THEN -- Minimum threshold
    readiness := (
      consensus * 0.4 +
      LEAST(engagement::DECIMAL / 100.0, 1.0) * 0.3 +
      ((sentiment + 1) / 2.0) * 0.3 -- Normalize sentiment to 0-1
    );
  END IF;

  RETURN QUERY SELECT consensus, sentiment, engagement, readiness;
END;
$$ LANGUAGE plpgsql;

-- Function to update daily sentiment snapshots
CREATE OR REPLACE FUNCTION update_topic_sentiment_snapshot()
RETURNS void AS $$
DECLARE
  topic_record RECORD;
  sentiment_data RECORD;
BEGIN
  -- Get all active topics (with recent activity)
  FOR topic_record IN
    SELECT DISTINCT topic
    FROM posts
    WHERE created_at > NOW() - INTERVAL '30 days'
  LOOP
    -- Calculate sentiment for this topic
    SELECT * INTO sentiment_data
    FROM calculate_topic_sentiment(topic_record.topic);

    -- Insert or update today's snapshot
    INSERT INTO topic_sentiment (
      topic,
      date,
      consensus_score,
      avg_sentiment,
      engagement_level,
      action_readiness
    )
    VALUES (
      topic_record.topic,
      CURRENT_DATE,
      sentiment_data.consensus_score,
      sentiment_data.avg_sentiment,
      sentiment_data.engagement_level,
      sentiment_data.action_readiness
    )
    ON CONFLICT (topic, date)
    DO UPDATE SET
      consensus_score = sentiment_data.consensus_score,
      avg_sentiment = sentiment_data.avg_sentiment,
      engagement_level = sentiment_data.engagement_level,
      action_readiness = sentiment_data.action_readiness,
      updated_at = NOW();
  END LOOP;

  -- Refresh materialized view
  REFRESH MATERIALIZED VIEW CONCURRENTLY current_topic_sentiment;
END;
$$ LANGUAGE plpgsql;

-- Trigger to refresh current sentiment view
CREATE OR REPLACE FUNCTION refresh_current_sentiment()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY current_topic_sentiment;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_sentiment_after_update
AFTER INSERT OR UPDATE ON topic_sentiment
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_current_sentiment();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_sentiment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sentiment_updated_at
BEFORE UPDATE ON topic_sentiment
FOR EACH ROW
EXECUTE FUNCTION update_sentiment_timestamp();
