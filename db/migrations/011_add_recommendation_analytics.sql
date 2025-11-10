-- Recommendation Analytics Migration
-- Tracks performance metrics for recommendations

CREATE TABLE IF NOT EXISTS recommendation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recommendation reference
  recommendation_id UUID NOT NULL REFERENCES bridge_recommendations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Event tracking
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('impression', 'click', 'action', 'dismiss')),

  -- Context
  source VARCHAR(50), -- 'feed', 'dashboard', 'email', 'notification'
  device_type VARCHAR(20), -- 'mobile', 'tablet', 'desktop'

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for analytics queries
CREATE INDEX idx_metrics_recommendation ON recommendation_metrics(recommendation_id);
CREATE INDEX idx_metrics_user ON recommendation_metrics(user_id);
CREATE INDEX idx_metrics_event_type ON recommendation_metrics(event_type);
CREATE INDEX idx_metrics_created_at ON recommendation_metrics(created_at DESC);
CREATE INDEX idx_metrics_recommendation_event ON recommendation_metrics(recommendation_id, event_type);

-- Materialized view for recommendation performance
CREATE MATERIALIZED VIEW recommendation_performance AS
SELECT
  r.id as recommendation_id,
  r.type,
  r.relevance_score,
  r.urgency,
  r.created_at,

  -- Metrics
  COUNT(DISTINCT CASE WHEN m.event_type = 'impression' THEN m.id END) as impressions,
  COUNT(DISTINCT CASE WHEN m.event_type = 'click' THEN m.id END) as clicks,
  COUNT(DISTINCT CASE WHEN m.event_type = 'action' THEN m.id END) as actions,
  COUNT(DISTINCT CASE WHEN m.event_type = 'dismiss' THEN m.id END) as dismissals,

  -- Rates
  CASE
    WHEN COUNT(DISTINCT CASE WHEN m.event_type = 'impression' THEN m.id END) > 0
    THEN (COUNT(DISTINCT CASE WHEN m.event_type = 'click' THEN m.id END)::FLOAT /
          COUNT(DISTINCT CASE WHEN m.event_type = 'impression' THEN m.id END)::FLOAT) * 100
    ELSE 0
  END as click_through_rate,

  CASE
    WHEN COUNT(DISTINCT CASE WHEN m.event_type = 'click' THEN m.id END) > 0
    THEN (COUNT(DISTINCT CASE WHEN m.event_type = 'action' THEN m.id END)::FLOAT /
          COUNT(DISTINCT CASE WHEN m.event_type = 'click' THEN m.id END)::FLOAT) * 100
    ELSE 0
  END as conversion_rate

FROM bridge_recommendations r
LEFT JOIN recommendation_metrics m ON r.id = m.recommendation_id
GROUP BY r.id, r.type, r.relevance_score, r.urgency, r.created_at;

-- Index on materialized view
CREATE INDEX idx_perf_type ON recommendation_performance(type);
CREATE INDEX idx_perf_ctr ON recommendation_performance(click_through_rate DESC);
CREATE INDEX idx_perf_conversion ON recommendation_performance(conversion_rate DESC);

-- Function to refresh performance view
-- SECURITY DEFINER allows togetheros_app to refresh the view
CREATE OR REPLACE FUNCTION refresh_recommendation_performance()
RETURNS void
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW recommendation_performance;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL PRIVILEGES ON recommendation_metrics TO togetheros_app;
GRANT SELECT ON recommendation_performance TO togetheros_app;
