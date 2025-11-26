-- Migration: 039_add_gamification_microlessons.sql
-- Microlessons & Onboarding Suggestions for gamification system
-- Supports 3 content formats: structured, markdown, media

-- ============================================================
-- Table: gamification_microlessons
-- Educational content linked to challenges
-- ============================================================
CREATE TABLE IF NOT EXISTS gamification_microlessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('social', 'contribution', 'exploration', 'growth')),
  content JSONB NOT NULL DEFAULT '{}',
  rp_reward INTEGER NOT NULL DEFAULT 15,
  estimated_minutes INTEGER NOT NULL DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active microlessons
CREATE INDEX IF NOT EXISTS idx_microlessons_active ON gamification_microlessons(is_active);
CREATE INDEX IF NOT EXISTS idx_microlessons_category ON gamification_microlessons(category);

-- ============================================================
-- Table: gamification_user_microlessons
-- User's microlesson completion records
-- ============================================================
CREATE TABLE IF NOT EXISTS gamification_user_microlessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  microlesson_id UUID NOT NULL REFERENCES gamification_microlessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rp_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, microlesson_id)
);

-- Index for user completion lookups
CREATE INDEX IF NOT EXISTS idx_user_microlessons_user ON gamification_user_microlessons(user_id);

-- ============================================================
-- Table: gamification_onboarding_suggestions
-- Links challenges with microlessons for onboarding flow
-- ============================================================
CREATE TABLE IF NOT EXISTS gamification_onboarding_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES gamification_challenge_definitions(id) ON DELETE CASCADE,
  microlesson_id UUID REFERENCES gamification_microlessons(id) ON DELETE SET NULL,
  suggested_order INTEGER NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('social', 'contribution', 'exploration', 'growth')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for ordered suggestions
CREATE INDEX IF NOT EXISTS idx_onboarding_suggestions_order ON gamification_onboarding_suggestions(suggested_order);
CREATE INDEX IF NOT EXISTS idx_onboarding_suggestions_active ON gamification_onboarding_suggestions(is_active);

-- ============================================================
-- Add microlesson_id column to challenge_definitions
-- ============================================================
ALTER TABLE gamification_challenge_definitions
  ADD COLUMN IF NOT EXISTS microlesson_id UUID REFERENCES gamification_microlessons(id) ON DELETE SET NULL;

