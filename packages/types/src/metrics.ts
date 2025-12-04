// packages/types/src/metrics.ts
// TogetherOS Metrics & Review Module - Core Entity Definitions

/**
 * Evaluation schedule options
 */
export type EvaluationSchedule =
  | 'immediate'    // Right after delivery
  | '30-days'      // 1 month post-delivery
  | '90-days'      // 3 months post-delivery
  | '6-months'     // 6 months post-delivery
  | '1-year'       // 1 year post-delivery
  | 'custom'       // Specify custom date

/**
 * Metric status through lifecycle
 */
export type MetricStatus =
  | 'pending'              // Awaiting evaluation date
  | 'ready_for_evaluation' // Evaluation date reached
  | 'in_evaluation'        // Community measuring outcomes
  | 'evaluated'            // Completed
  | 'improvement_pending'  // Feedback loop initiated

/**
 * Overall outcome for initiative metrics
 */
export type MetricOutcome = 'succeeded' | 'failed' | 'mixed' | 'inconclusive'

/**
 * Individual metric result status
 */
export type MetricResultStatus = 'exceeded' | 'met' | 'partially_met' | 'not_met' | 'not_measured'

/**
 * Measurement method types
 */
export type MeasurementMethod =
  | 'database_query'   // Auto-measure from platform data
  | 'survey'           // Community survey
  | 'manual_count'     // Manual observation/counting
  | 'external_data'    // Import from external source
  | 'qualitative'      // Narrative/subjective assessment

/**
 * Confidence level for measurements
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low'

/**
 * Metric value with optional confidence and evidence
 */
export interface MetricValue {
  /** The measured value */
  value: number | string | boolean
  /** Confidence in this measurement */
  confidence?: ConfidenceLevel
  /** Links to proof/evidence */
  evidenceUrls?: string[]
}

/**
 * Individual metric definition
 */
export interface Metric {
  /** Unique identifier (UUID v4) */
  id: string
  /** Metric name (3-100 chars) */
  name: string
  /** What this measures (10-500 chars) */
  description: string
  /** Expected outcome */
  target: MetricValue
  /** Measured outcome (after evaluation) */
  actual?: MetricValue
  /** Unit of measurement (members, dollars, hours, percentage, etc.) */
  unit: string
  /** How to measure this metric */
  measurementMethod: MeasurementMethod
  /** Where to get data (DB query, survey, manual) */
  dataSource?: string
  /** Importance weight (1-10) */
  weight: number
  /** Must succeed for overall success */
  mandatory: boolean
  /** Result status after evaluation */
  status?: MetricResultStatus
  /** Percentage difference from target */
  variance?: number
  /** Evaluator comments */
  notes?: string
}

/**
 * Initiative metrics - links metrics to a specific initiative
 */
export interface InitiativeMetrics {
  /** Unique identifier (UUID v4) */
  id: string
  /** Links to Execution module initiative */
  initiativeId: string
  /** Original governance proposal */
  proposalId: string
  /** List of success metrics */
  metrics: Metric[]
  /** Evaluation schedule type */
  evaluationSchedule: EvaluationSchedule
  /** When to measure outcomes */
  evaluationDate: Date
  /** Reminder before evaluation */
  reminderDate: Date
  /** Current status */
  status: MetricStatus
  /** When evaluation was performed */
  evaluatedAt?: Date
  /** Member UUID who performed evaluation */
  evaluatedBy?: string
  /** Overall outcome after evaluation */
  overallOutcome?: MetricOutcome
  /** If feedback loop triggered */
  improvementProposalId?: string
  /** Creation timestamp */
  createdAt: Date
  /** Last modification timestamp */
  updatedAt: Date
}

/**
 * Minority report validation
 * Tracks whether minority report predictions came true
 */
export interface MinorityReportValidation {
  /** Unique identifier (UUID v4) */
  id: string
  /** Associated proposal */
  proposalId: string
  /** Associated initiative metrics */
  initiativeMetricsId: string
  /** Original minority report text */
  minorityReportText: string
  /** Extracted key concerns/predictions */
  keyConcerns: string[]
  /** Whether concerns proved correct */
  validated: boolean
  /** Which specific concerns were validated */
  validatedConcerns: string[]
  /** Explanation of validation */
  validationNotes: string
  /** When validation was performed */
  validatedAt: Date
  /** Member UUID who validated */
  validatedBy: string
  /** Whether improvement proposal was created */
  improvementProposalCreated: boolean
  /** Associated improvement proposal if created */
  improvementProposalId?: string
}

