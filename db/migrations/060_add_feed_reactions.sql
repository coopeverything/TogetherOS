-- 060_add_feed_reactions.sql
-- Add feed_reactions table for persistent reaction storage

-- Create feed_reactions table
CREATE TABLE IF NOT EXISTS feed_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Unique constraint: one reaction type per user per post
  CONSTRAINT feed_reactions_unique_user_post_type UNIQUE (post_id, user_id, reaction_type)
);

-- Check constraint for valid reaction types
ALTER TABLE feed_reactions
ADD CONSTRAINT feed_reactions_type_check
CHECK (reaction_type IN ('care', 'insightful', 'agree', 'disagree', 'act', 'question'));

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_feed_reactions_post_id ON feed_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_feed_reactions_user_id ON feed_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_reactions_type ON feed_reactions(reaction_type);

-- Composite index for getting user's reactions on a post
CREATE INDEX IF NOT EXISTS idx_feed_reactions_user_post ON feed_reactions(user_id, post_id);

-- Comment for documentation
COMMENT ON TABLE feed_reactions IS 'Stores user reactions on feed posts (care, insightful, agree, disagree, act, question)';