-- ============================================================
-- Seed microlessons (10 onboarding microlessons)
-- ============================================================
INSERT INTO gamification_microlessons (id, title, description, category, content, rp_reward, estimated_minutes, sort_order)
VALUES
  -- Day 1: Welcome Post microlesson
  ('11111111-1111-1111-1111-111111111101',
   'Making a Great Introduction',
   'Learn how to introduce yourself effectively in a cooperative community',
   'social',
   '{"format": "structured", "structured": {"introduction": "Your first message sets the tone for your community journey. A warm, authentic introduction helps others connect with you.", "keyPoints": ["Share what cooperation means to you", "Mention skills you want to offer or learn", "Express what community aspect excites you most"], "example": "Hi everyone! I''m excited to join. I work in education and believe in collective problem-solving. I can help with curriculum design and want to learn about timebanking!", "reflection": "Think about what makes you unique and what you hope to contribute.", "nextSteps": "Draft your intro message focusing on authenticity over perfection."}}',
   15, 3, 1),

  -- Day 2: Cooperation Paths microlesson
  ('11111111-1111-1111-1111-111111111102',
   'Understanding Cooperation Paths',
   'Explore the 8 cooperation paths and how they connect',
   'exploration',
   '{"format": "structured", "structured": {"introduction": "TogetherOS organizes cooperative action into 8 interconnected paths. Understanding these helps you find where your energy fits best.", "keyPoints": ["Collaborative Education: Learning together", "Social Economy: Fair exchange systems", "Collective Governance: Decisions by consent", "Community Connection: Local relationships"], "example": "Someone passionate about gardening might start in Common Planet, connect with Community Connection for local events, and use Collaborative Education to share knowledge.", "reflection": "Which path resonates most with your current interests?", "nextSteps": "Explore each path and note 2-3 that align with your goals."}}',
   15, 4, 2),

  -- Day 3: Skills Profile microlesson
  ('11111111-1111-1111-1111-111111111103',
   'Building Your Skills Profile',
   'How to showcase and offer your skills effectively',
   'growth',
   '{"format": "structured", "structured": {"introduction": "Your skills profile helps the community match you with opportunities to help and learn. Be specific and honest about what you can offer.", "keyPoints": ["List both professional and hobby skills", "Include skill levels (beginner to expert)", "Note if you can teach or want to learn", "Update regularly as you grow"], "example": "Instead of just ''cooking'', try: ''Mediterranean cooking (intermediate, can teach basics), fermentation (beginner, eager to learn more)''", "reflection": "What skills do you use daily that others might not know you have?", "nextSteps": "List 5 skills across different categories with honest self-assessments."}}',
   15, 3, 3),

  -- Day 4: Community Engagement microlesson
  ('11111111-1111-1111-1111-111111111104',
   'Engaging Thoughtfully',
   'How to contribute meaningful comments and discussions',
   'social',
   '{"format": "structured", "structured": {"introduction": "Quality engagement builds trust and relationships. A thoughtful comment is more valuable than many quick reactions.", "keyPoints": ["Read the full post before responding", "Add value: share experience, ask questions, or build on ideas", "Be supportive while being honest", "Acknowledge others'' perspectives even when disagreeing"], "example": "Instead of ''Great idea!'', try: ''This resonates with my experience in X. Have you considered Y? I''d love to help with Z.''", "reflection": "Think of a time someone''s comment really helped you. What made it valuable?", "nextSteps": "Find 2 posts that genuinely interest you and craft thoughtful responses."}}',
   15, 4, 4),

  -- Day 5: Invitations microlesson
  ('11111111-1111-1111-1111-111111111105',
   'Growing Together Through Invitations',
   'Why and how to invite people who will thrive here',
   'social',
   '{"format": "structured", "structured": {"introduction": "Invitations are about quality over quantity. Bringing in people who share cooperative values strengthens the whole community.", "keyPoints": ["Think of people who value collaboration", "Explain what makes TogetherOS different", "Share your genuine experience", "Be ready to mentor them through onboarding"], "example": "''Hey [Name], I joined a community called TogetherOS that''s about practical cooperation. I thought of you because of how you organized that neighborhood cleanup. Want to check it out?''", "reflection": "Who in your life demonstrates cooperative values even if they don''t call it that?", "nextSteps": "Identify 2-3 people you think would genuinely benefit and contribute."}}',
   20, 5, 5),

  -- Day 6: Governance microlesson
  ('11111111-1111-1111-1111-111111111106',
   'Participatory Decision Making',
   'Understanding consent-based governance and your role',
   'contribution',
   '{"format": "structured", "structured": {"introduction": "In TogetherOS, decisions are made through consent, not majority rule. Your voice matters, and objections drive better solutions.", "keyPoints": ["Proposals seek consent, not unanimous agreement", "Valid objections improve proposals", "Everyone affected has a voice", "Minority reports preserve dissent for future learning"], "example": "When reviewing a proposal, ask: ''Can I live with this? Do I have a principled objection that could improve it?'' An objection like ''this excludes X group'' is valid and helps.", "reflection": "How is consent-based governance different from voting?", "nextSteps": "Review an active proposal and identify what you''d want to understand better."}}',
   20, 5, 6),

  -- Day 7: Journey Completion microlesson
  ('11111111-1111-1111-1111-111111111107',
   'Your Cooperative Journey Begins',
   'Reflecting on your first week and planning ahead',
   'growth',
   '{"format": "structured", "structured": {"introduction": "Congratulations on completing your first week! This is just the beginning of your cooperative journey.", "keyPoints": ["Celebrate what you''ve accomplished", "Identify areas you want to explore deeper", "Set intentions for ongoing participation", "Remember: progress over perfection"], "example": "''This week I learned about timebanking and made 2 new connections. Next week I want to attend a working group meeting and offer my design skills.''", "reflection": "What surprised you most about this community?", "nextSteps": "Write 3 intentions for your second week and share one with a community member."}}',
   25, 5, 7),

  -- Bonus microlessons for daily challenges
  ('11111111-1111-1111-1111-111111111108',
   'The Art of Mutual Aid',
   'How giving and receiving help strengthens communities',
   'social',
   '{"format": "markdown", "markdown": "## Mutual Aid: Beyond Charity\\n\\nMutual aid is different from charity. It''s about **reciprocal care** where everyone gives and receives.\\n\\n### Key Principles\\n\\n1. **Everyone has something to offer** - Your time, skills, or simply presence\\n2. **Receiving is as important as giving** - It builds trust and connection\\n3. **No scorekeeping** - Help flows naturally, not transactionally\\n\\n### In Practice\\n\\nWhen you help someone:\\n- You''re not ''above'' them\\n- You''re building a web of interdependence\\n- You might need help tomorrow\\n\\n> *''Solidarity is not a matter of altruism. Solidarity comes from the inability to tolerate the affront to our own integrity of passive or active collaboration in the oppression of others.''* — Aurora Levins Morales"}',
   15, 4, 8),

  ('11111111-1111-1111-1111-111111111109',
   'Effective Resource Sharing',
   'How to share knowledge and resources that actually help',
   'contribution',
   '{"format": "structured", "structured": {"introduction": "Not all sharing is equal. Learning to share resources effectively multiplies your impact.", "keyPoints": ["Context matters: explain why it''s useful", "Consider accessibility (language, format, cost)", "Credit original creators", "Follow up to see if it helped"], "example": "Instead of just posting a link, try: ''I found this guide on community organizing really practical. Section 3 on meeting facilitation solved a problem my group had. Free PDF, 20 pages, easy read.''", "reflection": "Think of a resource that changed how you think. What made it impactful?", "nextSteps": "Share one resource this week with full context about why it matters."}}',
   15, 3, 9),

  ('11111111-1111-1111-1111-111111111110',
   'Finding Your Groups',
   'How to choose and engage with community groups',
   'exploration',
   '{"format": "structured", "structured": {"introduction": "Groups are where cooperation happens in practice. Finding the right ones accelerates your impact and satisfaction.", "keyPoints": ["Start with 2-3 groups max (quality over quantity)", "Look for groups that align with your skills AND interests", "Check activity level before joining", "Introduce yourself when you join"], "example": "If you''re passionate about urban farming: join the Common Planet working group (aligned), check their recent activity (active last week), and post an intro explaining your interest and what you can contribute.", "reflection": "What draws you to join groups? Learning, contributing, or connection?", "nextSteps": "Browse available groups and identify 2 that match your priorities."}}',
   15, 4, 10)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  rp_reward = EXCLUDED.rp_reward,
  estimated_minutes = EXCLUDED.estimated_minutes,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- ============================================================
