-- Migration: 028_seed_forum_sample_data.sql
-- Description: Add sample forum topics for testing and demonstration
-- Created: 2025-01-18

-- NOTE: This migration uses hardcoded UUIDs for sample data
-- In production, these would be replaced with actual user/group IDs

-- Sample Topic 1: General Discussion
INSERT INTO topics (
  id,
  title,
  description,
  author_id,
  category,
  tags,
  status,
  is_pinned,
  is_locked,
  post_count,
  participant_count,
  last_activity_at
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Welcome to TogetherOS Community Discussions!',
  'This is a space for knowledge building, Q&A, idea exploration, and structured deliberation. Feel free to introduce yourself and share what brings you here.',
  (SELECT id FROM users LIMIT 1), -- Use first user as author
  'general',
  ARRAY['community-connection', 'cooperative-technology']::text[],
  'open',
  true, -- Pinned
  false,
  5,
  3,
  NOW() - INTERVAL '2 hours'
);

-- Sample Topic 2: Question
INSERT INTO topics (
  id,
  title,
  description,
  author_id,
  category,
  tags,
  status,
  is_pinned,
  is_locked,
  post_count,
  participant_count,
  last_activity_at
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'How do I allocate Support Points to ideas I like?',
  'I''m new to the platform and I''ve seen several great ideas in the feed. How does the Support Points allocation system work?',
  (SELECT id FROM users LIMIT 1),
  'question',
  ARRAY['social-economy', 'cooperative-technology']::text[],
  'open',
  false,
  false,
  8,
  4,
  NOW() - INTERVAL '5 hours'
);

-- Sample Topic 3: Proposal Exploration
INSERT INTO topics (
  id,
  title,
  description,
  author_id,
  category,
  tags,
  status,
  is_pinned,
  is_locked,
  post_count,
  participant_count,
  last_activity_at
) VALUES (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Thinking about a community tool library - thoughts?',
  'What if we had a shared tool library where members could borrow tools instead of everyone buying their own? Looking for feedback before turning this into a formal proposal.',
  (SELECT id FROM users LIMIT 1),
  'proposal',
  ARRAY['social-economy', 'common-wellbeing']::text[],
  'open',
  false,
  false,
  12,
  7,
  NOW() - INTERVAL '1 day'
);

-- Sample Topic 4: Deliberation
INSERT INTO topics (
  id,
  title,
  description,
  author_id,
  category,
  tags,
  status,
  is_pinned,
  is_locked,
  post_count,
  participant_count,
  last_activity_at
) VALUES (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'How should we approach moderation in our community?',
  'Let''s discuss empathy-first moderation practices and develop guidelines that preserve minority voices while maintaining a healthy community culture.',
  (SELECT id FROM users LIMIT 1),
  'deliberation',
  ARRAY['collective-governance', 'community-connection']::text[],
  'open',
  false,
  false,
  24,
  11,
  NOW() - INTERVAL '3 days'
);

-- Sample Topic 5: Announcement
INSERT INTO topics (
  id,
  title,
  description,
  author_id,
  category,
  tags,
  status,
  is_pinned,
  is_locked,
  post_count,
  participant_count,
  last_activity_at
) VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'Forum Module Now Live - API Routes & Topic Listing Available!',
  'The forum module has reached 50% implementation. You can now browse topics, filter by category, and see real-time discussions. Topic creation and post replies coming in the next phase!',
  (SELECT id FROM users LIMIT 1),
  'announcement',
  ARRAY['cooperative-technology']::text[],
  'open',
  true, -- Pinned
  false,
  2,
  1,
  NOW() - INTERVAL '30 minutes'
);

-- Sample Topic 6: Resolved Question
INSERT INTO topics (
  id,
  title,
  description,
  author_id,
  category,
  tags,
  status,
  is_pinned,
  is_locked,
  post_count,
  participant_count,
  last_activity_at
) VALUES (
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'What''s the difference between Support Points (SP) and Reputation Points (RP)?',
  'Can someone explain how these two currency systems work and when to use each?',
  (SELECT id FROM users LIMIT 1),
  'question',
  ARRAY['social-economy']::text[],
  'resolved',
  false,
  false,
  6,
  4,
  NOW() - INTERVAL '5 days'
);