/**
 * Improvement proposal status
 */
export type ImprovementProposalStatus = 'draft' | 'submitted' | 'in_governance' | 'rejected'

/**
 * Improvement proposal
 * Auto-generated when initiative fails evaluation
 */
export interface ImprovementProposal {
  /** Unique identifier (UUID v4) */
  id: string
  /** Original failed proposal */
  originalProposalId: string
  /** Failed initiative */
  initiativeId: string
  /** Metrics that failed */
  initiativeMetricsId: string
  /** Pre-filled title */
  title: string
  /** Auto-generated summary */
  summary: string
  /** Metrics that didn't meet target */
  failedMetrics: Metric[]
  /** Minority report quotes if validated */
  minorityReportQuotes?: string[]
  /** Lessons from delivery report */
  lessonsLearned: string
  /** AI-suggested improvements */
  suggestedAmendments: string
  /** Current status */
  status: ImprovementProposalStatus
  /** Member who reviewed/submitted */
  reviewedBy?: string
  /** When submitted to governance */
  submittedAt?: Date
  /** Creation timestamp */
  createdAt: Date
}

/**
 * Metric template category
 */
export type MetricTemplateCategory =
  | 'community_project'
  | 'platform_feature'
  | 'event'
  | 'policy'
  | 'infrastructure'
  | 'education'
  | 'custom'

/**
 * Metric template
 * Reusable metric definitions for common initiative types
 */
export interface MetricTemplate {
  /** Unique identifier (UUID v4) */
  id: string
  /** Template name */
  name: string
  /** Initiative type category */
  category: MetricTemplateCategory
  /** Template description */
  description: string
  /** Pre-defined metrics (without id, target, actual) */
  metrics: Omit<Metric, 'id' | 'target' | 'actual' | 'status' | 'variance' | 'notes'>[]
  /** Number of times used */
  timesUsed: number
  /** Success rate of initiatives using this template */
  successRate: number
  /** Creation timestamp */
  createdAt: Date
  /** Last modification timestamp */
  updatedAt: Date
}

/**
 * Metrics analytics - platform-wide statistics
 */
export interface MetricsAnalytics {
  /** Total initiatives with metrics */
  totalInitiatives: number
  /** Initiatives evaluated */
  evaluatedCount: number
  /** Success rate overall */
  overallSuccessRate: number
  /** Success rate by category */
  successByCategory: Record<MetricTemplateCategory, number>
  /** Common failure patterns */
  failurePatterns: FailurePattern[]
  /** Minority validation rate */
  minorityValidationRate: number
  /** Improvement proposal success rate */
  improvementSuccessRate: number
}

/**
 * Failure pattern identified in analytics
 */
export interface FailurePattern {
  /** Pattern description */
  description: string
  /** How often this pattern occurs */
  frequency: number
  /** Initiative categories affected */
  affectedCategories: MetricTemplateCategory[]
  /** Suggested preventive measures */
  preventiveMeasures: string[]
}

/**
 * Metrics dashboard summary for an initiative
 */
export interface MetricsSummary {
  /** Initiative metrics ID */
  id: string
  /** Initiative title */
  initiativeTitle: string
  /** Proposal title */
  proposalTitle: string
  /** Current status */
  status: MetricStatus
  /** Days until evaluation (negative if overdue) */
  daysUntilEvaluation: number
  /** Total metrics count */
  totalMetrics: number
  /** Metrics met count */
  metricsMet: number
  /** Overall outcome */
  overallOutcome?: MetricOutcome
  /** Has minority report */
  hasMinorityReport: boolean
  /** Minority validated */
  minorityValidated?: boolean
}

/**
 * Re-evaluation trigger
 * Conditions that trigger early re-evaluation
 */
export interface ReEvaluationTrigger {
  /** Trigger type */
  type: 'metric_failure' | 'minority_validation' | 'community_feedback' | 'deadline_overrun' | 'budget_overrun'
  /** Trigger description */
  description: string
  /** Threshold value (e.g., 50% for metric failure) */
  threshold?: number
  /** Whether trigger is active */
  active: boolean
}
