-- Migration: Add Forum-to-Proposal Linking
-- Purpose: Enable seamless flow from discussion to formal proposal
-- Module: Forum + Governance Integration

-- Add promotion tracking to topics
ALTER TABLE topics
ADD COLUMN linked_proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
ADD COLUMN promotion_status VARCHAR(20) CHECK (promotion_status IN ('eligible', 'promoted', 'declined')),
ADD COLUMN supporter_count INTEGER DEFAULT 0;

-- Add source tracking to proposals
ALTER TABLE proposals
ADD COLUMN source_topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
ADD COLUMN source_type VARCHAR(20) DEFAULT 'manual' CHECK (source_type IN ('manual', 'forum', 'bridge'));

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_topics_linked_proposal ON topics(linked_proposal_id);
CREATE INDEX IF NOT EXISTS idx_topics_promotion_status ON topics(promotion_status) WHERE promotion_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_proposals_source_topic ON proposals(source_topic_id);
CREATE INDEX IF NOT EXISTS idx_proposals_source_type ON proposals(source_type);

-- Add comments explaining the fields
COMMENT ON COLUMN topics.linked_proposal_id IS 'References the proposal created from this topic (if promoted)';
COMMENT ON COLUMN topics.promotion_status IS 'Tracks eligibility for promotion: eligible (meets thresholds), promoted (converted), declined (rejected)';
COMMENT ON COLUMN topics.supporter_count IS 'Cached count of unique supporters (reactions) - triggers promotion eligibility';
COMMENT ON COLUMN proposals.source_topic_id IS 'References the forum topic this proposal originated from (if any)';
COMMENT ON COLUMN proposals.source_type IS 'How this proposal was created: manual (by user), forum (promoted), bridge (AI-suggested)';

-- Note: Promotion triggers and thresholds will be implemented in application logic
-- Default threshold: 20+ unique supporter reactions makes topic eligible for promotion
