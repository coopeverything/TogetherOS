-- Feed Evidence Repository Schema
-- Stores evidence links attached to thread posts with viewpoint tagging

CREATE TABLE IF NOT EXISTS evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL, -- References thread_posts when that table exists
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  viewpoint VARCHAR(20) NOT NULL CHECK (viewpoint IN ('support', 'oppose', 'neutral')),
  description TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_evidence_post_id ON evidence(post_id);
CREATE INDEX idx_evidence_user_id ON evidence(user_id);
CREATE INDEX idx_evidence_viewpoint ON evidence(post_id, viewpoint);
CREATE INDEX idx_evidence_verified ON evidence(verified);

-- Evidence statistics per post
CREATE MATERIALIZED VIEW evidence_stats AS
SELECT
  post_id,
  COUNT(*) AS total_evidence,
  COUNT(*) FILTER (WHERE viewpoint = 'support') AS support_count,
  COUNT(*) FILTER (WHERE viewpoint = 'oppose') AS oppose_count,
  COUNT(*) FILTER (WHERE viewpoint = 'neutral') AS neutral_count,
  COUNT(*) FILTER (WHERE verified = TRUE) AS verified_count
FROM evidence
GROUP BY post_id;

CREATE UNIQUE INDEX idx_evidence_stats_post_id ON evidence_stats(post_id);

-- Function to refresh evidence stats
CREATE OR REPLACE FUNCTION refresh_evidence_stats()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY evidence_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to refresh stats
CREATE TRIGGER refresh_evidence_after_change
AFTER INSERT OR UPDATE OR DELETE ON evidence
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_evidence_stats();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_evidence_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER evidence_updated_at
BEFORE UPDATE ON evidence
FOR EACH ROW
EXECUTE FUNCTION update_evidence_timestamp();
