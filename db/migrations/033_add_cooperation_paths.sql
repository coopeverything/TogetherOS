-- Migration: Add Cooperation Path Taxonomy Linking
-- Purpose: Enable proposals and forum topics to be classified by cooperation path
-- Module: Search & Tags, Governance, Forum

-- Create cooperation_path enum type
CREATE TYPE cooperation_path AS ENUM (
  'collaborative-education',
  'social-economy',
  'common-wellbeing',
  'cooperative-technology',
  'collective-governance',
  'community-connection',
  'collaborative-media-culture',
  'common-planet'
);

-- Add cooperation_path to proposals table
ALTER TABLE proposals
ADD COLUMN cooperation_path cooperation_path;

-- Add index for proposals cooperation_path (for filtering)
CREATE INDEX IF NOT EXISTS idx_proposals_cooperation_path ON proposals(cooperation_path) WHERE deleted_at IS NULL;

-- Add cooperation_path to topics table
ALTER TABLE topics
ADD COLUMN cooperation_path cooperation_path;

-- Add index for topics cooperation_path (for filtering)
CREATE INDEX IF NOT EXISTS idx_topics_cooperation_path ON topics(cooperation_path) WHERE deleted_at IS NULL;

-- Add comment explaining the field
COMMENT ON COLUMN proposals.cooperation_path IS 'Cooperation path classification (one of 8 canonical paths)';
COMMENT ON COLUMN topics.cooperation_path IS 'Cooperation path classification (one of 8 canonical paths)';

-- Note: cooperation_path is nullable to allow:
-- 1. Existing proposals/topics without path classification
-- 2. Cross-path content (future: could be array for multi-path)
-- 3. Unclassified content (gets suggested by Bridge AI)
