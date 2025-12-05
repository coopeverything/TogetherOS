/**
 * Metrics Module Handlers
 *
 * Business logic for metrics CRUD operations,
 * template management, and analytics.
 */

import {
  metricsRepo,
  type CreateInitiativeMetricsInput,
  type CreateMetricInput,
  type MeasurementInput,
  type MetricsFilters,
} from '../repos/PostgresMetricsRepo'
import type {
  InitiativeMetrics,
  Metric,
  MetricTemplate,
  MetricsAnalytics,
  EvaluationSchedule,
} from '@togetheros/types'

/**
 * Create initiative metrics for a proposal/initiative
 */
export async function createInitiativeMetrics(
  input: {
    proposalId?: string
    initiativeId?: string
    evaluationSchedule: EvaluationSchedule
    customEvaluationDate?: Date
    metrics: CreateMetricInput[]
    createdBy: string
  }
): Promise<InitiativeMetrics> {
  // Calculate evaluation date based on schedule
  const evaluationDate = calculateEvaluationDate(input.evaluationSchedule, input.customEvaluationDate)
  const reminderDate = new Date(evaluationDate)
  reminderDate.setDate(reminderDate.getDate() - 7) // Reminder 1 week before

  // Create initiative metrics container
  const initiativeMetrics = await metricsRepo.createInitiativeMetrics({
    proposalId: input.proposalId,
    initiativeId: input.initiativeId,
    evaluationSchedule: input.evaluationSchedule,
    evaluationDate,
    reminderDate,
    createdBy: input.createdBy,
  })

  // Add individual metrics
  for (const metricInput of input.metrics) {
    await metricsRepo.addMetric(initiativeMetrics.id, metricInput)
  }

  // Return with metrics included
  const result = await metricsRepo.getInitiativeMetrics(initiativeMetrics.id)
  if (!result) throw new Error('Failed to create initiative metrics')
  return result
}

/**
 * Get initiative metrics by ID
 */
export async function getInitiativeMetrics(id: string): Promise<InitiativeMetrics | null> {
  if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    throw new Error('Invalid initiative metrics ID format')
  }
  return metricsRepo.getInitiativeMetrics(id)
}

/**
 * List initiative metrics with filters
 */
export async function listInitiativeMetrics(filters?: MetricsFilters): Promise<{
  items: InitiativeMetrics[]
  total: number
  page: number
  pageSize: number
}> {
  const limit = filters?.limit || 20
  const offset = filters?.offset || 0
  const page = Math.floor(offset / limit) + 1

  const result = await metricsRepo.listInitiativeMetrics(filters)

  return {
    items: result.items,
    total: result.total,
    page,
    pageSize: limit,
  }
}

/**
 * Update initiative metrics
 */
export async function updateInitiativeMetrics(
  id: string,
  updates: Partial<InitiativeMetrics>
): Promise<InitiativeMetrics> {
  return metricsRepo.updateInitiativeMetrics(id, updates)
}

/**
 * Delete initiative metrics
 */
export async function deleteInitiativeMetrics(id: string): Promise<void> {
  return metricsRepo.deleteInitiativeMetrics(id)
}

/**
 * Enter measurement for a metric (during evaluation)
 */
export async function enterMeasurement(
  metricId: string,
  measurement: MeasurementInput
): Promise<Metric> {
  return metricsRepo.enterMeasurement(metricId, measurement)
}

/**
 * Complete evaluation for initiative metrics
 */
export async function completeEvaluation(
  id: string,
  evaluatedBy: string
): Promise<InitiativeMetrics> {
  const initiativeMetrics = await metricsRepo.getInitiativeMetrics(id)
  if (!initiativeMetrics) throw new Error('Initiative metrics not found')

  // Calculate overall outcome based on individual metrics
  const metrics = initiativeMetrics.metrics || []
  if (metrics.length === 0) {
    throw new Error('No metrics defined for evaluation')
  }

  const mandatoryMetrics = metrics.filter(m => m.mandatory)
  const allMandatoryMet = mandatoryMetrics.every(m => m.status === 'met' || m.status === 'exceeded')

  const metricStatuses = metrics.map(m => m.status).filter(Boolean)
  const metCount = metricStatuses.filter(s => s === 'met' || s === 'exceeded').length
  const notMetCount = metricStatuses.filter(s => s === 'not_met').length

  let overallOutcome: 'succeeded' | 'failed' | 'mixed' | 'inconclusive'

  if (!allMandatoryMet) {
    overallOutcome = 'failed'
  } else if (notMetCount === 0 && metCount === metrics.length) {
    overallOutcome = 'succeeded'
  } else if (notMetCount > metCount) {
    overallOutcome = 'failed'
  } else if (metCount > 0 && notMetCount > 0) {
    overallOutcome = 'mixed'
  } else {
    overallOutcome = 'inconclusive'
  }

  return metricsRepo.updateInitiativeMetrics(id, {
    status: 'evaluated',
    evaluatedAt: new Date(),
    evaluatedBy,
    overallOutcome,
  })
}