-- Link microlessons to first-week challenges
-- ============================================================
UPDATE gamification_challenge_definitions
SET microlesson_id = '11111111-1111-1111-1111-111111111101'
WHERE name = 'Welcome Post' AND is_first_week = true;

UPDATE gamification_challenge_definitions
SET microlesson_id = '11111111-1111-1111-1111-111111111102'
WHERE name = 'Explore Cooperation Paths' AND is_first_week = true;

UPDATE gamification_challenge_definitions
SET microlesson_id = '11111111-1111-1111-1111-111111111103'
WHERE name = 'Share Your Skills' AND is_first_week = true;

UPDATE gamification_challenge_definitions
SET microlesson_id = '11111111-1111-1111-1111-111111111104'
WHERE name = 'Connect with Others' AND is_first_week = true;

UPDATE gamification_challenge_definitions
SET microlesson_id = '11111111-1111-1111-1111-111111111105'
WHERE name = 'Invite a Friend' AND is_first_week = true;

UPDATE gamification_challenge_definitions
SET microlesson_id = '11111111-1111-1111-1111-111111111106'
WHERE name = 'Engage with Governance' AND is_first_week = true;

UPDATE gamification_challenge_definitions
SET microlesson_id = '11111111-1111-1111-1111-111111111107'
WHERE name = 'Complete Your Journey' AND is_first_week = true;

