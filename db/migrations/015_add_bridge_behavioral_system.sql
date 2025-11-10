-- Migration 015: Bridge Behavioral AI System
-- Adds tables for member state detection, memory system, and decision loop
-- Dependencies: 001_initial_schema.sql (users table)

-- ===========================
-- Member State Classifications
-- ===========================

CREATE TABLE member_state_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,

  -- Classification result
  state TEXT NOT NULL CHECK (state IN ('decisive', 'hesitant', 'explorer', 'stalled', 'overloaded')),
  confidence NUMERIC(3, 2) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  reasoning TEXT NOT NULL,

  -- Signals used for classification
  signals JSONB NOT NULL, -- MemberStateSignals as JSON

  -- Timestamps
  classified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Indexes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_state_classifications_user ON member_state_classifications(user_id, classified_at DESC);
CREATE INDEX idx_state_classifications_session ON member_state_classifications(session_id);
CREATE INDEX idx_state_classifications_state ON member_state_classifications(state);

-- ===========================
-- Episodic Memory
-- ===========================

CREATE TABLE episodic_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Event type
  event TEXT NOT NULL CHECK (event IN (
    'question_asked', 'recommendation_accepted', 'recommendation_dismissed',
    'action_completed', 'action_abandoned', 'questionnaire_completed',
    'microlesson_viewed', 'challenge_completed'
  )),

  -- Context
  session_id TEXT NOT NULL,
  member_state TEXT NOT NULL CHECK (member_state IN ('decisive', 'hesitant', 'explorer', 'stalled', 'overloaded')),
  location TEXT, -- URL path

  -- Event-specific data
  payload JSONB NOT NULL DEFAULT '{}'::JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_episodic_user_time ON episodic_memory(user_id, created_at DESC);
CREATE INDEX idx_episodic_session ON episodic_memory(session_id);
CREATE INDEX idx_episodic_event ON episodic_memory(event);

-- ===========================
-- Semantic Memory
-- ===========================

CREATE TABLE semantic_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Knowledge classification
  knowledge_type TEXT NOT NULL CHECK (knowledge_type IN (
    'cooperation_path', 'module_usage', 'group_participation',
    'decision_making_pattern', 'communication_style'
  )),

  -- Key-value pair
  key TEXT NOT NULL,
  value JSONB NOT NULL,

  -- Confidence and derivation
  confidence NUMERIC(3, 2) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  derived_from TEXT[] NOT NULL, -- Array of episodic_memory IDs

  -- Timestamps
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one semantic memory per (user, knowledge_type, key)
  UNIQUE(user_id, knowledge_type, key)
);

CREATE INDEX idx_semantic_user ON semantic_memory(user_id);
CREATE INDEX idx_semantic_type ON semantic_memory(knowledge_type);

-- ===========================
-- Bridge Preferences
-- ===========================

CREATE TABLE bridge_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Interaction preferences
  intervention_level TEXT NOT NULL DEFAULT 'balanced' CHECK (intervention_level IN ('minimal', 'balanced', 'proactive')),
  tone_preference TEXT NOT NULL DEFAULT 'empathetic' CHECK (tone_preference IN ('formal', 'casual', 'empathetic')),

  -- Content preferences
  wants_questionnaires BOOLEAN NOT NULL DEFAULT TRUE,
  wants_microlessons BOOLEAN NOT NULL DEFAULT TRUE,
  wants_challenges BOOLEAN NOT NULL DEFAULT TRUE,
  wants_ethics_nudges BOOLEAN NOT NULL DEFAULT TRUE,

  -- Notification preferences
  allows_proactive_recommendations BOOLEAN NOT NULL DEFAULT FALSE,
  allows_reminders BOOLEAN NOT NULL DEFAULT FALSE,

  -- Privacy preferences
  allows_contextual_recommendations BOOLEAN NOT NULL DEFAULT TRUE,
  allows_behavioral_tracking BOOLEAN NOT NULL DEFAULT TRUE,

  -- Timestamps
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- Member Commitments
-- ===========================

CREATE TABLE member_commitments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Commitment type
  type TEXT NOT NULL CHECK (type IN (
    'attend_event', 'complete_action', 'respond_to_discussion',
    'complete_questionnaire', 'complete_challenge'
  )),

  -- Target
  target_id TEXT NOT NULL,
  target_title TEXT NOT NULL,

  -- Timeline
  promised_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  abandoned_at TIMESTAMPTZ,

  -- Reminders
  reminder_sent_at TIMESTAMPTZ,
  reminder_count INTEGER NOT NULL DEFAULT 0 CHECK (reminder_count <= 2),

  -- Status check: commitment is active if not completed or abandoned
  CONSTRAINT check_commitment_status CHECK (
    (completed_at IS NULL AND abandoned_at IS NULL) OR
    (completed_at IS NOT NULL AND abandoned_at IS NULL) OR
    (completed_at IS NULL AND abandoned_at IS NOT NULL)
  )
);

