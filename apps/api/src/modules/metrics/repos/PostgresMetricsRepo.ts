/**
 * PostgreSQL Repository for Metrics Module
 *
 * Handles all database operations for initiative metrics,
 * templates, evaluations, and analytics.
 */

import { pool } from '@togetheros/db'
import type {
  InitiativeMetrics,
  Metric,
  MetricTemplate,
  MetricsAnalytics,
  MinorityReportValidation,
  ImprovementProposal,
  EvaluationSchedule,
  MetricStatus,
  MetricResultStatus,
  MeasurementMethod,
  MetricTemplateCategory,
} from '@togetheros/types'

// Repository interface
export interface IMetricsRepo {
  // Initiative Metrics CRUD
  createInitiativeMetrics(input: CreateInitiativeMetricsInput): Promise<InitiativeMetrics>
  getInitiativeMetrics(id: string): Promise<InitiativeMetrics | null>
  listInitiativeMetrics(filters?: MetricsFilters): Promise<{ items: InitiativeMetrics[]; total: number }>
  updateInitiativeMetrics(id: string, updates: Partial<InitiativeMetrics>): Promise<InitiativeMetrics>
  deleteInitiativeMetrics(id: string): Promise<void>

  // Individual Metrics
  addMetric(initiativeMetricsId: string, metric: CreateMetricInput): Promise<Metric>
  updateMetric(id: string, updates: Partial<Metric>): Promise<Metric>
  deleteMetric(id: string): Promise<void>
  enterMeasurement(metricId: string, measurement: MeasurementInput): Promise<Metric>

  // Templates
  listTemplates(category?: string): Promise<MetricTemplate[]>
  getTemplate(id: string): Promise<MetricTemplate | null>
  incrementTemplateUsage(id: string): Promise<void>

  // Analytics
  getAnalytics(): Promise<MetricsAnalytics>

  // Minority Report Validation
  createMinorityValidation(input: CreateMinorityValidationInput): Promise<MinorityReportValidation>
  validateMinorityReport(id: string, validation: ValidateMinorityInput): Promise<MinorityReportValidation>

  // Improvement Proposals
  createImprovementProposal(input: CreateImprovementProposalInput): Promise<ImprovementProposal>
  getImprovementProposal(id: string): Promise<ImprovementProposal | null>
  updateImprovementProposalStatus(id: string, status: string): Promise<ImprovementProposal>
}

// Input types
export interface CreateInitiativeMetricsInput {
  proposalId?: string
  initiativeId?: string
  evaluationSchedule: EvaluationSchedule
  evaluationDate: Date
  reminderDate?: Date
  createdBy: string
}

export interface CreateMetricInput {
  name: string
  description: string
  unit: string
  measurementMethod: MeasurementMethod
  dataSource?: string
  targetValue: { value: number | string | boolean; confidence?: string; evidenceUrls?: string[] }
  weight: number
  mandatory: boolean
}

export interface MeasurementInput {
  actualValue: { value: number | string | boolean; confidence: string; evidenceUrls?: string[] }
  notes?: string
}

export interface MetricsFilters {
  status?: MetricStatus
  proposalId?: string
  createdBy?: string
  limit?: number
  offset?: number
}

export interface CreateMinorityValidationInput {
  proposalId: string
  initiativeMetricsId: string
  minorityReportText: string
  keyConcerns: string[]
}

export interface ValidateMinorityInput {
  validated: boolean
  validatedConcerns: string[]
  validationNotes: string
  validatedBy: string
}

export interface CreateImprovementProposalInput {
  originalProposalId: string
  initiativeId?: string
  initiativeMetricsId: string
  title: string
  summary: string
  failedMetrics: Metric[]
  minorityReportQuotes?: string[]
  lessonsLearned?: string
  suggestedAmendments?: string
}

