-- Migration: 040_add_onboarding_learning_paths.sql
-- Learning Paths, Lessons, Quizzes for enhanced onboarding
-- Supports admin-managed educational content with RP rewards

-- ============================================================
-- Table: onboarding_learning_paths
-- Collections of lessons organized by topic
-- ============================================================
CREATE TABLE IF NOT EXISTS onboarding_learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  icon VARCHAR(10),  -- emoji
  category VARCHAR(50) CHECK (category IN ('getting-started', 'governance', 'economy', 'community', 'technology', 'culture')),
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  rp_reward INT DEFAULT 50,  -- RP for completing entire path
  estimated_minutes INT DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for paths
CREATE INDEX IF NOT EXISTS idx_learning_paths_active ON onboarding_learning_paths(is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_learning_paths_category ON onboarding_learning_paths(category);

-- ============================================================
-- Table: onboarding_lessons
-- Individual lessons within learning paths
-- ============================================================
CREATE TABLE IF NOT EXISTS onboarding_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES onboarding_learning_paths(id) ON DELETE CASCADE,
  slug VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('markdown', 'structured', 'video')),
  content JSONB NOT NULL DEFAULT '{}',
  order_index INT DEFAULT 0,
  duration_minutes INT DEFAULT 5,
  rp_reward INT DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(path_id, slug)
);

-- Indexes for lessons
CREATE INDEX IF NOT EXISTS idx_lessons_path ON onboarding_lessons(path_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_active ON onboarding_lessons(is_active);

-- ============================================================
-- Table: onboarding_quizzes
-- Assessments attached to lessons or standalone
-- ============================================================
CREATE TABLE IF NOT EXISTS onboarding_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES onboarding_lessons(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  passing_score INT DEFAULT 70,  -- percentage required to pass
  rp_reward INT DEFAULT 25,
  max_attempts INT DEFAULT 3,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quizzes by lesson
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson ON onboarding_quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_active ON onboarding_quizzes(is_active);

-- ============================================================
-- Table: onboarding_quiz_questions
-- Questions within quizzes
-- ============================================================
CREATE TABLE IF NOT EXISTS onboarding_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES onboarding_quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'multi_select')),
  options JSONB NOT NULL DEFAULT '[]',  -- [{id, text, isCorrect}]
  explanation TEXT,  -- Shown after answering
  order_index INT DEFAULT 0,
  points INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for questions by quiz
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON onboarding_quiz_questions(quiz_id, order_index);

-- ============================================================
-- Table: onboarding_user_lesson_progress
-- User's lesson completion tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS onboarding_user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES onboarding_lessons(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('started', 'completed', 'skipped')) DEFAULT 'started',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  rp_awarded INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Index for user progress
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user ON onboarding_user_lesson_progress(user_id, status);

-- ============================================================
-- Table: onboarding_user_path_progress
-- User's learning path completion tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS onboarding_user_path_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  path_id UUID NOT NULL REFERENCES onboarding_learning_paths(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('started', 'completed')) DEFAULT 'started',
  lessons_completed INT DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  rp_awarded INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, path_id)
);

-- Index for user path progress
CREATE INDEX IF NOT EXISTS idx_user_path_progress_user ON onboarding_user_path_progress(user_id, status);

