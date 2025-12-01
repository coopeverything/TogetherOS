-- Migration: 046_add_bridge_teaching_sessions.sql
-- Description: Add tables for Bridge Teaching Session feature
-- This enables trainers to teach Bridge through interactive role-play

-- ============================================================================
-- TEACHING SESSIONS
-- Main session table tracking Demo/Practice/Discussion loops
-- ============================================================================

CREATE TABLE IF NOT EXISTS bridge_teaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic VARCHAR(100) NOT NULL,
  archetype_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'archived')),
  total_demo_turns INT NOT NULL DEFAULT 0,
  total_practice_turns INT NOT NULL DEFAULT 0,
  practice_success_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Index for listing sessions by trainer
CREATE INDEX idx_bridge_teaching_sessions_trainer
  ON bridge_teaching_sessions(trainer_id, created_at DESC);

-- Index for filtering by status
CREATE INDEX idx_bridge_teaching_sessions_status
  ON bridge_teaching_sessions(status) WHERE status = 'active';

-- ============================================================================
-- CONVERSATION TURNS
-- Individual messages within a teaching session
-- ============================================================================

CREATE TABLE IF NOT EXISTS bridge_teaching_turns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES bridge_teaching_sessions(id) ON DELETE CASCADE,
  mode VARCHAR(20) NOT NULL
    CHECK (mode IN ('demo', 'practice', 'discussion')),
  speaker VARCHAR(20) NOT NULL
    CHECK (speaker IN ('trainer', 'bridge')),
  role VARCHAR(100), -- "as Skeptic", "demonstrating", "practicing"
  message TEXT NOT NULL,

  -- Feedback for practice mode
  feedback_rating VARCHAR(20)
    CHECK (feedback_rating IS NULL OR feedback_rating IN ('positive', 'negative', 'neutral')),
  feedback_comment TEXT,
  retry_requested BOOLEAN NOT NULL DEFAULT FALSE,

  -- Trainer explanation for demo mode
  explanation TEXT,

  -- Debate/challenge tracking
  is_debate BOOLEAN NOT NULL DEFAULT FALSE,
  debate_type VARCHAR(20)
    CHECK (debate_type IS NULL OR debate_type IN ('counter', 'challenge', 'question', 'alternative')),
  debate_resolved BOOLEAN,

  turn_order INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fetching turns by session in order
CREATE INDEX idx_bridge_teaching_turns_session_order
  ON bridge_teaching_turns(session_id, turn_order);

-- ============================================================================
-- LEARNED PATTERNS
-- Extracted response patterns from teaching sessions
-- ============================================================================

CREATE TABLE IF NOT EXISTS bridge_learned_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES bridge_teaching_sessions(id) ON DELETE SET NULL,

  -- Pattern trigger conditions
  archetype VARCHAR(50) NOT NULL,
  sentiment_markers TEXT[] NOT NULL DEFAULT '{}',
  topic_context TEXT[] NOT NULL DEFAULT '{}',

  -- The learning
  principle TEXT NOT NULL,
  response_guidelines JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: {openWith, tone, includeElements[], avoidElements[], nudgeToward}

  examples JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Structure: [{userMessage, goodResponse, explanation}]

  -- Confidence and usage tracking
  confidence DECIMAL(3,2) NOT NULL DEFAULT 0.50
    CHECK (confidence >= 0 AND confidence <= 1),
  usage_count INT NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Lifecycle
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  refined_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id)
);

-- Index for pattern matching queries
CREATE INDEX idx_bridge_learned_patterns_archetype
  ON bridge_learned_patterns(archetype) WHERE is_active = TRUE;

-- GIN index for sentiment marker searching
CREATE INDEX idx_bridge_learned_patterns_markers
  ON bridge_learned_patterns USING GIN (sentiment_markers);

-- Index for topic context
CREATE INDEX idx_bridge_learned_patterns_topics
  ON bridge_learned_patterns USING GIN (topic_context);

-- ============================================================================
-- PATTERN USAGE LOG
-- Track when patterns are applied in real Q&A
-- ============================================================================

