-- Migration: Add Forum Schema
-- Date: 2025-11-18
-- Description: Creates forum tables for community discussions and deliberation

-- Create topic_category enum
CREATE TYPE topic_category AS ENUM (
  'general',
  'proposal',
  'question',
  'deliberation',
  'announcement'
);

-- Create topic_status enum
CREATE TYPE topic_status AS ENUM (
  'open',
  'resolved',
  'archived',
  'locked'
);

-- Create reaction_type enum
CREATE TYPE reaction_type AS ENUM (
  'agree',
  'disagree',
  'insightful',
  'empathy',
  'question',
  'concern'
);

-- Create flag_reason enum
CREATE TYPE flag_reason AS ENUM (
  'spam',
  'harassment',
  'misinformation',
  'off-topic',
  'harmful'
);

-- Create flag_status enum
CREATE TYPE flag_status AS ENUM (
  'pending',
  'dismissed',
  'action-taken'
);

-- Create post_stance enum (for deliberation posts)
CREATE TYPE post_stance AS ENUM (
  'support',
  'oppose',
  'neutral',
  'question'
);

-- Topics table
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core fields
  title VARCHAR(200) NOT NULL CHECK (length(title) >= 3),
  description TEXT CHECK (description IS NULL OR (length(description) >= 10 AND length(description) <= 2000)),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,

  -- Classification
  category topic_category NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Lifecycle
  status topic_status NOT NULL DEFAULT 'open',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,

  -- Cached counts
  post_count INTEGER DEFAULT 0,
  participant_count INTEGER DEFAULT 0,

  -- Activity tracking
  last_activity_at TIMESTAMP DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Soft delete
  deleted_at TIMESTAMP
);

-- Posts table (top-level responses to topics)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parent relationship
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,

  -- Author
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Content
  content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 5000),

  -- Deliberation position (optional, for deliberation topics)
  position_stance post_stance,
  position_reasoning TEXT CHECK (position_reasoning IS NULL OR (length(position_reasoning) >= 10 AND length(position_reasoning) <= 1000)),
  position_tradeoffs TEXT[] DEFAULT ARRAY[]::TEXT[],
  position_alternatives TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Citations (stored as JSONB array of citation objects)
  citations JSONB DEFAULT '[]'::jsonb,

  -- Cached counts
  reply_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Soft delete
  deleted_at TIMESTAMP
);

-- Replies table (nested responses to posts)
CREATE TABLE replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parent relationship
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,

  -- Author
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Content
  content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 2000),

  -- Citations (stored as JSONB array of citation objects)
  citations JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Soft delete
  deleted_at TIMESTAMP
);

-- Reactions table (for both posts and replies)
CREATE TABLE forum_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Polymorphic parent (post or reply)
  content_id UUID NOT NULL,
  content_type VARCHAR(10) NOT NULL CHECK (content_type IN ('post', 'reply')),

  -- Reactor
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Reaction type
  type reaction_type NOT NULL,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),

  -- One reaction per user per content item
  UNIQUE(content_id, content_type, user_id)
);

-- Flags table (moderation flags for posts and replies)
CREATE TABLE forum_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Flagged content
  content_id UUID NOT NULL,
  content_type VARCHAR(10) NOT NULL CHECK (content_type IN ('post', 'reply')),

  -- Flagger
  flagger_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Flag details
  reason flag_reason NOT NULL,
  details TEXT CHECK (details IS NULL OR length(details) <= 500),

  -- Review status
  status flag_status DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Edit history table (append-only log of content changes)
CREATE TABLE forum_edits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Edited content
  content_id UUID NOT NULL,
  content_type VARCHAR(10) NOT NULL CHECK (content_type IN ('post', 'reply')),

  -- Editor (usually the author)
  edited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Edit details
  previous_content TEXT NOT NULL,
  edit_reason TEXT,

  -- Timestamp
  edited_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance

