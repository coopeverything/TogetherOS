-- Metrics & Review System
-- Module: metrics
-- Dependencies: users, proposals (governance)
-- Purpose: Track initiative success, evaluate outcomes, generate improvement proposals

-- Evaluation schedule enum
CREATE TYPE metrics_evaluation_schedule AS ENUM (
  'immediate',
  '30-days',
  '90-days',
  '6-months',
  '1-year',
  'custom'
);

-- Metric status enum
CREATE TYPE metrics_metric_status AS ENUM (
  'pending',
  'ready_for_evaluation',
  'in_evaluation',
  'evaluated',
  'improvement_pending'
);

-- Metric outcome enum
CREATE TYPE metrics_metric_outcome AS ENUM (
  'exceeded',
  'met',
  'partially_met',
  'not_met',
  'not_measured'
);

-- Overall outcome enum
CREATE TYPE metrics_overall_outcome AS ENUM (
  'succeeded',
  'failed',
  'mixed',
  'inconclusive'
);

-- Measurement method enum
CREATE TYPE metrics_measurement_method AS ENUM (
  'database_query',
  'survey',
  'manual_count',
  'external_data',
  'qualitative'
);

-- Confidence level enum
CREATE TYPE metrics_confidence_level AS ENUM (
  'high',
  'medium',
  'low'
);

-- Improvement proposal status enum
CREATE TYPE metrics_improvement_status AS ENUM (
  'draft',
  'submitted',
  'in_governance',
  'rejected'
);

-- Initiative category enum (for templates)
CREATE TYPE metrics_initiative_category AS ENUM (
  'community_project',
  'platform_feature',
  'event',
  'policy',
  'infrastructure',
  'education',
  'custom'
);

-- Main initiative metrics table (links metrics to an initiative)
CREATE TABLE IF NOT EXISTS metrics_initiative_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_id UUID, -- Links to future Execution module
  proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,

  -- Evaluation scheduling
  evaluation_schedule metrics_evaluation_schedule NOT NULL DEFAULT '30-days',
  evaluation_date TIMESTAMPTZ NOT NULL,
  reminder_date TIMESTAMPTZ,

  -- Current status
  status metrics_metric_status DEFAULT 'pending',
  evaluated_at TIMESTAMPTZ,
  evaluated_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Results
  overall_outcome metrics_overall_outcome,
  improvement_proposal_id UUID, -- Self-reference added later

  -- Metadata
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual metrics table
CREATE TABLE IF NOT EXISTS metrics_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiative_metrics_id UUID NOT NULL REFERENCES metrics_initiative_metrics(id) ON DELETE CASCADE,

  -- Metric definition
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  unit VARCHAR(50) NOT NULL,
  measurement_method metrics_measurement_method NOT NULL,
  data_source TEXT, -- DB query, survey ID, or external source description

  -- Target value (stored as JSONB for flexibility)
  target_value JSONB NOT NULL, -- { value: number|string|boolean, confidence?: string, evidenceUrls?: string[] }

  -- Actual value (populated during evaluation)
  actual_value JSONB, -- Same structure as target_value

  -- Weighting
  weight INTEGER NOT NULL DEFAULT 5 CHECK (weight >= 1 AND weight <= 10),
  mandatory BOOLEAN DEFAULT FALSE,

  -- Results
  status metrics_metric_outcome,
  variance DECIMAL, -- % difference from target
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_name CHECK (char_length(name) >= 3 AND char_length(name) <= 100),
  CONSTRAINT valid_description CHECK (char_length(description) >= 10)
);

-- Minority report validation table
CREATE TABLE IF NOT EXISTS metrics_minority_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  initiative_metrics_id UUID NOT NULL REFERENCES metrics_initiative_metrics(id) ON DELETE CASCADE,

  -- Minority report content
  minority_report_text TEXT NOT NULL,
  key_concerns JSONB DEFAULT '[]', -- Array of concern strings

  -- Validation results
  validated BOOLEAN,
  validated_concerns JSONB DEFAULT '[]', -- Array of validated concern strings
  validation_notes TEXT,
  validated_at TIMESTAMPTZ,
  validated_by UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Action taken
  improvement_proposal_created BOOLEAN DEFAULT FALSE,
  improvement_proposal_id UUID,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Improvement proposals (auto-generated when initiatives fail)