CREATE INDEX idx_commitments_user ON member_commitments(user_id);
CREATE INDEX idx_commitments_active ON member_commitments(user_id) WHERE completed_at IS NULL AND abandoned_at IS NULL;
CREATE INDEX idx_commitments_due ON member_commitments(due_at) WHERE completed_at IS NULL AND abandoned_at IS NULL;

-- ===========================
-- Consent Flags
-- ===========================

CREATE TABLE consent_flags (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Proactive interventions
  can_suggest_unasked BOOLEAN NOT NULL DEFAULT FALSE,
  can_send_reminders BOOLEAN NOT NULL DEFAULT FALSE,
  can_offer_education BOOLEAN NOT NULL DEFAULT TRUE,

  -- Context usage
  can_use_location_context BOOLEAN NOT NULL DEFAULT TRUE,
  can_use_activity_history BOOLEAN NOT NULL DEFAULT TRUE,
  can_use_social_graph BOOLEAN NOT NULL DEFAULT TRUE,

  -- Data retention
  retain_episodic_memory BOOLEAN NOT NULL DEFAULT TRUE,
  retain_semantic_memory BOOLEAN NOT NULL DEFAULT TRUE,

  -- Timestamps
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- Risk Profiles
-- ===========================

CREATE TABLE risk_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,

  -- Risk budget (always 0.3 per session)
  max_risk NUMERIC(3, 2) NOT NULL DEFAULT 0.30 CHECK (max_risk = 0.30),
  consumed_risk NUMERIC(3, 2) NOT NULL DEFAULT 0.00 CHECK (consumed_risk BETWEEN 0 AND 0.30),
  remaining_risk NUMERIC(3, 2) GENERATED ALWAYS AS (max_risk - consumed_risk) STORED,

  -- Intervention history (stored as JSON array)
  interventions JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Session metadata
  session_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_intervention_at TIMESTAMPTZ,

  -- Unique: one risk profile per session
  UNIQUE(session_id)
);

CREATE INDEX idx_risk_profiles_user ON risk_profiles(user_id);
CREATE INDEX idx_risk_profiles_session ON risk_profiles(session_id);

-- ===========================
-- Context Affinity
-- ===========================

CREATE TABLE context_affinity (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Cooperation paths affinity (JSON array)
  cooperation_paths JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Module affinity (JSON array)
  modules JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Group affinity (JSON array)
  groups JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Timestamps
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- Decision Cycles
-- ===========================

CREATE TABLE decision_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,

  -- Decision loop phases (stored as JSONB)
  sense_phase JSONB NOT NULL,
  frame_phase JSONB NOT NULL,
  choose_phase JSONB NOT NULL,
  act_phase JSONB NOT NULL,
  learn_phase JSONB NOT NULL,

  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ NOT NULL,
  duration_ms INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000
  ) STORED
);

CREATE INDEX idx_decision_cycles_user ON decision_cycles(user_id, started_at DESC);
CREATE INDEX idx_decision_cycles_session ON decision_cycles(session_id);

-- ===========================
-- Questionnaires
-- ===========================

CREATE TABLE questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Questionnaire type
  type TEXT NOT NULL UNIQUE CHECK (type IN (
    'location', 'interests', 'experience', 'resources', 'network-size',
    'time-commitment', 'goals', 'obstacles', 'skills', 'values'
  )),

  -- Content
  question TEXT NOT NULL,
  description TEXT,

  -- Answer format
  answer_type TEXT NOT NULL CHECK (answer_type IN ('single_choice', 'multiple_choice', 'text', 'scale')),
  options JSONB, -- Array of {value, label, description?}

  -- Conditional logic
  show_if JSONB, -- {previousAnswers: {type: value}}

  -- Sequencing
  sequence_number INTEGER NOT NULL UNIQUE CHECK (sequence_number BETWEEN 1 AND 10),
  estimated_time_seconds INTEGER NOT NULL CHECK (estimated_time_seconds BETWEEN 30 AND 90),

  -- Reward
  rp_reward INTEGER NOT NULL DEFAULT 10,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- Questionnaire Responses
-- ===========================

