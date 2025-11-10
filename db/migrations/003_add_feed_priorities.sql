-- Feed Priorities Schema
-- Stores user topic priorities and community aggregate statistics

-- User priorities table
CREATE TABLE IF NOT EXISTS priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(100) NOT NULL,
  rank INTEGER NOT NULL CHECK (rank >= 1 AND rank <= 10),
  care_weight INTEGER DEFAULT 5 CHECK (care_weight >= 1 AND care_weight <= 10),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, topic)
);

-- Indexes for efficient queries
CREATE INDEX idx_priorities_user_id ON priorities(user_id);
CREATE INDEX idx_priorities_topic ON priorities(topic);
CREATE INDEX idx_priorities_rank ON priorities(user_id, rank);

-- Community priority statistics (materialized view for performance)
CREATE MATERIALIZED VIEW community_priority_stats AS
SELECT
  topic,
  COUNT(DISTINCT user_id) AS member_count,
  ROUND(COUNT(DISTINCT user_id) * 100.0 / NULLIF((SELECT COUNT(DISTINCT user_id) FROM priorities), 0), 1) AS percentage,
  AVG(care_weight) AS avg_care_weight,
  NOW() AS calculated_at
FROM priorities
GROUP BY topic
HAVING COUNT(DISTINCT user_id) >= 20;  -- Privacy threshold: only show if 20+ users

-- Index for materialized view
CREATE UNIQUE INDEX idx_community_stats_topic ON community_priority_stats(topic);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_community_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY community_priority_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-refresh stats (debounced via AFTER statement)
CREATE TRIGGER refresh_stats_after_priority_change
AFTER INSERT OR UPDATE OR DELETE ON priorities
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_community_stats();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_priority_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER priority_updated_at
BEFORE UPDATE ON priorities
FOR EACH ROW
EXECUTE FUNCTION update_priority_timestamp();