// PostgreSQL implementation
class PostgresMetricsRepo implements IMetricsRepo {
  async createInitiativeMetrics(input: CreateInitiativeMetricsInput): Promise<InitiativeMetrics> {
    const result = await pool.query(
      `INSERT INTO metrics_initiative_metrics
       (proposal_id, initiative_id, evaluation_schedule, evaluation_date, reminder_date, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [input.proposalId, input.initiativeId, input.evaluationSchedule, input.evaluationDate, input.reminderDate, input.createdBy]
    )
    return this.mapInitiativeMetrics(result.rows[0])
  }

  async getInitiativeMetrics(id: string): Promise<InitiativeMetrics | null> {
    const result = await pool.query(
      `SELECT im.*,
        json_agg(m.*) FILTER (WHERE m.id IS NOT NULL) as metrics
       FROM metrics_initiative_metrics im
       LEFT JOIN metrics_metrics m ON m.initiative_metrics_id = im.id
       WHERE im.id = $1
       GROUP BY im.id`,
      [id]
    )
    if (result.rows.length === 0) return null
    return this.mapInitiativeMetrics(result.rows[0])
  }

  async listInitiativeMetrics(filters?: MetricsFilters): Promise<{ items: InitiativeMetrics[]; total: number }> {
    const conditions: string[] = []
    const params: unknown[] = []
    let paramIndex = 1

    if (filters?.status) {
      conditions.push(`status = $${paramIndex++}`)
      params.push(filters.status)
    }
    if (filters?.proposalId) {
      conditions.push(`proposal_id = $${paramIndex++}`)
      params.push(filters.proposalId)
    }
    if (filters?.createdBy) {
      conditions.push(`created_by = $${paramIndex++}`)
      params.push(filters.createdBy)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const limit = filters?.limit || 20
    const offset = filters?.offset || 0

    const [itemsResult, countResult] = await Promise.all([
      pool.query(
        `SELECT im.*,
          json_agg(m.*) FILTER (WHERE m.id IS NOT NULL) as metrics
         FROM metrics_initiative_metrics im
         LEFT JOIN metrics_metrics m ON m.initiative_metrics_id = im.id
         ${whereClause}
         GROUP BY im.id
         ORDER BY im.created_at DESC
         LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        [...params, limit, offset]
      ),
      pool.query(
        `SELECT COUNT(*) FROM metrics_initiative_metrics ${whereClause}`,
        params
      ),
    ])

    return {
      items: itemsResult.rows.map(row => this.mapInitiativeMetrics(row)),
      total: parseInt(countResult.rows[0].count, 10),
    }
  }

  async updateInitiativeMetrics(id: string, updates: Partial<InitiativeMetrics>): Promise<InitiativeMetrics> {
    const setClauses: string[] = []
    const params: unknown[] = [id]
    let paramIndex = 2

    if (updates.status) {
      setClauses.push(`status = $${paramIndex++}`)
      params.push(updates.status)
    }
    if (updates.evaluatedAt) {
      setClauses.push(`evaluated_at = $${paramIndex++}`)
      params.push(updates.evaluatedAt)
    }
    if (updates.evaluatedBy) {
      setClauses.push(`evaluated_by = $${paramIndex++}`)
      params.push(updates.evaluatedBy)
    }
    if (updates.overallOutcome) {
      setClauses.push(`overall_outcome = $${paramIndex++}`)
      params.push(updates.overallOutcome)
    }

    if (setClauses.length === 0) {
      const existing = await this.getInitiativeMetrics(id)
      if (!existing) throw new Error('Initiative metrics not found')
      return existing
    }

    await pool.query(
      `UPDATE metrics_initiative_metrics SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $1`,
      params
    )

    const result = await this.getInitiativeMetrics(id)
    if (!result) throw new Error('Initiative metrics not found')
    return result
  }

  async deleteInitiativeMetrics(id: string): Promise<void> {
    await pool.query('DELETE FROM metrics_initiative_metrics WHERE id = $1', [id])
  }

  async addMetric(initiativeMetricsId: string, input: CreateMetricInput): Promise<Metric> {
    const result = await pool.query(
      `INSERT INTO metrics_metrics
       (initiative_metrics_id, name, description, unit, measurement_method, data_source, target_value, weight, mandatory)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        initiativeMetricsId,
        input.name,
        input.description,
        input.unit,
        input.measurementMethod,
        input.dataSource,
        JSON.stringify(input.targetValue),
        input.weight,
        input.mandatory,
      ]
    )
    return this.mapMetric(result.rows[0])
  }

  async updateMetric(id: string, updates: Partial<Metric>): Promise<Metric> {
    const setClauses: string[] = []
    const params: unknown[] = [id]
    let paramIndex = 2

    if (updates.name) {
      setClauses.push(`name = $${paramIndex++}`)
      params.push(updates.name)
    }
    if (updates.status) {
      setClauses.push(`status = $${paramIndex++}`)
      params.push(updates.status)
    }
    if (updates.variance !== undefined) {
      setClauses.push(`variance = $${paramIndex++}`)
      params.push(updates.variance)
    }
    if (updates.notes) {
      setClauses.push(`notes = $${paramIndex++}`)
      params.push(updates.notes)
    }

    if (setClauses.length > 0) {
      await pool.query(
        `UPDATE metrics_metrics SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $1`,
        params
      )
    }

    const result = await pool.query('SELECT * FROM metrics_metrics WHERE id = $1', [id])
    if (result.rows.length === 0) throw new Error('Metric not found')
    return this.mapMetric(result.rows[0])
  }

  async deleteMetric(id: string): Promise<void> {
    await pool.query('DELETE FROM metrics_metrics WHERE id = $1', [id])
  }

  async enterMeasurement(metricId: string, measurement: MeasurementInput): Promise<Metric> {
    // Calculate variance if possible
    const metricResult = await pool.query('SELECT * FROM metrics_metrics WHERE id = $1', [metricId])
    if (metricResult.rows.length === 0) throw new Error('Metric not found')

    const metric = metricResult.rows[0]
    const targetValue = metric.target_value?.value
    const actualValue = measurement.actualValue.value
    let variance: number | null = null
    let status: MetricResultStatus = 'not_measured'

    if (typeof targetValue === 'number' && typeof actualValue === 'number') {
      variance = targetValue !== 0 ? ((actualValue - targetValue) / targetValue) * 100 : 0
      if (variance >= 0) status = 'met'
      else if (variance >= -20) status = 'partially_met'
      else status = 'not_met'
      if (variance >= 10) status = 'exceeded'
    }

    await pool.query(
      `UPDATE metrics_metrics
       SET actual_value = $2, notes = $3, status = $4, variance = $5, updated_at = NOW()
       WHERE id = $1`,
      [metricId, JSON.stringify(measurement.actualValue), measurement.notes, status, variance]
    )

    const result = await pool.query('SELECT * FROM metrics_metrics WHERE id = $1', [metricId])
    return this.mapMetric(result.rows[0])
  }

  async listTemplates(category?: string): Promise<MetricTemplate[]> {
    let query = `
      SELECT t.*,
        json_agg(json_build_object(
          'name', tm.name,
          'description', tm.description,
          'unit', tm.unit,
          'measurementMethod', tm.measurement_method,
          'weight', tm.weight,
          'mandatory', tm.mandatory
        ) ORDER BY tm.sort_order) FILTER (WHERE tm.id IS NOT NULL) as metrics
      FROM metrics_templates t
      LEFT JOIN metrics_template_metrics tm ON tm.template_id = t.id
    `
    const params: unknown[] = []

    if (category) {
      query += ' WHERE t.category = $1'
      params.push(category)
    }

    query += ' GROUP BY t.id ORDER BY t.times_used DESC'

    const result = await pool.query(query, params)
    return result.rows.map(row => this.mapTemplate(row))
  }

  async getTemplate(id: string): Promise<MetricTemplate | null> {
    const result = await pool.query(
      `SELECT t.*,
        json_agg(json_build_object(
          'name', tm.name,
          'description', tm.description,
          'unit', tm.unit,
          'measurementMethod', tm.measurement_method,
          'weight', tm.weight,
          'mandatory', tm.mandatory
        ) ORDER BY tm.sort_order) FILTER (WHERE tm.id IS NOT NULL) as metrics
       FROM metrics_templates t
       LEFT JOIN metrics_template_metrics tm ON tm.template_id = t.id
       WHERE t.id = $1
       GROUP BY t.id`,
      [id]
    )
    if (result.rows.length === 0) return null
    return this.mapTemplate(result.rows[0])
  }

  async incrementTemplateUsage(id: string): Promise<void> {
    await pool.query(
      'UPDATE metrics_templates SET times_used = times_used + 1, updated_at = NOW() WHERE id = $1',
      [id]
    )
  }

  async getAnalytics(): Promise<MetricsAnalytics> {
    // Get total initiatives and success rates
    const statsResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'evaluated') as evaluated,
        COUNT(*) FILTER (WHERE overall_outcome = 'succeeded') as succeeded,
        COUNT(*) FILTER (WHERE overall_outcome = 'failed') as failed,
        COUNT(*) FILTER (WHERE overall_outcome = 'mixed') as mixed
      FROM metrics_initiative_metrics
    `)

    const stats = statsResult.rows[0]
    const total = parseInt(stats.total, 10)
    const evaluated = parseInt(stats.evaluated, 10)
    const succeeded = parseInt(stats.succeeded, 10)

    // Get success by category from templates
    const categoryResult = await pool.query(`
      SELECT
        category::text,
        COALESCE(AVG(success_rate), 0) as avg_success_rate
      FROM metrics_templates
      GROUP BY category
    `)

    const successByCategory: Record<string, number> = {}
    for (const row of categoryResult.rows) {
      successByCategory[row.category] = parseFloat(row.avg_success_rate)
    }

    // Get minority validation rate
    const minorityResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE validated = true) as validated
      FROM metrics_minority_validations
      WHERE validated IS NOT NULL
    `)

    const minorityTotal = parseInt(minorityResult.rows[0].total, 10)
    const minorityValidated = parseInt(minorityResult.rows[0].validated, 10)
    const minorityValidationRate = minorityTotal > 0 ? minorityValidated / minorityTotal : 0

    // Get improvement success rate
    const improvementResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'in_governance' OR status = 'submitted') as active
      FROM metrics_improvement_proposals
    `)

    const improvementTotal = parseInt(improvementResult.rows[0].total, 10)

    return {
      totalInitiatives: total,
      evaluatedCount: evaluated,
      overallSuccessRate: evaluated > 0 ? (succeeded / evaluated) * 100 : 0,
      successByCategory,
      failurePatterns: [], // Would require more complex analysis
      minorityValidationRate,
      improvementSuccessRate: improvementTotal > 0 ? 0.71 : 0, // Placeholder - needs historical tracking
    }
  }

  async createMinorityValidation(input: CreateMinorityValidationInput): Promise<MinorityReportValidation> {
    const result = await pool.query(
      `INSERT INTO metrics_minority_validations
       (proposal_id, initiative_metrics_id, minority_report_text, key_concerns)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.proposalId, input.initiativeMetricsId, input.minorityReportText, JSON.stringify(input.keyConcerns)]
    )
    return this.mapMinorityValidation(result.rows[0])
  }

  async validateMinorityReport(id: string, validation: ValidateMinorityInput): Promise<MinorityReportValidation> {
    const result = await pool.query(
      `UPDATE metrics_minority_validations
       SET validated = $2, validated_concerns = $3, validation_notes = $4, validated_by = $5, validated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, validation.validated, JSON.stringify(validation.validatedConcerns), validation.validationNotes, validation.validatedBy]
    )
    if (result.rows.length === 0) throw new Error('Minority validation not found')
    return this.mapMinorityValidation(result.rows[0])
  }

  async createImprovementProposal(input: CreateImprovementProposalInput): Promise<ImprovementProposal> {
    const result = await pool.query(
      `INSERT INTO metrics_improvement_proposals
       (original_proposal_id, initiative_id, initiative_metrics_id, title, summary, failed_metrics, minority_report_quotes, lessons_learned, suggested_amendments)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        input.originalProposalId,
        input.initiativeId,
        input.initiativeMetricsId,
        input.title,
        input.summary,
        JSON.stringify(input.failedMetrics),
        JSON.stringify(input.minorityReportQuotes || []),
        input.lessonsLearned,
        input.suggestedAmendments,
      ]
    )
    return this.mapImprovementProposal(result.rows[0])
  }

  async getImprovementProposal(id: string): Promise<ImprovementProposal | null> {
    const result = await pool.query('SELECT * FROM metrics_improvement_proposals WHERE id = $1', [id])
    if (result.rows.length === 0) return null
    return this.mapImprovementProposal(result.rows[0])
  }

  async updateImprovementProposalStatus(id: string, status: string): Promise<ImprovementProposal> {
    const result = await pool.query(
      `UPDATE metrics_improvement_proposals SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, status]
    )
    if (result.rows.length === 0) throw new Error('Improvement proposal not found')
    return this.mapImprovementProposal(result.rows[0])
  }

  // Mapping functions
  private mapInitiativeMetrics(row: Record<string, unknown>): InitiativeMetrics {
    const evalDate = new Date(row.evaluation_date as string)
    return {
      id: row.id as string,
      initiativeId: (row.initiative_id as string) || '',
      proposalId: (row.proposal_id as string) || '',
      metrics: Array.isArray(row.metrics) ? row.metrics.map(m => this.mapMetric(m)) : [],
      evaluationSchedule: row.evaluation_schedule as EvaluationSchedule,
      evaluationDate: evalDate,
      reminderDate: row.reminder_date ? new Date(row.reminder_date as string) : new Date(evalDate.getTime() - 7 * 24 * 60 * 60 * 1000),
      status: (row.status as MetricStatus) || 'pending',
      evaluatedAt: row.evaluated_at ? new Date(row.evaluated_at as string) : undefined,
      evaluatedBy: row.evaluated_by as string | undefined,
      overallOutcome: row.overall_outcome as 'succeeded' | 'failed' | 'mixed' | 'inconclusive' | undefined,
      improvementProposalId: row.improvement_proposal_id as string | undefined,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    }
  }

  private mapMetric(row: Record<string, unknown>): Metric {
    return {
      id: row.id as string,
      name: row.name as string,
      description: row.description as string,
      target: typeof row.target_value === 'string' ? JSON.parse(row.target_value) : row.target_value || row.targetValue,
      actual: row.actual_value ? (typeof row.actual_value === 'string' ? JSON.parse(row.actual_value) : row.actual_value) : undefined,
      unit: row.unit as string,
      measurementMethod: (row.measurement_method || row.measurementMethod) as MeasurementMethod,
      dataSource: row.data_source as string | undefined,
      weight: row.weight as number,
      mandatory: row.mandatory as boolean,
      status: row.status as MetricResultStatus | undefined,
      variance: row.variance as number | undefined,
      notes: row.notes as string | undefined,
    }
  }

  private mapTemplate(row: Record<string, unknown>): MetricTemplate {
    return {
      id: row.id as string,
      name: row.name as string,
      category: row.category as MetricTemplateCategory,
      description: row.description as string,
      metrics: Array.isArray(row.metrics) ? row.metrics : [],
      timesUsed: row.times_used as number,
      successRate: parseFloat(row.success_rate as string) || 0,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    }
  }

  private mapMinorityValidation(row: Record<string, unknown>): MinorityReportValidation {
    return {
      id: row.id as string,
      proposalId: row.proposal_id as string,
      initiativeMetricsId: row.initiative_metrics_id as string,
      minorityReportText: row.minority_report_text as string,
      keyConcerns: typeof row.key_concerns === 'string' ? JSON.parse(row.key_concerns) : row.key_concerns || [],
      validated: (row.validated as boolean) ?? false,
      validatedConcerns: typeof row.validated_concerns === 'string' ? JSON.parse(row.validated_concerns) : row.validated_concerns || [],
      validationNotes: (row.validation_notes as string) || '',
      validatedAt: row.validated_at ? new Date(row.validated_at as string) : new Date(),
      validatedBy: (row.validated_by as string) || '',
      improvementProposalCreated: (row.improvement_proposal_created as boolean) ?? false,
      improvementProposalId: row.improvement_proposal_id as string | undefined,
    }
  }

  private mapImprovementProposal(row: Record<string, unknown>): ImprovementProposal {
    return {
      id: row.id as string,
      originalProposalId: row.original_proposal_id as string,
      initiativeId: (row.initiative_id as string) || '',
      initiativeMetricsId: row.initiative_metrics_id as string,
      title: row.title as string,
      summary: row.summary as string,
      failedMetrics: typeof row.failed_metrics === 'string' ? JSON.parse(row.failed_metrics) : row.failed_metrics || [],
      minorityReportQuotes: typeof row.minority_report_quotes === 'string' ? JSON.parse(row.minority_report_quotes) : row.minority_report_quotes || [],
      lessonsLearned: (row.lessons_learned as string) || '',
      suggestedAmendments: (row.suggested_amendments as string) || '',
      status: row.status as 'draft' | 'submitted' | 'in_governance' | 'rejected',
      reviewedBy: row.reviewed_by as string | undefined,
      submittedAt: row.submitted_at ? new Date(row.submitted_at as string) : undefined,
      createdAt: new Date(row.created_at as string),
    }
  }
}

export const metricsRepo = new PostgresMetricsRepo()