CREATE TABLE questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  questionnaire_id UUID NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  questionnaire_type TEXT NOT NULL,

  -- Response
  answer JSONB NOT NULL,

  -- Timing
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (completed_at - started_at))
  ) STORED,

  -- Reward tracking
  rp_awarded INTEGER NOT NULL,

  -- Unique: one response per (user, questionnaire)
  UNIQUE(user_id, questionnaire_id)
);

CREATE INDEX idx_questionnaire_responses_user ON questionnaire_responses(user_id);

-- ===========================
-- Microlessons
-- ===========================

CREATE TABLE microlessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  cooperation_path TEXT NOT NULL,

  -- Lesson content (stored as JSON)
  content JSONB NOT NULL, -- {intro, keyPoint1, keyPoint2, keyPoint3, callToAction}

  -- Metadata
  estimated_time_seconds INTEGER NOT NULL CHECK (estimated_time_seconds BETWEEN 60 AND 90),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),

  -- Related content
  related_questionnaire TEXT, -- QuestionnaireType
  related_challenge UUID, -- BiasChallenge ID

  -- Reward
  rp_reward INTEGER NOT NULL DEFAULT 15,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_microlessons_topic ON microlessons(topic);
CREATE INDEX idx_microlessons_path ON microlessons(cooperation_path);

-- ===========================
-- Bias Challenges
-- ===========================

CREATE TABLE bias_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  title TEXT NOT NULL,
  bias_type TEXT NOT NULL CHECK (bias_type IN ('confirmation', 'groupthink', 'sunk-cost', 'recency', 'availability')),

  scenario TEXT NOT NULL,
  question TEXT NOT NULL,

  -- Options (stored as JSON array)
  options JSONB NOT NULL, -- [{value, label, feedback, isBiased}]

  correct_answer TEXT NOT NULL,
  explanation TEXT NOT NULL,

  -- Reward
  rp_reward INTEGER NOT NULL DEFAULT 20,
  rp_bonus INTEGER NOT NULL DEFAULT 10, -- Bonus for correct answer

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bias_challenges_type ON bias_challenges(bias_type);

-- ===========================
-- Micro-Challenges
-- ===========================

CREATE TABLE micro_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Content
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  action_type TEXT NOT NULL CHECK (action_type IN (
    'post_comment', 'allocate_support_points', 'invite_friend',
    'attend_event', 'create_proposal', 'complete_profile'
  )),

  target_module TEXT NOT NULL,

  -- Completion criteria (stored as JSON)
  completion_criteria JSONB NOT NULL, -- {metric, threshold}

  -- Reward
  rp_reward INTEGER NOT NULL DEFAULT 25,
  rp_bonus INTEGER NOT NULL DEFAULT 15, -- Bonus for quick completion

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_micro_challenges_module ON micro_challenges(target_module);

-- ===========================
-- Educational Content Responses
-- ===========================

CREATE TABLE educational_content_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  content_type TEXT NOT NULL CHECK (content_type IN ('microlesson', 'bias_challenge', 'ethics_nudge', 'micro_challenge')),
  content_id UUID NOT NULL,

  -- Timing
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Response (for challenges)
  response JSONB, -- {answer, correct, feedback}

  -- Reward tracking
  rp_awarded INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_educational_responses_user ON educational_content_responses(user_id, viewed_at DESC);
CREATE INDEX idx_educational_responses_type ON educational_content_responses(content_type);

-- ===========================
-- Content Sequences
-- ===========================

CREATE TABLE content_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,

  -- Sequence (stored as JSON array)
  sequence JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Fatigue tracking
  questionnaire_count INTEGER NOT NULL DEFAULT 0,
  educational_count INTEGER NOT NULL DEFAULT 0,
  alternation_ratio NUMERIC(3, 2) GENERATED ALWAYS AS (
    CASE
      WHEN questionnaire_count = 0 THEN 0
      WHEN educational_count = 0 THEN 999
      ELSE educational_count::NUMERIC / questionnaire_count::NUMERIC
    END
  ) STORED,

  -- Strategy parameters
  max_consecutive_questionnaires INTEGER NOT NULL DEFAULT 2,
  min_time_between_questionnaires_ms INTEGER NOT NULL DEFAULT 300000, -- 5 minutes

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique: one content sequence per session
  UNIQUE(session_id)
);

CREATE INDEX idx_content_sequences_user ON content_sequences(user_id);

-- ===========================
-- If-Then Rules
-- ===========================

