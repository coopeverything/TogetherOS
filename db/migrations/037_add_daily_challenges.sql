-- Migration: 037_add_daily_challenges.sql
-- Daily Challenges & First-Week Journey tables
-- Part of Gamification Phase 3

-- Challenge definitions (admin-configurable templates)
CREATE TABLE IF NOT EXISTS gamification_challenge_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('social', 'contribution', 'exploration', 'growth')),
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  rp_reward INTEGER NOT NULL DEFAULT 25,
  action_type VARCHAR(50) NOT NULL,
  action_target JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_first_week BOOLEAN DEFAULT false,
  day_number INTEGER, -- For first-week challenges (1-7)
  icon VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User's assigned challenges
CREATE TABLE IF NOT EXISTS gamification_user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES gamification_challenge_definitions(id) ON DELETE CASCADE,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  completed_at TIMESTAMPTZ,
  progress JSONB DEFAULT '{}',
  rp_awarded INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id, assigned_date)
);

-- First-week journey progress
CREATE TABLE IF NOT EXISTS gamification_first_week_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_day INTEGER NOT NULL DEFAULT 1,
  completed_days INTEGER[] DEFAULT '{}',
  total_rp_earned INTEGER DEFAULT 0,
  streak_bonus_rp INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_date ON gamification_user_challenges(user_id, assigned_date);
CREATE INDEX IF NOT EXISTS idx_user_challenges_status ON gamification_user_challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenge_definitions_active ON gamification_challenge_definitions(is_active);
CREATE INDEX IF NOT EXISTS idx_challenge_definitions_first_week ON gamification_challenge_definitions(is_first_week, day_number);

-- Seed first-week challenges
INSERT INTO gamification_challenge_definitions (name, description, category, difficulty, rp_reward, action_type, action_target, is_first_week, day_number, icon)
VALUES
  ('Welcome Post', 'Introduce yourself to the community', 'social', 'easy', 25, 'post_message', '{"count": 1}', true, 1, 'wave'),
  ('Explore Cooperation Paths', 'View all 8 cooperation paths', 'exploration', 'easy', 20, 'view_paths', '{"count": 8}', true, 2, 'compass'),
  ('Share Your Skills', 'Add at least 3 skills to your profile', 'growth', 'easy', 30, 'add_skills', '{"count": 3}', true, 3, 'star'),
  ('Connect with Others', 'Comment on 2 community posts', 'social', 'easy', 25, 'post_comment', '{"count": 2}', true, 4, 'chat'),
  ('Invite a Friend', 'Send an invitation to someone you know', 'social', 'medium', 40, 'send_invitation', '{"count": 1}', true, 5, 'mail'),
  ('Engage with Governance', 'Rate or comment on a proposal', 'contribution', 'medium', 35, 'proposal_interact', '{"count": 1}', true, 6, 'vote'),
  ('Complete Your Journey', 'Finish all first-week challenges', 'growth', 'hard', 50, 'complete_journey', '{}', true, 7, 'trophy')
ON CONFLICT DO NOTHING;

-- Seed daily challenge pool (non-first-week)
INSERT INTO gamification_challenge_definitions (name, description, category, difficulty, rp_reward, action_type, action_target, icon)
VALUES
  ('Daily Contributor', 'Post a message in any group', 'contribution', 'easy', 15, 'post_message', '{"count": 1}', 'pencil'),
  ('Helpful Hand', 'Offer help to a community member', 'social', 'medium', 30, 'offer_help', '{"count": 1}', 'hand'),
  ('Knowledge Sharer', 'Share a resource or link', 'contribution', 'easy', 20, 'share_resource', '{"count": 1}', 'book'),
  ('Discussion Starter', 'Start a new thread or topic', 'social', 'medium', 35, 'start_thread', '{"count": 1}', 'message'),
  ('Welcoming Spirit', 'Welcome a new member', 'social', 'easy', 20, 'welcome_member', '{"count": 1}', 'sparkles'),
  ('Civic Participant', 'Rate 3 proposals', 'contribution', 'medium', 40, 'rate_proposal', '{"count": 3}', 'scale'),
  ('Profile Enhancer', 'Update your profile or add new info', 'growth', 'easy', 15, 'update_profile', '{"count": 1}', 'user'),
  ('Explorer', 'Visit 3 different groups', 'exploration', 'easy', 20, 'visit_group', '{"count": 3}', 'globe'),
  ('Community Builder', 'Join a new group', 'social', 'medium', 30, 'join_group', '{"count": 1}', 'users'),
  ('Streak Keeper', 'Complete any challenge 3 days in a row', 'growth', 'hard', 50, 'complete_journey', '{"streak": 3}', 'fire')
ON CONFLICT DO NOTHING;
