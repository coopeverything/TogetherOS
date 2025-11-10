-- Migration: Add Regulations Schema
-- Date: 2025-01-15
-- Description: Creates regulations table for Bridge integration (policy/rule storage)

-- Create regulation_status enum
CREATE TYPE regulation_status AS ENUM ('active', 'superseded', 'repealed');

-- Create regulation_scope_type enum
CREATE TYPE regulation_scope_type AS ENUM ('global', 'group');

-- Create regulations table
CREATE TABLE regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Regulation metadata
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),  -- e.g., 'governance', 'moderation', 'resource-allocation'

  -- Originating proposal (if regulation came from a proposal)
  source_proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  implemented_at TIMESTAMP NOT NULL,

  -- Full text for Bridge semantic search
  full_text TEXT NOT NULL,
  full_text_vector tsvector,  -- PostgreSQL full-text search index

  -- Scope (global or group-specific)
  scope_type regulation_scope_type NOT NULL,
  scope_id UUID,  -- NULL for global, group.id for group-specific

  -- Status & supersession
  status regulation_status NOT NULL DEFAULT 'active',
  superseded_by UUID REFERENCES regulations(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT regulation_scope_check CHECK (
    (scope_type = 'global' AND scope_id IS NULL) OR
    (scope_type = 'group' AND scope_id IS NOT NULL)
  ),
  CONSTRAINT regulation_supersession_check CHECK (
    (status != 'superseded') OR (superseded_by IS NOT NULL)
  )
);

-- Indexes for performance
CREATE INDEX idx_regulations_scope ON regulations(scope_type, scope_id);
CREATE INDEX idx_regulations_status ON regulations(status);
CREATE INDEX idx_regulations_category ON regulations(category);
CREATE INDEX idx_regulations_source_proposal ON regulations(source_proposal_id);
CREATE INDEX idx_regulations_implemented_at ON regulations(implemented_at DESC);

-- Full-text search index
CREATE INDEX idx_regulations_vector ON regulations USING GIN(full_text_vector);

-- Function to update full-text search vector
CREATE OR REPLACE FUNCTION update_regulations_full_text_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.full_text_vector := to_tsvector('english', NEW.full_text);
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for full-text search vector
CREATE TRIGGER update_regulations_full_text_vector
  BEFORE INSERT OR UPDATE OF full_text ON regulations
  FOR EACH ROW EXECUTE FUNCTION update_regulations_full_text_vector();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_regulations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_regulations_updated_at BEFORE UPDATE ON regulations
  FOR EACH ROW EXECUTE FUNCTION update_regulations_updated_at();

-- Comments for documentation
COMMENT ON TABLE regulations IS 'Implemented regulations/policies for Bridge AI to check proposals against';
COMMENT ON COLUMN regulations.title IS 'Short regulation title (3-200 characters)';
COMMENT ON COLUMN regulations.description IS 'Full regulation description';
COMMENT ON COLUMN regulations.category IS 'Regulation category for organization (governance, moderation, etc.)';
COMMENT ON COLUMN regulations.source_proposal_id IS 'Original proposal that created this regulation (if applicable)';
COMMENT ON COLUMN regulations.implemented_at IS 'When regulation became active';
COMMENT ON COLUMN regulations.full_text IS 'Complete regulation text for Bridge semantic analysis';
COMMENT ON COLUMN regulations.full_text_vector IS 'PostgreSQL tsvector for full-text search (auto-generated)';
COMMENT ON COLUMN regulations.scope_type IS 'Global (applies to all) or group-specific';
COMMENT ON COLUMN regulations.scope_id IS 'NULL for global regulations, group.id for group-specific';
COMMENT ON COLUMN regulations.status IS 'Active, superseded by newer regulation, or repealed';
COMMENT ON COLUMN regulations.superseded_by IS 'Link to newer regulation that replaced this one';

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE regulations TO togetheros_app;