CREATE TABLE IF NOT EXISTS metrics_improvement_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  initiative_id UUID, -- Links to future Execution module
  initiative_metrics_id UUID NOT NULL REFERENCES metrics_initiative_metrics(id) ON DELETE CASCADE,

  -- Pre-filled content
  title VARCHAR(200) NOT NULL,
  summary TEXT NOT NULL,
  failed_metrics JSONB DEFAULT '[]', -- Array of metric summaries
  minority_report_quotes JSONB DEFAULT '[]', -- Array of validated minority quotes
  lessons_learned TEXT,
  suggested_amendments TEXT,

  -- Status
  status metrics_improvement_status DEFAULT 'draft',
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ,
  submitted_proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL, -- New proposal created from this

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_title CHECK (char_length(title) >= 10 AND char_length(title) <= 200)
);

-- Add self-reference for improvement_proposal_id in initiative_metrics
ALTER TABLE metrics_initiative_metrics
ADD CONSTRAINT fk_improvement_proposal
FOREIGN KEY (improvement_proposal_id)
REFERENCES metrics_improvement_proposals(id) ON DELETE SET NULL;

-- Add self-reference for improvement_proposal_id in minority_validations
ALTER TABLE metrics_minority_validations
ADD CONSTRAINT fk_minority_improvement_proposal
FOREIGN KEY (improvement_proposal_id)
REFERENCES metrics_improvement_proposals(id) ON DELETE SET NULL;

-- Metric templates (reusable metric definitions)
CREATE TABLE IF NOT EXISTS metrics_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category metrics_initiative_category NOT NULL,
  description TEXT NOT NULL,

  -- Usage statistics
  times_used INTEGER DEFAULT 0,
  success_rate DECIMAL DEFAULT 0, -- Percentage (0-100)

  -- Metadata
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_template_name CHECK (char_length(name) >= 3 AND char_length(name) <= 100)
);

-- Template metrics (metrics within a template)
CREATE TABLE IF NOT EXISTS metrics_template_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES metrics_templates(id) ON DELETE CASCADE,

  -- Metric template definition (no target/actual values)
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  unit VARCHAR(50) NOT NULL,
  measurement_method metrics_measurement_method NOT NULL,

  -- Weighting
  weight INTEGER NOT NULL DEFAULT 5 CHECK (weight >= 1 AND weight <= 10),
  mandatory BOOLEAN DEFAULT FALSE,

  -- Order within template
  sort_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_template_metric_name CHECK (char_length(name) >= 3 AND char_length(name) <= 100)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_metrics_initiative_metrics_proposal ON metrics_initiative_metrics(proposal_id);
CREATE INDEX IF NOT EXISTS idx_metrics_initiative_metrics_status ON metrics_initiative_metrics(status);
CREATE INDEX IF NOT EXISTS idx_metrics_initiative_metrics_evaluation_date ON metrics_initiative_metrics(evaluation_date);
CREATE INDEX IF NOT EXISTS idx_metrics_initiative_metrics_created_by ON metrics_initiative_metrics(created_by);

CREATE INDEX IF NOT EXISTS idx_metrics_metrics_initiative ON metrics_metrics(initiative_metrics_id);
CREATE INDEX IF NOT EXISTS idx_metrics_metrics_status ON metrics_metrics(status);

CREATE INDEX IF NOT EXISTS idx_metrics_minority_proposal ON metrics_minority_validations(proposal_id);
CREATE INDEX IF NOT EXISTS idx_metrics_minority_initiative ON metrics_minority_validations(initiative_metrics_id);

CREATE INDEX IF NOT EXISTS idx_metrics_improvement_original ON metrics_improvement_proposals(original_proposal_id);
CREATE INDEX IF NOT EXISTS idx_metrics_improvement_status ON metrics_improvement_proposals(status);

