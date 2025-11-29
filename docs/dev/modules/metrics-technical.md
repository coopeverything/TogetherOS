# Metrics & Review Module — Technical Implementation

> This document contains technical implementation details for developers. For user-facing documentation, see [docs/modules/metrics.md](../../modules/metrics.md).

**Category:** Collective Governance, Cooperative Technology

---

## Implementation Status

### Phase 1: Metrics Definition & Tracking (0% - SPEC ONLY)

- [ ] `InitiativeMetrics` entity with validation
- [ ] `Metric` entity with validation
- [ ] Metrics definition API
- [ ] Evaluation scheduling logic
- [ ] Template system for reusable metrics
- [ ] UI: Metrics definition form
- [ ] UI: Metric template browser

### Phase 2: Evaluation & Measurement (0% - SPEC ONLY)

- [ ] Evaluation task queue
- [ ] Measurement entry API
- [ ] Database query executor for metrics
- [ ] Survey integration
- [ ] Variance and outcome calculation engine
- [ ] UI: Evaluation dashboard
- [ ] UI: Results visualization

### Phase 3: Re-evaluation Triggers & Alerts (0% - SPEC ONLY)

- [ ] Trigger detection engine
- [ ] MinorityReportValidation entity and workflow
- [ ] Alert/notification integration
- [ ] Escalation rules configuration

### Phase 4: Feedback Loop & Improvement Proposals (0% - SPEC ONLY)

- [ ] `ImprovementProposal` entity
- [ ] Auto-generation logic (extract failed metrics, minority quotes, lessons)
- [ ] AI integration for amendment suggestions
- [ ] Member review UI
- [ ] Submission to Governance module
- [ ] Cycle tracking (link original → improvement → result)

### Phase 5: Analytics & Institutional Learning (0% - SPEC ONLY)

- [ ] Success rate by initiative type
- [ ] Common failure patterns
- [ ] Metric template effectiveness
- [ ] Minority report validation rate
- [ ] Time-to-success trends
- [ ] Cost/benefit analysis aggregates

---

## Data Models

### InitiativeMetrics

Links metrics to a specific initiative.

```typescript
interface InitiativeMetrics {
  id: string                           // UUID
  initiativeId: string                 // Links to Execution module
  proposalId: string                   // Original governance proposal

  // Metrics definition
  metrics: Metric[]                    // List of success metrics

  // Evaluation scheduling
  evaluationSchedule: EvaluationSchedule
  evaluationDate: Date                 // When to measure outcomes
  reminderDate: Date                   // Reminder before evaluation

  // Current status
  status: MetricStatus
  evaluatedAt?: Date
  evaluatedBy?: string                 // Member UUID who performed evaluation

  // Results
  overallOutcome?: 'succeeded' | 'failed' | 'mixed' | 'inconclusive'
  improvementProposalId?: string       // If feedback loop triggered

  // Timestamps
  createdAt: Date
  updatedAt: Date
}

type EvaluationSchedule =
  | 'immediate'                        // Right after delivery
  | '30-days'                          // 1 month post-delivery
  | '90-days'                          // 3 months post-delivery
  | '6-months'                         // 6 months post-delivery
  | '1-year'                           // 1 year post-delivery
  | 'custom'                           // Specify custom date

type MetricStatus =
  | 'pending'                          // Awaiting evaluation date
  | 'ready_for_evaluation'            // Evaluation date reached
  | 'in_evaluation'                    // Community measuring outcomes
  | 'evaluated'                        // Completed
  | 'improvement_pending'              // Feedback loop initiated
```

### Metric

Individual measurable outcome.

```typescript
interface Metric {
  id: string                           // UUID
  name: string                         // 3-100 chars
  description: string                  // What this measures (10-500 chars)

  // Target vs Actual
  target: MetricValue                  // Expected outcome
  actual?: MetricValue                 // Measured outcome (after evaluation)

  // Measurement
  unit: string                         // "members", "dollars", "hours", "percentage", etc.
  measurementMethod: MeasurementMethod
  dataSource?: string                  // Where to get data (DB query, survey, manual)

  // Weighting
  weight: number                       // 1-10 (importance of this metric)
  mandatory: boolean                   // Must succeed for overall success

  // Results
  status?: 'exceeded' | 'met' | 'partially_met' | 'not_met' | 'not_measured'
  variance?: number                    // % difference from target
  notes?: string                       // Evaluator comments
}

interface MetricValue {
  value: number | string | boolean
  confidence?: 'high' | 'medium' | 'low' // How confident in this measurement
  evidenceUrls?: string[]               // Links to proof
}

type MeasurementMethod =
  | 'database_query'                   // Auto-measure from platform data
  | 'survey'                           // Community survey
  | 'manual_count'                     // Manual observation/counting
  | 'external_data'                    // Import from external source
  | 'qualitative'                      // Narrative/subjective assessment
```

