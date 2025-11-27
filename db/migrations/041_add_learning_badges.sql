-- Migration: Add learning badges
-- Module: onboarding
-- Purpose: Add badge definitions for learning path achievements

-- Learning-related badges
INSERT INTO badges (id, name, description, icon, category, criteria) VALUES
  -- Milestone badges
  ('first-lesson', 'First Steps', 'Completed your first lesson', '📖', 'milestone', '{"event_types": ["lesson_completed"], "threshold": 1}'),
  ('path-complete', 'Path Finder', 'Completed your first learning path', '🛤️', 'milestone', '{"event_types": ["path_completed"], "threshold": 1}'),
  ('all-paths', 'Master Learner', 'Completed all available learning paths', '🎓', 'milestone', '{"event_types": ["all_paths_completed"], "threshold": 1}'),

  -- Achievement badges
  ('quiz-ace', 'Quiz Ace', 'Passed 5 quizzes', '✅', 'contribution', '{"event_types": ["quiz_passed"], "threshold": 5}'),
  ('perfect-score', 'Perfect Scholar', 'Achieved 100% on 3 quizzes', '💯', 'contribution', '{"event_types": ["quiz_perfect"], "threshold": 3}'),
  ('lesson-streak', 'Dedicated Learner', 'Completed 10 lessons', '🔥', 'contribution', '{"event_types": ["lesson_completed"], "threshold": 10}'),
  ('lesson-master', 'Lesson Master', 'Completed 25 lessons', '⭐', 'contribution', '{"event_types": ["lesson_completed"], "threshold": 25}'),

  -- Special badges
  ('quick-learner', 'Quick Learner', 'Completed a path within 24 hours of starting', '⚡', 'special', '{"event_types": ["path_completed_fast"], "threshold": 1}'),
  ('knowledge-sharer', 'Knowledge Sharer', 'Recommended a learning path to another member', '💡', 'special', '{"event_types": ["path_shared"], "threshold": 1}')
ON CONFLICT (id) DO NOTHING;

-- Create trigger function to award badges on learning events
CREATE OR REPLACE FUNCTION check_learning_badges() RETURNS TRIGGER AS $$
DECLARE
  lesson_count INTEGER;
  quiz_pass_count INTEGER;
  quiz_perfect_count INTEGER;
  path_count INTEGER;
  total_paths INTEGER;
  badge_exists BOOLEAN;
BEGIN
  -- Check lesson-based badges for lesson progress
  IF TG_TABLE_NAME = 'onboarding_user_lesson_progress' AND NEW.status = 'completed' THEN
    -- Count completed lessons for this user
    SELECT COUNT(*) INTO lesson_count
    FROM onboarding_user_lesson_progress
    WHERE user_id = NEW.user_id AND status = 'completed';

    -- First lesson badge
    IF lesson_count = 1 THEN
      INSERT INTO member_badges (member_id, badge_id)
      VALUES (NEW.user_id, 'first-lesson')
      ON CONFLICT (member_id, badge_id) DO NOTHING;
    END IF;

    -- Lesson streak (10 lessons)
    IF lesson_count >= 10 THEN
      INSERT INTO member_badges (member_id, badge_id)
      VALUES (NEW.user_id, 'lesson-streak')
      ON CONFLICT (member_id, badge_id) DO NOTHING;
    END IF;

    -- Lesson master (25 lessons)
    IF lesson_count >= 25 THEN
      INSERT INTO member_badges (member_id, badge_id)
      VALUES (NEW.user_id, 'lesson-master')
      ON CONFLICT (member_id, badge_id) DO NOTHING;
    END IF;
  END IF;

  -- Check path completion badge
  IF TG_TABLE_NAME = 'onboarding_user_path_progress' AND NEW.status = 'completed' THEN
    -- Count completed paths for this user
    SELECT COUNT(*) INTO path_count
    FROM onboarding_user_path_progress
    WHERE user_id = NEW.user_id AND status = 'completed';

    -- Count total active paths
    SELECT COUNT(*) INTO total_paths
    FROM onboarding_learning_paths
    WHERE is_active = TRUE;

    -- First path completed
    IF path_count = 1 THEN
      INSERT INTO member_badges (member_id, badge_id)
      VALUES (NEW.user_id, 'path-complete')
      ON CONFLICT (member_id, badge_id) DO NOTHING;
    END IF;

    -- All paths completed
    IF path_count >= total_paths AND total_paths > 0 THEN
      INSERT INTO member_badges (member_id, badge_id)
      VALUES (NEW.user_id, 'all-paths')
      ON CONFLICT (member_id, badge_id) DO NOTHING;
    END IF;

    -- Quick learner (completed path within 24 hours)
    IF NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
      IF (NEW.completed_at - NEW.started_at) < INTERVAL '24 hours' THEN
        INSERT INTO member_badges (member_id, badge_id)
        VALUES (NEW.user_id, 'quick-learner')
        ON CONFLICT (member_id, badge_id) DO NOTHING;
      END IF;
    END IF;
  END IF;

  -- Check quiz badges
  IF TG_TABLE_NAME = 'onboarding_user_quiz_attempts' THEN
    -- Count passed quizzes
    SELECT COUNT(DISTINCT quiz_id) INTO quiz_pass_count
    FROM onboarding_user_quiz_attempts
    WHERE user_id = NEW.user_id AND passed = TRUE;

    -- Count perfect scores (100%)
    SELECT COUNT(*) INTO quiz_perfect_count
    FROM onboarding_user_quiz_attempts
    WHERE user_id = NEW.user_id AND score = 100;

    -- Quiz ace (5 passed)
    IF quiz_pass_count >= 5 THEN
      INSERT INTO member_badges (member_id, badge_id)
      VALUES (NEW.user_id, 'quiz-ace')
      ON CONFLICT (member_id, badge_id) DO NOTHING;
    END IF;

    -- Perfect scholar (3 perfect scores)
    IF quiz_perfect_count >= 3 THEN
      INSERT INTO member_badges (member_id, badge_id)
      VALUES (NEW.user_id, 'perfect-score')
      ON CONFLICT (member_id, badge_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for badge checking
DROP TRIGGER IF EXISTS trg_check_lesson_badges ON onboarding_user_lesson_progress;
CREATE TRIGGER trg_check_lesson_badges
  AFTER INSERT OR UPDATE ON onboarding_user_lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION check_learning_badges();

DROP TRIGGER IF EXISTS trg_check_path_badges ON onboarding_user_path_progress;
CREATE TRIGGER trg_check_path_badges
  AFTER INSERT OR UPDATE ON onboarding_user_path_progress
  FOR EACH ROW
  EXECUTE FUNCTION check_learning_badges();

DROP TRIGGER IF EXISTS trg_check_quiz_badges ON onboarding_user_quiz_attempts;
CREATE TRIGGER trg_check_quiz_badges
  AFTER INSERT ON onboarding_user_quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION check_learning_badges();

-- Add comments
COMMENT ON FUNCTION check_learning_badges() IS 'Automatically awards badges based on learning achievements';