-- ============================================================
-- Table: onboarding_user_quiz_attempts
-- User's quiz attempts and scores
-- ============================================================
CREATE TABLE IF NOT EXISTS onboarding_user_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES onboarding_quizzes(id) ON DELETE CASCADE,
  attempt_number INT NOT NULL DEFAULT 1,
  score INT NOT NULL,  -- percentage
  answers JSONB NOT NULL DEFAULT '{}',  -- {questionId: selectedOptionId(s)}
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  rp_awarded INT DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quiz attempts
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON onboarding_user_quiz_attempts(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_passed ON onboarding_user_quiz_attempts(user_id, passed);

-- ============================================================
-- Add RP earning rules for learning system
-- ============================================================
INSERT INTO rp_earning_rules (event_type, rp_amount, active) VALUES
  ('lesson_completed', 10, true),
  ('quiz_passed', 25, true),
  ('quiz_perfect_score', 10, true),  -- Bonus for 100%
  ('learning_path_completed', 50, true),
  ('all_paths_completed', 100, true)  -- Bonus for completing all paths
ON CONFLICT (event_type) DO UPDATE SET
  rp_amount = EXCLUDED.rp_amount,
  active = EXCLUDED.active;

-- ============================================================
-- Seed initial learning paths
-- ============================================================
INSERT INTO onboarding_learning_paths (id, slug, title, description, icon, category, order_index, rp_reward, estimated_minutes)
VALUES
  ('00000000-0000-0000-0001-000000000001',
   'getting-started',
   'Getting Started with TogetherOS',
   'Learn the basics of how TogetherOS works and how to get the most out of your membership',
   '🚀',
   'getting-started',
   1,
   50,
   20),

  ('00000000-0000-0000-0001-000000000002',
   'governance-101',
   'Governance 101',
   'Understand consent-based governance and how decisions are made collectively',
   '🏛️',
   'governance',
   2,
   50,
   25),

  ('00000000-0000-0000-0001-000000000003',
   'social-economy',
   'Social Economy Basics',
   'Learn about Support Points, Reward Points, and how our cooperative economy works',
   '💰',
   'economy',
   3,
   50,
   30),

  ('00000000-0000-0000-0001-000000000004',
   'community-building',
   'Building Community',
   'Discover how to connect with others, join groups, and strengthen local ties',
   '🤝',
   'community',
   4,
   50,
   20)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  order_index = EXCLUDED.order_index,
  rp_reward = EXCLUDED.rp_reward,
  estimated_minutes = EXCLUDED.estimated_minutes,
  updated_at = NOW();

-- ============================================================
-- Seed lessons for "Getting Started" path
-- ============================================================
INSERT INTO onboarding_lessons (id, path_id, slug, title, description, content_type, content, order_index, duration_minutes, rp_reward)
VALUES
  -- Lesson 1: Welcome
  ('00000000-0000-0000-0002-000000000001',
   '00000000-0000-0000-0001-000000000001',
   'welcome-to-togetheros',
   'Welcome to TogetherOS',
   'An introduction to our cooperation-first operating system',
   'structured',
   '{
     "format": "structured",
     "structured": {
       "introduction": "TogetherOS is a cooperation-first operating system designed to help communities self-organize through transparent, consent-based governance and fair social economy.",
       "keyPoints": [
         "Power is shared, not concentrated",
         "Decisions are made by consent, not majority rule",
         "Everyone contributes and benefits fairly",
         "Small, verifiable steps build trust"
       ],
       "example": "Instead of one person making decisions for everyone, TogetherOS helps groups make decisions together where everyone''s voice matters.",
       "reflection": "What does cooperation mean to you? How might shared decision-making change your community?",
       "nextSteps": "Continue to learn about the 8 Cooperation Paths that organize action in TogetherOS."
     }
   }',
   1,
   3,
   10),

  -- Lesson 2: Cooperation Paths
  ('00000000-0000-0000-0002-000000000002',
   '00000000-0000-0000-0001-000000000001',
   'cooperation-paths',
   'The 8 Cooperation Paths',
   'Understanding how cooperative action is organized',
   'structured',
   '{
     "format": "structured",
     "structured": {
       "introduction": "TogetherOS organizes cooperative action into 8 interconnected paths. Each path represents a domain of community life where cooperation can flourish.",
       "keyPoints": [
         "Collaborative Education - Learning together",
         "Social Economy - Fair exchange and mutual aid",
         "Common Wellbeing - Health and care networks",
         "Cooperative Technology - Open source and ethical tech",
         "Collective Governance - Consent-based decisions",
         "Community Connection - Local relationships",
         "Collaborative Media - Independent storytelling",
         "Common Planet - Sustainability and climate action"
       ],
       "example": "A community garden project might span Common Planet (growing food), Community Connection (neighbors working together), and Collaborative Education (sharing gardening knowledge).",
       "reflection": "Which paths resonate most with your interests and skills?",
       "nextSteps": "Explore each path to find where your energy fits best."
     }
   }',
   2,
   5,
   10),

  -- Lesson 3: Your Profile
  ('00000000-0000-0000-0002-000000000003',
   '00000000-0000-0000-0001-000000000001',
   'your-profile',
   'Setting Up Your Profile',
   'How to present yourself and connect with others',
   'markdown',
   '{
     "format": "markdown",
     "markdown": "## Your Profile Matters\\n\\nYour profile helps the community understand who you are and how to connect with you.\\n\\n### Key Elements\\n\\n1. **Name** - How you want to be known\\n2. **Location** - Helps connect you with local groups\\n3. **Cooperation Paths** - Shows your interests\\n4. **Skills** - What you can offer and want to learn\\n\\n### Tips for a Great Profile\\n\\n- Be authentic, not perfect\\n- Share what excites you about cooperation\\n- List both professional and hobby skills\\n- Update as you grow and learn\\n\\n> *Your profile is a living document. It grows with you.*"
   }',
   3,
   4,
   10),

  -- Lesson 4: Earning Rewards
  ('00000000-0000-0000-0002-000000000004',
   '00000000-0000-0000-0001-000000000001',
   'earning-rewards',
   'Earning Reward Points',
   'How RP works and what you can do with it',
   'structured',
   '{
     "format": "structured",
     "structured": {
       "introduction": "Reward Points (RP) recognize your contributions to the community. They are different from Support Points (SP) which are used for governance.",
       "keyPoints": [
         "Earn RP by completing lessons, challenges, and contributing",
         "RP tracks your engagement and growth",
         "Higher RP unlocks badges and recognition",
         "RP is not currency - it''s a measure of participation"
       ],
       "example": "Completing this lesson earns you 10 RP. Finishing a daily challenge earns 25 RP. Inviting a friend who joins earns 50 RP.",
       "reflection": "What activities would you enjoy that also earn RP?",
       "nextSteps": "Complete this learning path to earn the path completion bonus!"
     }
   }',
   4,
   3,
   10)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  order_index = EXCLUDED.order_index,
  duration_minutes = EXCLUDED.duration_minutes,
  rp_reward = EXCLUDED.rp_reward,
  updated_at = NOW();