CREATE TABLE IF NOT EXISTS bridge_pattern_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID NOT NULL REFERENCES bridge_learned_patterns(id) ON DELETE CASCADE,
  conversation_id VARCHAR(100), -- Links to Bridge Q&A conversation
  user_message TEXT NOT NULL,
  bridge_response TEXT NOT NULL,
  match_confidence DECIMAL(3,2) NOT NULL,
  user_rating INT CHECK (user_rating IS NULL OR (user_rating >= 1 AND user_rating <= 5)),
  was_helpful BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for analyzing pattern effectiveness
CREATE INDEX idx_bridge_pattern_usage_pattern
  ON bridge_pattern_usage(pattern_id, created_at DESC);

-- ============================================================================
-- ADMIN VIEW: Pattern Summary
-- Aggregated view for admin visibility into learned patterns
-- ============================================================================

CREATE OR REPLACE VIEW bridge_pattern_summary AS
SELECT
  p.id,
  p.archetype,
  p.principle,
  p.confidence,
  p.usage_count,
  p.is_active,
  p.created_at,
  p.refined_at,
  s.topic,
  s.id as session_id,
  u.id as trainer_id,
  u.name as trainer_name,
  u.email as trainer_email,
  -- Calculate effectiveness from usage
  COALESCE(
    (SELECT AVG(user_rating) FROM bridge_pattern_usage pu WHERE pu.pattern_id = p.id),
    0
  ) as avg_rating,
  COALESCE(
    (SELECT COUNT(*) FILTER (WHERE was_helpful = TRUE) * 100.0 / NULLIF(COUNT(*), 0)
     FROM bridge_pattern_usage pu WHERE pu.pattern_id = p.id),
    0
  ) as helpful_rate
FROM bridge_learned_patterns p
LEFT JOIN bridge_teaching_sessions s ON p.session_id = s.id
LEFT JOIN users u ON s.trainer_id = u.id
ORDER BY p.created_at DESC;

-- ============================================================================
-- PREDEFINED ARCHETYPES
-- Seed data for user archetypes (stored as JSONB for flexibility)
-- ============================================================================

