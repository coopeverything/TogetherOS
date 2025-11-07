-- Migration 017: Add Proposal Embeddings for Similarity Detection
-- Adds pgvector extension and embedding column for semantic similarity search
-- Dependencies: 013_add_proposals_schema.sql

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to proposals table
-- Using OpenAI text-embedding-3-small (1536 dimensions)
ALTER TABLE proposals
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for cosine similarity search (recommended for normalized embeddings)
CREATE INDEX IF NOT EXISTS idx_proposals_embedding_cosine
  ON proposals USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Create index for L2 distance (Euclidean) as alternative
CREATE INDEX IF NOT EXISTS idx_proposals_embedding_l2
  ON proposals USING ivfflat (embedding vector_l2_ops)
  WITH (lists = 100);

-- Comments
COMMENT ON COLUMN proposals.embedding IS 'OpenAI text-embedding-3-small vector (1536 dimensions) for semantic similarity detection';
COMMENT ON INDEX idx_proposals_embedding_cosine IS 'IVFFlat index for fast cosine similarity search (used by Bridge similarity detection)';
COMMENT ON INDEX idx_proposals_embedding_l2 IS 'IVFFlat index for L2 distance search (alternative similarity metric)';

-- Note: Embeddings are generated when proposals are created/updated
-- The SimilarityDetector service handles embedding generation via OpenAI API