CREATE TABLE if_then_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Rule metadata
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,

  -- Condition (IF) - stored as JSON
  condition JSONB NOT NULL,

  -- Action (THEN) - stored as JSON
  action JSONB NOT NULL,

  -- Execution constraints
  max_executions_per_session INTEGER NOT NULL DEFAULT 1,
  min_time_between_executions_ms INTEGER NOT NULL,

  -- Learning
  execution_count INTEGER NOT NULL DEFAULT 0,
  success_rate NUMERIC(3, 2) DEFAULT 0 CHECK (success_rate BETWEEN 0 AND 1),
  enabled BOOLEAN NOT NULL DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- Rule Execution Logs
-- ===========================

CREATE TABLE rule_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES if_then_rules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,

  -- Execution details
  condition_met BOOLEAN NOT NULL,
  action_executed BOOLEAN NOT NULL,
  reason TEXT NOT NULL,

  -- Member response
  member_response TEXT CHECK (member_response IN ('accepted', 'dismissed', 'ignored')),

  -- Timestamp
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rule_logs_rule ON rule_execution_logs(rule_id, executed_at DESC);
CREATE INDEX idx_rule_logs_user ON rule_execution_logs(user_id);

-- ===========================
-- RP Awards
-- ===========================

CREATE TABLE rp_awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Source
  source TEXT NOT NULL CHECK (source IN (
    'questionnaire', 'microlesson', 'bias_challenge', 'micro_challenge',
    'recommendation_completed', 'manual_award'
  )),
  source_id TEXT NOT NULL,

  -- Points
  base_points INTEGER NOT NULL,
  bonus_points INTEGER NOT NULL DEFAULT 0,
  total_points INTEGER GENERATED ALWAYS AS (base_points + bonus_points) STORED,

  -- Diminishing returns
  diminishing_factor NUMERIC(3, 2) NOT NULL DEFAULT 1.0 CHECK (diminishing_factor BETWEEN 0 AND 1),

  -- Timestamp
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rp_awards_user ON rp_awards(user_id, awarded_at DESC);
CREATE INDEX idx_rp_awards_source ON rp_awards(source, source_id);

-- ===========================
-- Vision Ladders
-- ===========================

CREATE TABLE vision_ladders (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Current status
  current_member_count INTEGER NOT NULL DEFAULT 0,
  next_milestone INTEGER NOT NULL DEFAULT 100 CHECK (next_milestone IN (100, 200, 400, 600, 1000)),

  -- Milestones reached (stored as JSON array)
  milestones_reached JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Progress
  progress_percentage NUMERIC(5, 2) GENERATED ALWAYS AS (
    (current_member_count::NUMERIC / next_milestone::NUMERIC) * 100
  ) STORED,

  -- Timestamps
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================
-- Seed Initial Questionnaires
-- ===========================

INSERT INTO questionnaires (type, question, description, answer_type, options, sequence_number, estimated_time_seconds, rp_reward) VALUES
  ('location', 'Where are you based?', 'Help us connect you with nearby cooperators', 'single_choice',
   '[{"value": "city", "label": "City/Town"}, {"value": "region", "label": "Region/State"}, {"value": "country", "label": "Country"}, {"value": "prefer_not_say", "label": "Prefer not to say"}]'::JSONB,
   1, 30, 10),

  ('interests', 'Which cooperation paths interest you most?', 'Select all that apply', 'multiple_choice',
   '[
     {"value": "collaborative-education", "label": "Collaborative Education"},
     {"value": "social-economy", "label": "Social Economy"},
     {"value": "common-wellbeing", "label": "Common Wellbeing"},
     {"value": "cooperative-technology", "label": "Cooperative Technology"},
     {"value": "collective-governance", "label": "Collective Governance"},
     {"value": "community-connection", "label": "Community Connection"},
     {"value": "collaborative-media-culture", "label": "Collaborative Media & Culture"},
     {"value": "common-planet", "label": "Common Planet"}
   ]'::JSONB,
   2, 60, 10),

  ('experience', 'Have you organized cooperative projects before?', NULL, 'single_choice',
   '[{"value": "never", "label": "Never"}, {"value": "once_or_twice", "label": "Once or twice"}, {"value": "several_times", "label": "Several times"}, {"value": "regularly", "label": "Regularly"}]'::JSONB,
   3, 30, 10),

  ('network-size', 'How many people could you potentially reach?', NULL, 'single_choice',
   '[{"value": "5-15", "label": "5-15 people"}, {"value": "15-30", "label": "15-30 people"}, {"value": "30-50", "label": "30-50 people"}, {"value": "50-100", "label": "50-100 people"}, {"value": "100+", "label": "100+ people"}]'::JSONB,
   4, 30, 10),

  ('time-commitment', 'How much time can you contribute weekly?', NULL, 'single_choice',
   '[{"value": "1-2_hours", "label": "1-2 hours"}, {"value": "3-5_hours", "label": "3-5 hours"}, {"value": "6-10_hours", "label": "6-10 hours"}, {"value": "10+_hours", "label": "10+ hours"}]'::JSONB,
   5, 30, 10),

  ('goals', 'What are you hoping to achieve?', NULL, 'text', NULL, 6, 90, 10),

  ('obstacles', 'What''s blocking you from taking action?', NULL, 'multiple_choice',
   '[{"value": "no_time", "label": "Not enough time"}, {"value": "no_resources", "label": "Lack of resources"}, {"value": "no_network", "label": "Don''t know enough people"}, {"value": "no_skills", "label": "Missing skills"}, {"value": "unclear_steps", "label": "Don''t know where to start"}]'::JSONB,
   7, 60, 10),

  ('skills', 'What skills do you have to offer?', 'Select all that apply', 'multiple_choice',
   '[{"value": "organizing", "label": "Organizing"}, {"value": "facilitation", "label": "Facilitation"}, {"value": "tech", "label": "Technology"}, {"value": "writing", "label": "Writing"}, {"value": "design", "label": "Design"}, {"value": "teaching", "label": "Teaching"}, {"value": "other", "label": "Other"}]'::JSONB,
   8, 60, 10),

  ('resources', 'What resources do you have access to?', 'Select all that apply', 'multiple_choice',
   '[{"value": "space", "label": "Meeting space"}, {"value": "funding", "label": "Funding/budget"}, {"value": "equipment", "label": "Equipment/tools"}, {"value": "network", "label": "Network/connections"}, {"value": "platform", "label": "Online platform"}]'::JSONB,
   9, 60, 10),

  ('values', 'What values matter most to you?', 'Select up to 3', 'multiple_choice',
   '[{"value": "transparency", "label": "Transparency"}, {"value": "equity", "label": "Equity"}, {"value": "autonomy", "label": "Autonomy"}, {"value": "sustainability", "label": "Sustainability"}, {"value": "solidarity", "label": "Solidarity"}, {"value": "empathy", "label": "Empathy"}]'::JSONB,
   10, 60, 10);