### MinorityReportValidation

Tracks whether minority report predictions came true.

```typescript
interface MinorityReportValidation {
  id: string                           // UUID
  proposalId: string
  initiativeMetricsId: string

  // Minority report content
  minorityReportText: string           // Original report
  keyConcerns: string[]                // Extracted predictions

  // Validation
  validated: boolean                   // Did concerns prove correct?
  validatedConcerns: string[]          // Which specific concerns were right
  validationNotes: string              // Explanation
  validatedAt: Date
  validatedBy: string                  // Member UUID

  // Action taken
  improvementProposalCreated: boolean
  improvementProposalId?: string
}
```

### ImprovementProposal

Auto-generated proposal when initiative fails evaluation.

```typescript
interface ImprovementProposal {
  id: string                           // UUID
  originalProposalId: string           // Failed proposal
  initiativeId: string                 // Failed initiative
  initiativeMetricsId: string          // Metrics that failed

  // Pre-filled content (member must review before submitting)
  title: string                        // "Improvement: [original title]"
  summary: string                      // Auto-generated summary
  failedMetrics: Metric[]              // Metrics that didn't meet target
  minorityReportQuotes?: string[]      // If minority was validated
  lessonsLearned: string               // From delivery report
  suggestedAmendments: string          // AI-suggested improvements

  // Status
  status: 'draft' | 'submitted' | 'in_governance' | 'rejected'
  reviewedBy?: string                  // Member who reviewed/submitted
  submittedAt?: Date

  createdAt: Date
}
```

### MetricTemplate

Reusable metric definitions for common types of initiatives.

```typescript
interface MetricTemplate {
  id: string                           // UUID
  name: string                         // Template name
  category: string                     // Initiative type
  description: string

  // Pre-defined metrics
  metrics: Omit<Metric, 'id' | 'target' | 'actual'>[]

  // Usage
  timesUsed: number
  successRate: number                  // % of initiatives using this template that succeeded

  createdAt: Date
  updatedAt: Date
}
```

---

## Validation Rules

### Metrics Definition

```typescript
import { z } from 'zod'

export const defineMetricsSchema = z.object({
  initiativeId: z.string().uuid(),
  evaluationSchedule: z.enum(['immediate', '30-days', '90-days', '6-months', '1-year', 'custom']),
  customEvaluationDate: z.date().optional(),
  metrics: z.array(z.object({
    name: z.string().min(3).max(100),
    description: z.string().min(10).max(500),
    target: z.object({
      value: z.union([z.number(), z.string(), z.boolean()]),
      confidence: z.enum(['high', 'medium', 'low']).optional(),
    }),
    unit: z.string().min(1).max(50),
    measurementMethod: z.enum(['database_query', 'survey', 'manual_count', 'external_data', 'qualitative']),
    dataSource: z.string().optional(),
    weight: z.number().int().min(1).max(10).default(5),
    mandatory: z.boolean().default(false),
  })).min(1).max(10),  // At least 1 metric, max 10
}).refine(data => {
  // If custom evaluation schedule, must provide date
  if (data.evaluationSchedule === 'custom' && !data.customEvaluationDate) {
    return false
  }
  return true
})
```

### Measurement Entry

```typescript
export const enterMeasurementSchema = z.object({
  metricId: z.string().uuid(),
  actual: z.object({
    value: z.union([z.number(), z.string(), z.boolean()]),
    confidence: z.enum(['high', 'medium', 'low']),
    evidenceUrls: z.array(z.string().url()).optional(),
  }),
  notes: z.string().max(1000).optional(),
})
```

### Minority Report Validation

```typescript
export const validateMinorityReportSchema = z.object({
  minorityReportValidationId: z.string().uuid(),
  validated: z.boolean(),
  validatedConcerns: z.array(z.string()).min(1),
  validationNotes: z.string().min(10).max(2000),
})
```

---

## Integration with Other Modules

### Execution & Accountability Module

Automatic metrics scheduling:

1. **Initiative created** → Prompt admin to define metrics
2. **Initiative delivered** → Calculate evaluation date based on schedule
3. **Evaluation date arrives** → Create evaluation task
4. **Metrics evaluated** → Update initiative status
5. **Metrics failed** → Trigger improvement proposal creation

### Governance Module

Feedback loop for continuous improvement:

1. **Metrics fail** → System creates `ImprovementProposal`
2. **Pre-fill proposal** with original decision, failed metrics, minority validation
3. **Member reviews** draft proposal
4. **Member submits** to Governance module as amendment
5. **Governance processes** as standard amendment proposal