-- ============================================================
-- Seed a quiz for the Getting Started path
-- ============================================================
INSERT INTO onboarding_quizzes (id, lesson_id, title, description, passing_score, rp_reward, max_attempts)
VALUES
  ('00000000-0000-0000-0003-000000000001',
   '00000000-0000-0000-0002-000000000004',
   'Getting Started Quiz',
   'Test your knowledge of TogetherOS basics',
   70,
   25,
   3)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  passing_score = EXCLUDED.passing_score,
  rp_reward = EXCLUDED.rp_reward,
  updated_at = NOW();

-- ============================================================
-- Seed quiz questions
-- ============================================================
INSERT INTO onboarding_quiz_questions (id, quiz_id, question_text, question_type, options, explanation, order_index, points)
VALUES
  ('00000000-0000-0000-0004-000000000001',
   '00000000-0000-0000-0003-000000000001',
   'How are decisions made in TogetherOS?',
   'multiple_choice',
   '[
     {"id": "a", "text": "By majority vote", "isCorrect": false},
     {"id": "b", "text": "By the leader or admin", "isCorrect": false},
     {"id": "c", "text": "By consent, where objections improve proposals", "isCorrect": true},
     {"id": "d", "text": "Randomly", "isCorrect": false}
   ]',
   'TogetherOS uses consent-based governance where decisions are made when there are no principled objections. Objections help improve proposals rather than block them.',
   1,
   1),

  ('00000000-0000-0000-0004-000000000002',
   '00000000-0000-0000-0003-000000000001',
   'How many Cooperation Paths are there in TogetherOS?',
   'multiple_choice',
   '[
     {"id": "a", "text": "4", "isCorrect": false},
     {"id": "b", "text": "6", "isCorrect": false},
     {"id": "c", "text": "8", "isCorrect": true},
     {"id": "d", "text": "10", "isCorrect": false}
   ]',
   'There are 8 Cooperation Paths: Education, Economy, Wellbeing, Technology, Governance, Community, Media, and Planet.',
   2,
   1),

  ('00000000-0000-0000-0004-000000000003',
   '00000000-0000-0000-0003-000000000001',
   'Reward Points (RP) are used for governance voting.',
   'true_false',
   '[
     {"id": "true", "text": "True", "isCorrect": false},
     {"id": "false", "text": "False", "isCorrect": true}
   ]',
   'False! Support Points (SP) are used for governance. Reward Points (RP) track engagement and contributions but are not used for voting.',
   3,
   1),

  ('00000000-0000-0000-0004-000000000004',
   '00000000-0000-0000-0003-000000000001',
   'Which of these are key principles of TogetherOS? (Select all that apply)',
   'multi_select',
   '[
     {"id": "a", "text": "Power is shared, not concentrated", "isCorrect": true},
     {"id": "b", "text": "The loudest voice wins", "isCorrect": false},
     {"id": "c", "text": "Small, verifiable steps build trust", "isCorrect": true},
     {"id": "d", "text": "Competition drives progress", "isCorrect": false}
   ]',
   'TogetherOS is built on cooperation, shared power, and building trust through small, verifiable steps. Competition and dominance are not part of our model.',
   4,
   2)
ON CONFLICT (id) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  options = EXCLUDED.options,
  explanation = EXCLUDED.explanation,
  order_index = EXCLUDED.order_index,
  points = EXCLUDED.points;
