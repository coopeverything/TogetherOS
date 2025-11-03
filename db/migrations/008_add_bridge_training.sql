-- Bridge Training Interface - Database Schema
-- Migration: 008
-- Purpose: Store training examples for improving Bridge AI responses
-- Created: 2025-11-03

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core training examples table
CREATE TABLE IF NOT EXISTS bridge_training_examples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Question and context
  question TEXT NOT NULL,
  context_path TEXT,
  question_category VARCHAR(100),

  -- Bridge's response
  bridge_response TEXT NOT NULL,
  bridge_model VARCHAR(50) NOT NULL DEFAULT 'gpt-3.5-turbo',
  bridge_temperature DECIMAL(2,1),
  bridge_sources JSONB,
  bridge_response_time_ms INTEGER,

  -- User ratings of Bridge's response (1-5 stars)
  helpfulness_rating INTEGER CHECK (helpfulness_rating BETWEEN 1 AND 5),
  accuracy_rating INTEGER CHECK (accuracy_rating BETWEEN 1 AND 5),
  tone_rating INTEGER CHECK (tone_rating BETWEEN 1 AND 5),

  -- User's ideal response
  ideal_response TEXT,
  ideal_sources JSONB,
  ideal_keywords TEXT[],

  -- Training metadata
  training_status VARCHAR(50) DEFAULT 'pending',
    -- pending, reviewed, approved, rejected, used_in_training
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  review_notes TEXT,

  -- Quality score (calculated from ratings: avg of 3 ratings scaled to 0-100)
  quality_score INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN helpfulness_rating IS NOT NULL
        AND accuracy_rating IS NOT NULL
        AND tone_rating IS NOT NULL
      THEN ROUND((helpfulness_rating + accuracy_rating + tone_rating) * 100.0 / 15.0)
      ELSE NULL
    END
  ) STORED,

  -- Training usage
  used_in_training BOOLEAN DEFAULT FALSE,
  training_batch_id UUID,

  -- Audit fields
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  ip_hash VARCHAR(64),

  -- Soft delete
  deleted_at TIMESTAMP,
  deleted_by UUID REFERENCES users(id)
);

-- Training batches for organizing training runs
CREATE TABLE IF NOT EXISTS bridge_training_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name VARCHAR(255) NOT NULL,
  description TEXT,
  training_type VARCHAR(50),
    -- 'rag_enhancement', 'fine_tuning', 'prompt_engineering'

  config JSONB NOT NULL,
  example_count INTEGER NOT NULL,

  status VARCHAR(50) DEFAULT 'draft',
    -- draft, ready, training, completed, failed
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT,

  metrics JSONB,
  model_artifact_url TEXT,

  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add foreign key constraint for training_batch_id
ALTER TABLE bridge_training_examples
  ADD CONSTRAINT fk_training_batch
  FOREIGN KEY (training_batch_id)
  REFERENCES bridge_training_batches(id)
  ON DELETE SET NULL;

-- User feedback on training examples
CREATE TABLE IF NOT EXISTS bridge_training_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  example_id UUID NOT NULL REFERENCES bridge_training_examples(id) ON DELETE CASCADE,

  feedback_type VARCHAR(50),
    -- 'helpful', 'incorrect', 'incomplete', 'tone_issue'
  feedback_text TEXT,

  submitted_by UUID NOT NULL REFERENCES users(id),
  submitted_at TIMESTAMP DEFAULT NOW(),
  ip_hash VARCHAR(64)
);

-- Admin training sessions (track work)
CREATE TABLE IF NOT EXISTS bridge_training_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  admin_id UUID NOT NULL REFERENCES users(id),
  session_start TIMESTAMP DEFAULT NOW(),
  session_end TIMESTAMP,

  examples_created INTEGER DEFAULT 0,
  examples_approved INTEGER DEFAULT 0,
  examples_rejected INTEGER DEFAULT 0,

  ip_hash VARCHAR(64),
  user_agent TEXT
);

-- Audit log
CREATE TABLE IF NOT EXISTS bridge_training_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMP DEFAULT NOW(),
  event_type VARCHAR(100) NOT NULL,
  actor_id UUID NOT NULL REFERENCES users(id),
  target_type VARCHAR(50),
  target_id UUID,
  action JSONB NOT NULL,
  metadata JSONB,
  ip_hash VARCHAR(64)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_training_examples_status
  ON bridge_training_examples(training_status);

CREATE INDEX IF NOT EXISTS idx_training_examples_created_at
  ON bridge_training_examples(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_training_examples_quality
  ON bridge_training_examples(quality_score DESC)
  WHERE quality_score IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_training_examples_category
  ON bridge_training_examples(question_category)
  WHERE question_category IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_training_examples_created_by
  ON bridge_training_examples(created_by);

CREATE INDEX IF NOT EXISTS idx_training_batches_status
  ON bridge_training_batches(status);

CREATE INDEX IF NOT EXISTS idx_training_batches_created_by
  ON bridge_training_batches(created_by);

CREATE INDEX IF NOT EXISTS idx_training_feedback_example
  ON bridge_training_feedback(example_id);

CREATE INDEX IF NOT EXISTS idx_training_sessions_admin
  ON bridge_training_sessions(admin_id);

CREATE INDEX IF NOT EXISTS idx_training_audit_actor
  ON bridge_training_audit(actor_id);

CREATE INDEX IF NOT EXISTS idx_training_audit_timestamp
  ON bridge_training_audit(timestamp DESC);

-- Trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_bridge_training_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at on bridge_training_examples
CREATE TRIGGER trigger_update_bridge_training_examples_timestamp
  BEFORE UPDATE ON bridge_training_examples
  FOR EACH ROW
  EXECUTE FUNCTION update_bridge_training_updated_at();

-- Comments for documentation
COMMENT ON TABLE bridge_training_examples IS
  'Stores Q&A training examples for improving Bridge AI. Captures both Bridge''s responses and admin-provided ideal responses with quality ratings.';

COMMENT ON COLUMN bridge_training_examples.quality_score IS
  'Auto-calculated from average of helpfulness, accuracy, and tone ratings, scaled to 0-100';

COMMENT ON TABLE bridge_training_batches IS
  'Organizes training examples into batches for fine-tuning or RAG enhancement';

COMMENT ON TABLE bridge_training_feedback IS
  'User feedback on training examples from community members';

COMMENT ON TABLE bridge_training_sessions IS
  'Tracks admin training sessions for productivity metrics';

COMMENT ON TABLE bridge_training_audit IS
  'Complete audit log of all training-related actions for accountability';
