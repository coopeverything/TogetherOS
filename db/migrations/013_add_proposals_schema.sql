-- Migration: Add Proposals Schema
-- Date: 2025-01-15
-- Description: Creates proposals table for governance module with individual/group scoping

-- Create proposal_status enum
CREATE TYPE proposal_status AS ENUM (
  'draft',
  'research',
  'deliberation',
  'voting',
  'decided',
  'delivery',
  'reviewed',
  'archived'
);

-- Create proposal_scope_type enum
CREATE TYPE proposal_scope_type AS ENUM ('individual', 'group');

-- Create proposals table
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Polymorphic scoping (individual OR group proposals)
  scope_type proposal_scope_type NOT NULL,
  scope_id UUID NOT NULL,  -- user.id (if individual) OR group.id (if group)

  -- Author (always an individual user)
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Core fields
  title VARCHAR(200) NOT NULL CHECK (length(title) >= 3),
  summary TEXT NOT NULL CHECK (length(summary) >= 10 AND length(summary) <= 2000),

  -- Governance workflow
  status proposal_status NOT NULL DEFAULT 'draft',
  evidence JSONB DEFAULT '[]'::jsonb,
  options JSONB DEFAULT '[]'::jsonb,
  positions JSONB DEFAULT '[]'::jsonb,
  minority_report TEXT,
  decided_at TIMESTAMP,
  decision_outcome VARCHAR(50),

  -- Bridge AI integration fields (prepared for future use)
  bridge_similarity_check_done BOOLEAN DEFAULT FALSE,
  bridge_similar_proposals JSONB DEFAULT '[]'::jsonb,
  bridge_regulation_conflicts JSONB DEFAULT '[]'::jsonb,
  bridge_clarification_thread_id UUID,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Soft delete
  deleted_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_proposals_scope ON proposals(scope_type, scope_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_proposals_author ON proposals(author_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_proposals_status ON proposals(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_proposals_created_at ON proposals(created_at DESC);
CREATE INDEX idx_proposals_evidence ON proposals USING GIN(evidence);
CREATE INDEX idx_proposals_options ON proposals USING GIN(options);
CREATE INDEX idx_proposals_positions ON proposals USING GIN(positions);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_proposals_updated_at();

-- Comments for documentation
COMMENT ON TABLE proposals IS 'Community proposals for governance decisions (individual or group-scoped)';
COMMENT ON COLUMN proposals.scope_type IS 'Scoping: individual (personal proposal) or group (group-wide proposal)';
COMMENT ON COLUMN proposals.scope_id IS 'Reference to user.id (if individual) or group.id (if group)';
COMMENT ON COLUMN proposals.author_id IS 'User who created the proposal (always an individual)';
COMMENT ON COLUMN proposals.title IS 'Proposal title (3-200 characters)';
COMMENT ON COLUMN proposals.summary IS 'Proposal description (10-2000 characters)';
COMMENT ON COLUMN proposals.status IS 'Governance workflow stage';
COMMENT ON COLUMN proposals.evidence IS 'Research, data, expert opinions (JSONB array)';
COMMENT ON COLUMN proposals.options IS 'Alternative approaches with trade-offs (JSONB array)';
COMMENT ON COLUMN proposals.positions IS 'Member stances with reasoning (JSONB array)';
COMMENT ON COLUMN proposals.minority_report IS 'Codified objections and concerns';
COMMENT ON COLUMN proposals.bridge_similarity_check_done IS 'Whether Bridge has checked for similar proposals';
COMMENT ON COLUMN proposals.bridge_similar_proposals IS 'Similar proposals detected by Bridge (JSONB array)';
COMMENT ON COLUMN proposals.bridge_regulation_conflicts IS 'Regulation conflicts detected by Bridge (JSONB array)';
COMMENT ON COLUMN proposals.bridge_clarification_thread_id IS 'Link to Bridge conversation thread (if clarification initiated)';

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE proposals TO togetheros_app;