CREATE TABLE IF NOT EXISTS bridge_archetypes (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  mindset TEXT NOT NULL,
  sentiment_markers TEXT[] NOT NULL DEFAULT '{}',
  trust_level VARCHAR(20) NOT NULL
    CHECK (trust_level IN ('low', 'medium', 'high', 'neutral')),
  needs TEXT[] NOT NULL DEFAULT '{}',
  anti_patterns TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert predefined archetypes
INSERT INTO bridge_archetypes (id, name, description, mindset, sentiment_markers, trust_level, needs, anti_patterns)
VALUES
  (
    'skeptic',
    'The Skeptic',
    'Questions everything, needs proof before believing',
    'This sounds too good to be true',
    ARRAY['but', 'what about', 'who controls', 'sounds like', 'in theory', 'prove'],
    'low',
    ARRAY['Concrete examples', 'Acknowledgment of valid concerns', 'Evidence', 'Transparency'],
    ARRAY['Being defensive', 'Overselling', 'Dismissing concerns', 'Vague promises']
  ),
  (
    'enthusiast',
    'The Enthusiast',
    'Eager to participate, high energy, ready to dive in',
    'I love this! How do I start?',
    ARRAY['amazing', 'love', 'how can I', 'where do I', 'excited', 'can''t wait', '!'],
    'high',
    ARRAY['Clear next action', 'Connection to community', 'Immediate involvement', 'Quick wins'],
    ARRAY['Overwhelming with options', 'Slowing momentum', 'Too much theory', 'Bureaucracy']
  ),
  (
    'pragmatist',
    'The Pragmatist',
    'Results-oriented, evidence-driven, needs to see it work',
    'Interesting. Does it actually work?',
    ARRAY['scale', 'evidence', 'examples', 'who else', 'metrics', 'results', 'ROI', 'prove'],
    'medium',
    ARRAY['Case studies', 'Data', 'Realistic assessment of challenges', 'Track record'],
    ARRAY['Being vague', 'Avoiding hard questions', 'Unsubstantiated claims', 'Idealism without proof']
  ),
  (
    'wounded-helper',
    'The Wounded Helper',
    'Has been burned before by similar initiatives, cautious but still hopeful',
    'I tried this before and got burned',
    ARRAY['tried', 'burned out', 'always ends up', 'freeloaders', 'taken advantage', 'naive'],
    'low',
    ARRAY['Acknowledgment of past pain', 'Explanation of structural differences', 'Safeguards explained', 'Validation of experience'],
    ARRAY['Minimizing their experience', 'Empty promises', 'Dismissing past failures', 'Toxic positivity']
  ),
  (
    'curious-observer',
    'The Curious Observer',
    'Just learning, not ready to commit, exploring options',
    'Just curious, not looking to commit to anything',
    ARRAY['just curious', 'wondering', 'how does', 'what is', 'exploring', 'maybe someday'],
    'neutral',
    ARRAY['Information without pressure', 'Permission to observe', 'No commitment required', 'Time to process'],
    ARRAY['Pushing for commitment', 'Assuming they want to join', 'Sales pressure', 'Follow-up demands']
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  mindset = EXCLUDED.mindset,
  sentiment_markers = EXCLUDED.sentiment_markers,
  trust_level = EXCLUDED.trust_level,
  needs = EXCLUDED.needs,
  anti_patterns = EXCLUDED.anti_patterns,
  updated_at = NOW();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update session statistics after adding turns
CREATE OR REPLACE FUNCTION update_teaching_session_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE bridge_teaching_sessions
  SET
    total_demo_turns = (
      SELECT COUNT(*) FROM bridge_teaching_turns
      WHERE session_id = NEW.session_id AND mode = 'demo'
    ),
    total_practice_turns = (
      SELECT COUNT(*) FROM bridge_teaching_turns
      WHERE session_id = NEW.session_id AND mode = 'practice'
    ),
    practice_success_rate = (
      SELECT
        COUNT(*) FILTER (WHERE feedback_rating = 'positive') * 100.0 /
        NULLIF(COUNT(*) FILTER (WHERE feedback_rating IS NOT NULL), 0)
      FROM bridge_teaching_turns
      WHERE session_id = NEW.session_id AND mode = 'practice'
    ),
    updated_at = NOW()
  WHERE id = NEW.session_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update stats
CREATE TRIGGER trg_update_teaching_session_stats
  AFTER INSERT OR UPDATE ON bridge_teaching_turns
  FOR EACH ROW
  EXECUTE FUNCTION update_teaching_session_stats();

-- Function to increment pattern usage count
CREATE OR REPLACE FUNCTION increment_pattern_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE bridge_learned_patterns
  SET
    usage_count = usage_count + 1,
    last_used_at = NOW()
  WHERE id = NEW.pattern_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for pattern usage tracking
CREATE TRIGGER trg_increment_pattern_usage
  AFTER INSERT ON bridge_pattern_usage
  FOR EACH ROW
  EXECUTE FUNCTION increment_pattern_usage();

-- ============================================================================
-- GRANTS (if needed for specific roles)
-- ============================================================================

-- Grant read access to pattern summary view for reporting
-- GRANT SELECT ON bridge_pattern_summary TO readonly_role;

COMMENT ON TABLE bridge_teaching_sessions IS 'Teaching sessions where trainers demonstrate ideal Bridge responses';
COMMENT ON TABLE bridge_teaching_turns IS 'Individual conversation turns within teaching sessions';
COMMENT ON TABLE bridge_learned_patterns IS 'Extracted response patterns learned from teaching sessions';
COMMENT ON TABLE bridge_pattern_usage IS 'Tracking when learned patterns are applied in real conversations';
COMMENT ON TABLE bridge_archetypes IS 'Predefined user archetypes for training exercises';
COMMENT ON VIEW bridge_pattern_summary IS 'Admin view showing pattern effectiveness metrics';