-- ===========================
-- Comments
-- ===========================

COMMENT ON TABLE member_state_classifications IS 'Behavioral state classifications for members (decisive, hesitant, explorer, stalled, overloaded)';
COMMENT ON TABLE episodic_memory IS 'Specific interaction events for behavioral learning';
COMMENT ON TABLE semantic_memory IS 'General knowledge patterns derived from episodic memory';
COMMENT ON TABLE bridge_preferences IS 'User preferences for Bridge AI behavior';
COMMENT ON TABLE member_commitments IS 'Promises and commitments made by members';
COMMENT ON TABLE consent_flags IS 'Granular permissions for Bridge interventions';
COMMENT ON TABLE risk_profiles IS 'Session-based risk budget tracking (0.3 per session)';
COMMENT ON TABLE context_affinity IS 'Member engagement patterns across cooperation paths, modules, and groups';
COMMENT ON TABLE decision_cycles IS 'Complete 5-phase decision loop cycles (Sense → Frame → Choose → Act → Learn)';
COMMENT ON TABLE questionnaires IS '10 micro-questionnaires for cold-start problem (30-90 seconds each)';
COMMENT ON TABLE questionnaire_responses IS 'Member responses to questionnaires with RP rewards';
COMMENT ON TABLE microlessons IS '60-90 second learning modules on cooperation topics';
COMMENT ON TABLE bias_challenges IS 'Interactive exercises to recognize cognitive biases';
COMMENT ON TABLE micro_challenges IS 'Quick actionable tasks to drive engagement';
COMMENT ON TABLE educational_content_responses IS 'Member interactions with educational content';
COMMENT ON TABLE content_sequences IS 'Tracks alternating questionnaire/microlesson sequencing to prevent fatigue';
COMMENT ON TABLE if_then_rules IS 'Conditional behavioral rules (12 rules for adaptive intervention)';
COMMENT ON TABLE rule_execution_logs IS 'Audit log for if-then rule executions';
COMMENT ON TABLE rp_awards IS 'Readiness Points awards with diminishing returns';
COMMENT ON TABLE vision_ladders IS 'Growth milestones at 100, 200, 400, 600, 1000 members';
