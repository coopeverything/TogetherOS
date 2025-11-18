-- Migration: Add Proposal Votes and Ratings Tables
-- Date: 2025-01-17
-- Description: Creates separate tables for proposal votes and ratings

-- Create vote_type enum
CREATE TYPE vote_type AS ENUM ('consent', 'concern', 'abstain', 'block');

-- Create proposal_votes table
CREATE TABLE proposal_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Vote data
  vote_type vote_type NOT NULL,
  reasoning TEXT,

  -- Timestamps
  voted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- One vote per member per proposal
  UNIQUE(proposal_id, member_id)
);

-- Create proposal_ratings table
CREATE TABLE proposal_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Rating dimensions
  clarity INTEGER NOT NULL CHECK (clarity >= 1 AND clarity <= 3),
  importance INTEGER NOT NULL CHECK (importance >= 1 AND importance <= 5),
  urgency INTEGER NOT NULL CHECK (urgency >= 1 AND urgency <= 5),
  is_innovative BOOLEAN NOT NULL DEFAULT FALSE,
  constructiveness INTEGER NOT NULL CHECK (constructiveness >= 1 AND constructiveness <= 3),

  -- Optional feedback
  feedback TEXT,

  -- Timestamps
  rated_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- One rating per member per proposal
  UNIQUE(proposal_id, member_id)
);

-- Indexes for votes
CREATE INDEX idx_proposal_votes_proposal ON proposal_votes(proposal_id);
CREATE INDEX idx_proposal_votes_member ON proposal_votes(member_id);
CREATE INDEX idx_proposal_votes_type ON proposal_votes(vote_type);

-- Indexes for ratings
CREATE INDEX idx_proposal_ratings_proposal ON proposal_ratings(proposal_id);
CREATE INDEX idx_proposal_ratings_member ON proposal_ratings(member_id);
CREATE INDEX idx_proposal_ratings_constructiveness ON proposal_ratings(constructiveness) WHERE constructiveness = 1;

-- Trigger to update updated_at on votes
CREATE TRIGGER update_proposal_votes_updated_at BEFORE UPDATE ON proposal_votes
  FOR EACH ROW EXECUTE FUNCTION update_proposals_updated_at();

-- Trigger to update updated_at on ratings
CREATE TRIGGER update_proposal_ratings_updated_at BEFORE UPDATE ON proposal_ratings
  FOR EACH ROW EXECUTE FUNCTION update_proposals_updated_at();

-- Comments for documentation
COMMENT ON TABLE proposal_votes IS 'Member votes on proposals (consent-based decision making)';
COMMENT ON COLUMN proposal_votes.vote_type IS 'consent (approve), concern (express objection), abstain, block (strong objection)';
COMMENT ON COLUMN proposal_votes.reasoning IS 'Optional explanation for the vote';

COMMENT ON TABLE proposal_ratings IS 'Multi-dimensional quality ratings for proposals during deliberation';
COMMENT ON COLUMN proposal_ratings.clarity IS '1 (brown/unclear), 2 (yellow/somewhat clear), 3 (green/very clear)';
COMMENT ON COLUMN proposal_ratings.importance IS '1-5 scale: how critical/impactful';
COMMENT ON COLUMN proposal_ratings.urgency IS '1-5 scale: how time-sensitive';
COMMENT ON COLUMN proposal_ratings.is_innovative IS 'Great new idea indicator (bulb icon)';
COMMENT ON COLUMN proposal_ratings.constructiveness IS '1 (red/needs moderation), 2 (yellow/somewhat problematic), 3 (green/constructive)';

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE proposal_votes TO togetheros_app;
GRANT ALL PRIVILEGES ON TABLE proposal_ratings TO togetheros_app;