-- Link some microlessons to daily challenges
UPDATE gamification_challenge_definitions
SET microlesson_id = '11111111-1111-1111-1111-111111111108'
WHERE name = 'Helpful Hand' AND is_first_week = false;

UPDATE gamification_challenge_definitions
SET microlesson_id = '11111111-1111-1111-1111-111111111109'
WHERE name = 'Knowledge Sharer' AND is_first_week = false;

UPDATE gamification_challenge_definitions
SET microlesson_id = '11111111-1111-1111-1111-111111111110'
WHERE name = 'Explorer' AND is_first_week = false;

-- ============================================================
-- Seed onboarding suggestions (10 ordered suggestions)
-- ============================================================
INSERT INTO gamification_onboarding_suggestions (challenge_id, microlesson_id, suggested_order, reason, action_type, category)
SELECT
  c.id,
  c.microlesson_id,
  c.day_number,
  CASE c.day_number
    WHEN 1 THEN 'Start by introducing yourself - it helps others welcome you and find common ground'
    WHEN 2 THEN 'Understanding the cooperation paths helps you find where your energy fits best'
    WHEN 3 THEN 'Sharing your skills helps the community match you with opportunities'
    WHEN 4 THEN 'Engaging with others builds relationships and shows you''re here to participate'
    WHEN 5 THEN 'Inviting others who share your values strengthens the whole community'
    WHEN 6 THEN 'Participating in governance is how we make collective decisions'
    WHEN 7 THEN 'Completing your journey shows commitment and unlocks full participation'
    ELSE 'Part of your onboarding journey'
  END,
  c.action_type,
  c.category
FROM gamification_challenge_definitions c
WHERE c.is_first_week = true
ON CONFLICT DO NOTHING;

-- Add 3 more suggestions from daily challenges
INSERT INTO gamification_onboarding_suggestions (challenge_id, microlesson_id, suggested_order, reason, action_type, category)
SELECT
  c.id,
  c.microlesson_id,
  8,
  'Helping others is at the heart of mutual aid - even small gestures matter',
  c.action_type,
  c.category
FROM gamification_challenge_definitions c
WHERE c.name = 'Helpful Hand'
ON CONFLICT DO NOTHING;

INSERT INTO gamification_onboarding_suggestions (challenge_id, microlesson_id, suggested_order, reason, action_type, category)
SELECT
  c.id,
  c.microlesson_id,
  9,
  'Sharing resources multiplies everyone''s knowledge and capability',
  c.action_type,
  c.category
FROM gamification_challenge_definitions c
WHERE c.name = 'Knowledge Sharer'
ON CONFLICT DO NOTHING;

INSERT INTO gamification_onboarding_suggestions (challenge_id, microlesson_id, suggested_order, reason, action_type, category)
SELECT
  c.id,
  c.microlesson_id,
  10,
  'Exploring groups helps you find your community within the community',
  c.action_type,
  c.category
FROM gamification_challenge_definitions c
WHERE c.name = 'Explorer'
ON CONFLICT DO NOTHING;

-- ============================================================
-- Add RP earning rules for microlesson completion
-- ============================================================
INSERT INTO rp_earning_rules (event_type, rp_amount, active) VALUES
  ('microlesson_completed', 15, true),
  ('microlesson_bonus', 5, true)
ON CONFLICT (event_type) DO NOTHING;