/**
 * List metric templates
 */
export async function listTemplates(category?: string): Promise<MetricTemplate[]> {
  return metricsRepo.listTemplates(category)
}

/**
 * Get template by ID
 */
export async function getTemplate(id: string): Promise<MetricTemplate | null> {
  return metricsRepo.getTemplate(id)
}

/**
 * Use a template to create metrics
 */
export async function useTemplate(
  templateId: string,
  proposalId: string,
  createdBy: string,
  evaluationSchedule: EvaluationSchedule = '30-days'
): Promise<InitiativeMetrics> {
  const template = await metricsRepo.getTemplate(templateId)
  if (!template) throw new Error('Template not found')

  // Convert template metrics to create input format
  const metrics: CreateMetricInput[] = template.metrics.map(m => ({
    name: m.name,
    description: m.description,
    unit: m.unit,
    measurementMethod: m.measurementMethod,
    targetValue: { value: 0 }, // User must fill in targets
    weight: m.weight,
    mandatory: m.mandatory,
  }))

  // Increment template usage
  await metricsRepo.incrementTemplateUsage(templateId)

  return createInitiativeMetrics({
    proposalId,
    evaluationSchedule,
    metrics,
    createdBy,
  })
}

/**
 * Get platform-wide analytics
 */
export async function getAnalytics(): Promise<MetricsAnalytics> {
  return metricsRepo.getAnalytics()
}

/**
 * Generate improvement proposal when initiative fails
 */
export async function generateImprovementProposal(
  initiativeMetricsId: string
): Promise<{ improvementProposalId: string }> {
  const initiativeMetrics = await metricsRepo.getInitiativeMetrics(initiativeMetricsId)
  if (!initiativeMetrics) throw new Error('Initiative metrics not found')
  if (!initiativeMetrics.proposalId) throw new Error('No proposal linked to these metrics')
  if (initiativeMetrics.overallOutcome !== 'failed' && initiativeMetrics.overallOutcome !== 'mixed') {
    throw new Error('Can only generate improvement proposals for failed or mixed outcomes')
  }

  const failedMetrics = (initiativeMetrics.metrics || []).filter(
    m => m.status === 'not_met' || m.status === 'partially_met'
  )

  const proposal = await metricsRepo.createImprovementProposal({
    originalProposalId: initiativeMetrics.proposalId,
    initiativeMetricsId,
    title: `Improvement Proposal: Addressing Failed Metrics`,
    summary: `This improvement proposal addresses ${failedMetrics.length} metrics that did not meet their targets during the evaluation phase.`,
    failedMetrics,
    lessonsLearned: 'To be filled in by reviewer.',
    suggestedAmendments: 'To be filled in by reviewer.',
  })

  // Update initiative metrics to link to improvement proposal
  await metricsRepo.updateInitiativeMetrics(initiativeMetricsId, {
    status: 'improvement_pending',
  })

  return { improvementProposalId: proposal.id }
}

// Helper function to calculate evaluation date
function calculateEvaluationDate(schedule: EvaluationSchedule, customDate?: Date): Date {
  const now = new Date()

  switch (schedule) {
    case 'immediate':
      return now
    case '30-days':
      now.setDate(now.getDate() + 30)
      return now
    case '90-days':
      now.setDate(now.getDate() + 90)
      return now
    case '6-months':
      now.setMonth(now.getMonth() + 6)
      return now
    case '1-year':
      now.setFullYear(now.getFullYear() + 1)
      return now
    case 'custom':
      if (!customDate) throw new Error('Custom evaluation date is required')
      return customDate
    default:
      now.setDate(now.getDate() + 30)
      return now
  }
}