### Events Module

Evaluation reminders:
- Create "Evaluation Reminder" event 1 week before evaluation date
- Create "Metrics Review Meeting" event for community to discuss results
- Schedule follow-up if metrics inconclusive

---

## UI Routes

```
/initiatives/[id]/metrics          → Define metrics for initiative
/initiatives/[id]/metrics/evaluate → Enter measurement data
/metrics/templates                 → Browse metric templates
/metrics/analytics                 → Platform-wide metrics dashboard
/metrics/patterns                  → Common failure patterns
/metrics/templates/effectiveness   → Template performance
```

---

## Re-evaluation Triggers

Automatic triggers that schedule evaluation:

- **Metric failure:** Any metric < 50% of target
- **Minority report validation:** Minority concerns proved correct
- **Community feedback:** 5+ members flag issue with implementation
- **Deadline overruns:** Implementation took >2x estimated time
- **Budget overruns:** Cost >150% of estimated cost

---

## Example Metrics for Common Initiative Types

### Community Garden Initiative

```typescript
const gardenMetrics: Metric[] = [
  {
    name: "Active Participants",
    description: "Number of members actively participating in garden (visited 2+ times/month)",
    target: { value: 50, confidence: 'medium' },
    unit: "members",
    measurementMethod: "database_query",
    dataSource: "SELECT COUNT(DISTINCT user_id) FROM garden_visits WHERE visits >= 2",
    weight: 10,
    mandatory: true
  },
  {
    name: "Food Production",
    description: "Total kilograms of vegetables/fruits harvested",
    target: { value: 100, confidence: 'low' },
    unit: "kilograms",
    measurementMethod: "manual_count",
    weight: 7,
    mandatory: false
  },
  {
    name: "Member Satisfaction",
    description: "Percentage of participants who rate experience 4+ stars",
    target: { value: 80, confidence: 'high' },
    unit: "percentage",
    measurementMethod: "survey",
    weight: 8,
    mandatory: true
  }
]
```

### Platform Feature Initiative

```typescript
const featureMetrics: Metric[] = [
  {
    name: "User Adoption",
    description: "Percentage of active members using feature at least once",
    target: { value: 60, confidence: 'medium' },
    unit: "percentage",
    measurementMethod: "database_query",
    weight: 10,
    mandatory: true
  },
  {
    name: "Bug Reports",
    description: "Number of P1/P2 bugs reported in first 30 days",
    target: { value: 5, confidence: 'high' },  // Target is LOW (fewer bugs better)
    unit: "bugs",
    measurementMethod: "external_data",  // From GitHub issues
    weight: 8,
    mandatory: true
  },
  {
    name: "User Feedback",
    description: "Net Promoter Score (NPS) for feature",
    target: { value: 50, confidence: 'medium' },
    unit: "nps_score",
    measurementMethod: "survey",
    weight: 7,
    mandatory: false
  }
]
```

---

## Privacy & Security

### Public Information (Members-Only)

- Aggregate success rates by initiative type
- Common failure patterns (anonymized)
- Template effectiveness stats

### Group-Only Information

- Specific initiative metrics (unless initiative was public)
- Minority report validation details
- Individual metric measurements

### Private Information (Admins Only)

- Member-submitted evidence (if sensitive)
- Failed initiative post-mortems (if requested private)

---

## Dependencies

### Required Modules

- **Execution & Accountability** (0%) — Initiative tracking
- **Governance** (60%) — Improvement proposal creation, amendment workflow

### Optional Integration

- **Events** (0%) — Evaluation reminder events
- **Notifications** (65%) — Evaluation alerts
- **Bridge AI** (95%) — Suggested amendments, pattern detection

---

## Success Metrics (Meta)

### Adoption

- **Metrics definition rate:** >80% of initiatives have defined metrics
- **Evaluation completion rate:** >90% of scheduled evaluations completed on time
- **Template usage:** >60% of initiatives use metric templates

### Quality

- **Outcome clarity:** >85% of evaluations have clear succeeded/failed/mixed determination
- **Evidence attachment:** >70% of measured metrics have evidence attached
- **Community participation:** >50% of evaluations have >5 community members validating

### Impact

- **Feedback loop activation:** >30% of failed initiatives generate improvement proposals
- **Improvement success rate:** >60% of improvement proposals succeed on re-evaluation
- **Minority validation rate:** Track % of minority reports that proved correct
- **Institutional learning:** Success rate improves over time for repeated initiative types

---

## Related Documentation

- [Execution & Accountability Module](./admin-accountability-technical.md) — Initiative implementation
- [Governance Module](./governance-technical.md) — Improvement proposals, amendments
- [Events Module](./events-technical.md) — Evaluation reminder events