-- Topics indexes
CREATE INDEX idx_topics_author ON topics(author_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_topics_group ON topics(group_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_topics_category ON topics(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_topics_status ON topics(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_topics_tags ON topics USING GIN(tags);
CREATE INDEX idx_topics_last_activity ON topics(last_activity_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_topics_created ON topics(created_at DESC);

-- Posts indexes
CREATE INDEX idx_posts_topic ON posts(topic_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_author ON posts(author_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_citations ON posts USING GIN(citations);

-- Replies indexes
CREATE INDEX idx_replies_post ON replies(post_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_replies_author ON replies(author_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_replies_created ON replies(created_at DESC);

-- Reactions indexes
CREATE INDEX idx_forum_reactions_content ON forum_reactions(content_id, content_type);
CREATE INDEX idx_forum_reactions_user ON forum_reactions(user_id);
CREATE INDEX idx_forum_reactions_type ON forum_reactions(type);

-- Flags indexes
CREATE INDEX idx_forum_flags_content ON forum_flags(content_id, content_type);
CREATE INDEX idx_forum_flags_flagger ON forum_flags(flagger_id);
CREATE INDEX idx_forum_flags_status ON forum_flags(status);
CREATE INDEX idx_forum_flags_reviewer ON forum_flags(reviewed_by) WHERE reviewed_by IS NOT NULL;

-- Edits indexes
CREATE INDEX idx_forum_edits_content ON forum_edits(content_id, content_type);
CREATE INDEX idx_forum_edits_editor ON forum_edits(edited_by);
CREATE INDEX idx_forum_edits_timestamp ON forum_edits(edited_at DESC);

-- Triggers for auto-updating timestamps

CREATE OR REPLACE FUNCTION update_topics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_topics_updated_at();

CREATE OR REPLACE FUNCTION update_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_posts_updated_at();

CREATE OR REPLACE FUNCTION update_replies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_replies_updated_at BEFORE UPDATE ON replies
  FOR EACH ROW EXECUTE FUNCTION update_replies_updated_at();

-- Trigger to update topic.last_activity_at when posts/replies are created
CREATE OR REPLACE FUNCTION update_topic_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the topic's last_activity_at timestamp
  UPDATE topics
  SET last_activity_at = NOW()
  WHERE id = (
    CASE
      WHEN TG_TABLE_NAME = 'posts' THEN NEW.topic_id
      WHEN TG_TABLE_NAME = 'replies' THEN (SELECT topic_id FROM posts WHERE id = NEW.post_id)
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_topic_activity_on_post
  AFTER INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION update_topic_last_activity();

CREATE TRIGGER update_topic_activity_on_reply
  AFTER INSERT ON replies
  FOR EACH ROW EXECUTE FUNCTION update_topic_last_activity();

-- Trigger to increment topic.post_count
CREATE OR REPLACE FUNCTION increment_topic_post_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE topics
  SET post_count = post_count + 1
  WHERE id = NEW.topic_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_topic_post_count_trigger
  AFTER INSERT ON posts
  FOR EACH ROW EXECUTE FUNCTION increment_topic_post_count();

-- Trigger to increment post.reply_count
CREATE OR REPLACE FUNCTION increment_post_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE posts
  SET reply_count = reply_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_post_reply_count_trigger
  AFTER INSERT ON replies
  FOR EACH ROW EXECUTE FUNCTION increment_post_reply_count();

-- Comments for documentation
COMMENT ON TABLE topics IS 'Discussion threads in the forum (general, Q&A, deliberation, announcements)';
COMMENT ON TABLE posts IS 'Top-level responses to forum topics with optional deliberation positions';
COMMENT ON TABLE replies IS 'Nested responses to posts (threaded discussions)';
COMMENT ON TABLE forum_reactions IS 'Empathy-focused reactions to posts and replies';
COMMENT ON TABLE forum_flags IS 'Moderation flags for community review';
COMMENT ON TABLE forum_edits IS 'Append-only edit history for transparency';

COMMENT ON COLUMN posts.position_stance IS 'For deliberation topics: support, oppose, neutral, question';
COMMENT ON COLUMN posts.position_reasoning IS 'Why this stance (required for deliberation)';
COMMENT ON COLUMN posts.position_tradeoffs IS 'Acknowledged downsides of this position';
COMMENT ON COLUMN posts.position_alternatives IS 'Other options considered';

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE topics TO togetheros_app;
GRANT ALL PRIVILEGES ON TABLE posts TO togetheros_app;
GRANT ALL PRIVILEGES ON TABLE replies TO togetheros_app;
GRANT ALL PRIVILEGES ON TABLE forum_reactions TO togetheros_app;
GRANT ALL PRIVILEGES ON TABLE forum_flags TO togetheros_app;
GRANT ALL PRIVILEGES ON TABLE forum_edits TO togetheros_app;