CREATE INDEX IF NOT EXISTS idx_metrics_templates_category ON metrics_templates(category);
CREATE INDEX IF NOT EXISTS idx_metrics_template_metrics_template ON metrics_template_metrics(template_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER metrics_initiative_metrics_updated_at
  BEFORE UPDATE ON metrics_initiative_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_metrics_updated_at();

CREATE TRIGGER metrics_metrics_updated_at
  BEFORE UPDATE ON metrics_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_metrics_updated_at();

CREATE TRIGGER metrics_minority_validations_updated_at
  BEFORE UPDATE ON metrics_minority_validations
  FOR EACH ROW
  EXECUTE FUNCTION update_metrics_updated_at();

CREATE TRIGGER metrics_improvement_proposals_updated_at
  BEFORE UPDATE ON metrics_improvement_proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_metrics_updated_at();

CREATE TRIGGER metrics_templates_updated_at
  BEFORE UPDATE ON metrics_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_metrics_updated_at();

-- Seed default metric templates
INSERT INTO metrics_templates (name, category, description, times_used, success_rate) VALUES
  ('Community Project Metrics', 'community_project', 'Standard metrics for community-driven projects including participation, satisfaction, and resource utilization.', 12, 75),
  ('Platform Feature Metrics', 'platform_feature', 'Track adoption, bugs, and user satisfaction for new platform features.', 8, 62),
  ('Event Success Metrics', 'event', 'Measure event success through attendance, feedback, and follow-up engagement.', 15, 80),
  ('Policy Implementation Metrics', 'policy', 'Track policy adoption, compliance, and impact on community behavior.', 5, 60),
  ('Educational Initiative Metrics', 'education', 'Measure learning outcomes, engagement, and skill application for educational programs.', 7, 85);

-- Insert template metrics for each template
DO $$
DECLARE
  v_community_id UUID;
  v_feature_id UUID;
  v_event_id UUID;
  v_policy_id UUID;
  v_education_id UUID;
BEGIN
  SELECT id INTO v_community_id FROM metrics_templates WHERE name = 'Community Project Metrics';
  SELECT id INTO v_feature_id FROM metrics_templates WHERE name = 'Platform Feature Metrics';
  SELECT id INTO v_event_id FROM metrics_templates WHERE name = 'Event Success Metrics';
  SELECT id INTO v_policy_id FROM metrics_templates WHERE name = 'Policy Implementation Metrics';
  SELECT id INTO v_education_id FROM metrics_templates WHERE name = 'Educational Initiative Metrics';

  -- Community Project Metrics
  INSERT INTO metrics_template_metrics (template_id, name, description, unit, measurement_method, weight, mandatory, sort_order) VALUES
    (v_community_id, 'Active Participants', 'Number of members actively participating (visited 2+ times/month)', 'members', 'database_query', 10, true, 1),
    (v_community_id, 'Member Satisfaction', 'Percentage of participants who rate experience 4+ stars', 'percentage', 'survey', 8, true, 2),
    (v_community_id, 'Resource Utilization', 'Percentage of allocated resources actually used', 'percentage', 'manual_count', 6, false, 3);

  -- Platform Feature Metrics
  INSERT INTO metrics_template_metrics (template_id, name, description, unit, measurement_method, weight, mandatory, sort_order) VALUES
    (v_feature_id, 'User Adoption', 'Percentage of active members using feature at least once', 'percentage', 'database_query', 10, true, 1),
    (v_feature_id, 'Bug Reports', 'Number of P1/P2 bugs reported in first 30 days', 'bugs', 'external_data', 8, true, 2),
    (v_feature_id, 'Net Promoter Score', 'NPS score for feature (would you recommend?)', 'nps_score', 'survey', 7, false, 3),
    (v_feature_id, 'Task Completion Rate', 'Percentage of users who complete intended workflow', 'percentage', 'database_query', 9, false, 4);

  -- Event Success Metrics
  INSERT INTO metrics_template_metrics (template_id, name, description, unit, measurement_method, weight, mandatory, sort_order) VALUES
    (v_event_id, 'Attendance Rate', 'Percentage of registered attendees who showed up', 'percentage', 'manual_count', 8, true, 1),
    (v_event_id, 'Post-Event Rating', 'Average rating from post-event feedback survey', 'stars', 'survey', 9, true, 2),
    (v_event_id, 'Follow-up Engagement', 'Percentage of attendees who engage with follow-up content/actions', 'percentage', 'database_query', 7, false, 3);

  -- Policy Implementation Metrics
  INSERT INTO metrics_template_metrics (template_id, name, description, unit, measurement_method, weight, mandatory, sort_order) VALUES
    (v_policy_id, 'Awareness Rate', 'Percentage of members aware of the new policy', 'percentage', 'survey', 7, false, 1),
    (v_policy_id, 'Compliance Rate', 'Percentage of interactions following new policy guidelines', 'percentage', 'manual_count', 10, true, 2),
    (v_policy_id, 'Intended Outcome Achievement', 'Whether the policy achieved its stated goal', 'yes/no', 'qualitative', 10, true, 3);

  -- Educational Initiative Metrics
  INSERT INTO metrics_template_metrics (template_id, name, description, unit, measurement_method, weight, mandatory, sort_order) VALUES
    (v_education_id, 'Completion Rate', 'Percentage of enrolled participants who complete the program', 'percentage', 'database_query', 9, true, 1),
    (v_education_id, 'Knowledge Assessment', 'Average score improvement from pre to post assessment', 'percentage', 'database_query', 10, true, 2),
    (v_education_id, 'Skill Application', 'Percentage of graduates who apply skills within 30 days', 'percentage', 'survey', 8, false, 3),
    (v_education_id, 'Peer Teaching', 'Number of graduates who teach others what they learned', 'members', 'manual_count', 6, false, 4);
END $$;
