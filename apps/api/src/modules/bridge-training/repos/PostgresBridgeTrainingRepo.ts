// apps/api/src/modules/bridge-training/repos/PostgresBridgeTrainingRepo.ts
// PostgreSQL implementation of BridgeTrainingRepo

import type {
  BridgeTrainingExample,
  CreateTrainingExampleInput,
  UpdateTrainingExampleInput,
  RateBridgeResponseInput,
  ProvideIdealResponseInput,
  TrainingExampleFilters,
  PaginatedTrainingExamples,
  TrainingStatistics,
} from '@togetheros/types'
import { BridgeTrainingRepo } from './BridgeTrainingRepo'
// @ts-ignore - TS6059/TS6307: lib/db path alias outside apps/api rootDir (CI only)
// Runtime works correctly. Proper fix: Create @togetheros/db package (see docs/dev/tech-debt.md)
import { query } from '@/lib/db'

export class PostgresBridgeTrainingRepo implements BridgeTrainingRepo {
  /**
   * Map database row to TypeScript entity
   */
  private mapRowToExample(row: any): BridgeTrainingExample {
    return {
      id: row.id,
      question: row.question,
      contextPath: row.context_path,
      questionCategory: row.question_category,
      bridgeResponse: row.bridge_response,
      bridgeModel: row.bridge_model,
      bridgeTemperature: row.bridge_temperature,
      bridgeSources: row.bridge_sources,
      bridgeResponseTimeMs: row.bridge_response_time_ms,
      helpfulnessRating: row.helpfulness_rating,
      accuracyRating: row.accuracy_rating,
      toneRating: row.tone_rating,
      idealResponse: row.ideal_response,
      idealSources: row.ideal_sources,
      idealKeywords: row.ideal_keywords,
      trainingStatus: row.training_status,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      reviewNotes: row.review_notes,
      qualityScore: row.quality_score,
      usedInTraining: row.used_in_training,
      trainingBatchId: row.training_batch_id,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      ipHash: row.ip_hash,
      deletedAt: row.deleted_at,
      deletedBy: row.deleted_by,
    }
  }

  async create(
    input: CreateTrainingExampleInput,
    userId: string
  ): Promise<BridgeTrainingExample> {
    const result = await query<any>(
      `INSERT INTO bridge_training_examples (
        question,
        context_path,
        question_category,
        bridge_response,
        bridge_model,
        bridge_temperature,
        bridge_sources,
        bridge_response_time_ms,
        training_status,
        used_in_training,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        input.question,
        input.contextPath || null,
        input.questionCategory || null,
        input.bridgeResponse,
        input.bridgeModel,
        input.bridgeTemperature || null,
        input.bridgeSources ? JSON.stringify(input.bridgeSources) : null,
        input.bridgeResponseTimeMs || null,
        'pending',
        false,
        userId,
      ]
    )

    return this.mapRowToExample(result.rows[0])
  }

  async findById(id: string): Promise<BridgeTrainingExample | null> {
    const result = await query<any>(
      `SELECT * FROM bridge_training_examples WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    )

    if (result.rows.length === 0) {
      return null
    }

    return this.mapRowToExample(result.rows[0])
  }

  async update(
    input: UpdateTrainingExampleInput,
    userId: string
  ): Promise<BridgeTrainingExample | null> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Build dynamic UPDATE clause
    if (input.question !== undefined) {
      updates.push(`question = $${paramIndex}`);
      params.push(input.question);
      paramIndex++;
    }

    if (input.bridgeResponse !== undefined) {
      updates.push(`bridge_response = $${paramIndex}`);
      params.push(input.bridgeResponse);
      paramIndex++;
    }

    if (input.idealResponse !== undefined) {
      updates.push(`ideal_response = $${paramIndex}`);
      params.push(input.idealResponse);
      paramIndex++;
    }

    if (input.helpfulnessRating !== undefined) {
      updates.push(`helpfulness_rating = $${paramIndex}`);
      params.push(input.helpfulnessRating);
      paramIndex++;
    }

    if (input.accuracyRating !== undefined) {
      updates.push(`accuracy_rating = $${paramIndex}`);
      params.push(input.accuracyRating);
      paramIndex++;
    }

    if (input.toneRating !== undefined) {
      updates.push(`tone_rating = $${paramIndex}`);
      params.push(input.toneRating);
      paramIndex++;
    }

    if (updates.length === 0) {
      // No fields to update
      return this.findById(input.exampleId);
    }

    // Always update updated_at
    updates.push(`updated_at = NOW()`);

    const result = await query<any>(
      `UPDATE bridge_training_examples
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex} AND deleted_at IS NULL
       RETURNING *`,
      [...params, input.exampleId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToExample(result.rows[0]);
  }

  async list(filters: TrainingExampleFilters = {}): Promise<PaginatedTrainingExamples> {
    const conditions: string[] = ['deleted_at IS NULL']
    const params: any[] = []
    let paramIndex = 1

    // Apply filters
    if (filters.status) {
      conditions.push(`training_status = $${paramIndex}`)
      params.push(filters.status)
      paramIndex++
    }

    if (filters.category) {
      conditions.push(`question_category = $${paramIndex}`)
      params.push(filters.category)
      paramIndex++
    }

    if (filters.searchQuery) {
      conditions.push(
        `(question ILIKE $${paramIndex} OR bridge_response ILIKE $${paramIndex} OR ideal_response ILIKE $${paramIndex})`
      )
      params.push(`%${filters.searchQuery}%`)
      paramIndex++
    }

    if (filters.minQualityScore !== undefined) {
      conditions.push(`quality_score >= $${paramIndex}`)
      params.push(filters.minQualityScore)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Get total count
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM bridge_training_examples ${whereClause}`,
      params
    )
    const total = parseInt(countResult.rows[0].count)

    // Sort
    const sortBy = filters.sortBy || 'createdAt'
    const sortOrder = filters.sortOrder || 'desc'

    // Sanitize sortOrder to prevent SQL injection (only allow 'asc' or 'desc')
    const sanitizedSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC'

    let orderByColumn = 'created_at'

    switch (sortBy) {
      case 'qualityScore':
        orderByColumn = 'quality_score'
        break
      case 'status':
        orderByColumn = 'training_status'
        break
      default:
        orderByColumn = 'created_at'
    }

    const orderByClause = `ORDER BY ${orderByColumn} ${sanitizedSortOrder}`

    // Paginate
    const page = filters.page || 1
    const pageSize = filters.pageSize || 20
    const offset = (page - 1) * pageSize

    // Add pagination parameters to params array
    const limitIndex = paramIndex
    const offsetIndex = paramIndex + 1

    const result = await query<any>(
      `SELECT * FROM bridge_training_examples
       ${whereClause}
       ${orderByClause}
       LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
      [...params, pageSize, offset]
    )

    const items = result.rows.map((row) => this.mapRowToExample(row))
    const totalPages = Math.ceil(total / pageSize)

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    }
  }

  async findSimilar(
    query: string,
    options?: {
      status?: 'approved' | 'reviewed' | 'pending';
      minQualityScore?: number;
      limit?: number;
    }
  ): Promise<BridgeTrainingExample[]> {
    const status = options?.status || 'approved';
    const minQualityScore = options?.minQualityScore || 80;
    const limit = options?.limit || 3;

    // Use PostgreSQL full-text search for keyword matching
    // Future improvement: Use embeddings for semantic search
    const result = await query<any>(
      `SELECT * FROM bridge_training_examples
       WHERE training_status = $1
         AND quality_score >= $2
         AND deleted_at IS NULL
         AND (
           question ILIKE $3
           OR bridge_response ILIKE $3
           OR ideal_response ILIKE $3
         )
       ORDER BY quality_score DESC, created_at DESC
       LIMIT $4`,
      [status, minQualityScore, `%${query}%`, limit]
    );

    return result.rows.map((row: any) => this.mapRowToExample(row));
  }

  async rateResponse(
    input: RateBridgeResponseInput,
    userId: string
  ): Promise<BridgeTrainingExample | null> {
    const result = await query<any>(
      `UPDATE bridge_training_examples
       SET helpfulness_rating = $1,
           accuracy_rating = $2,
           tone_rating = $3,
           training_status = 'reviewed'
       WHERE id = $4 AND deleted_at IS NULL
       RETURNING *`,
      [
        input.helpfulnessRating,
        input.accuracyRating,
        input.toneRating,
        input.exampleId,
      ]
    )

    if (result.rows.length === 0) {
      return null
    }

    return this.mapRowToExample(result.rows[0])
  }

  async provideIdealResponse(
    input: ProvideIdealResponseInput,
    userId: string
  ): Promise<BridgeTrainingExample | null> {
    const result = await query<any>(
      `UPDATE bridge_training_examples
       SET ideal_response = $1,
           ideal_sources = $2,
           ideal_keywords = $3,
           review_notes = $4,
           reviewed_by = $5,
           reviewed_at = NOW(),
           training_status = 'reviewed'
       WHERE id = $6 AND deleted_at IS NULL
       RETURNING *`,
      [
        input.idealResponse,
        input.idealSources ? JSON.stringify(input.idealSources) : null,
        input.idealKeywords || null,
        input.reviewNotes || null,
        userId,
        input.exampleId,
      ]
    )

    if (result.rows.length === 0) {
      return null
    }

    return this.mapRowToExample(result.rows[0])
  }

  async approve(
    exampleId: string,
    userId: string,
    reviewNotes?: string
  ): Promise<BridgeTrainingExample | null> {
    const result = await query<any>(
      `UPDATE bridge_training_examples
       SET training_status = 'approved',
           reviewed_by = $1,
           reviewed_at = NOW(),
           review_notes = COALESCE($2, review_notes)
       WHERE id = $3 AND deleted_at IS NULL
       RETURNING *`,
      [userId, reviewNotes || null, exampleId]
    )

    if (result.rows.length === 0) {
      return null
    }

    return this.mapRowToExample(result.rows[0])
  }

  async reject(
    exampleId: string,
    userId: string,
    reviewNotes: string
  ): Promise<BridgeTrainingExample | null> {
    const result = await query<any>(
      `UPDATE bridge_training_examples
       SET training_status = 'rejected',
           reviewed_by = $1,
           reviewed_at = NOW(),
           review_notes = $2
       WHERE id = $3 AND deleted_at IS NULL
       RETURNING *`,
      [userId, reviewNotes, exampleId]
    )

    if (result.rows.length === 0) {
      return null
    }

    return this.mapRowToExample(result.rows[0])
  }

  async getStatistics(): Promise<TrainingStatistics> {
    // Get counts by status
    const statusResult = await query<{
      training_status: string
      count: string
    }>(
      `SELECT training_status, COUNT(*) as count
       FROM bridge_training_examples
       WHERE deleted_at IS NULL
       GROUP BY training_status`
    )

    let totalExamples = 0
    let pendingReview = 0
    let approved = 0
    let rejected = 0

    statusResult.rows.forEach((row) => {
      const count = parseInt(row.count)
      totalExamples += count

      if (row.training_status === 'pending') {
        pendingReview = count
      } else if (row.training_status === 'approved') {
        approved = count
      } else if (row.training_status === 'rejected') {
        rejected = count
      }
    })

    // Get average quality score
    const avgResult = await query<{ avg: string }>(
      `SELECT AVG(quality_score) as avg
       FROM bridge_training_examples
       WHERE deleted_at IS NULL AND quality_score IS NOT NULL`
    )

    const averageQuality = avgResult.rows[0]?.avg
      ? parseFloat(avgResult.rows[0].avg)
      : 0

    // Get category counts
    const categoryResult = await query<{
      question_category: string
      count: string
    }>(
      `SELECT question_category, COUNT(*) as count
       FROM bridge_training_examples
       WHERE deleted_at IS NULL AND question_category IS NOT NULL
       GROUP BY question_category`
    )

    const categoryCounts: Record<string, number> = {}
    categoryResult.rows.forEach((row) => {
      categoryCounts[row.question_category] = parseInt(row.count)
    })

    return {
      totalExamples,
      pendingReview,
      approved,
      rejected,
      averageQuality,
      categoryCounts,
      recentActivity: [], // Not implemented in this phase
    }
  }

  async delete(exampleId: string, userId: string): Promise<void> {
    await query(
      `UPDATE bridge_training_examples
       SET deleted_at = NOW(),
           deleted_by = $1
       WHERE id = $2`,
      [userId, exampleId]
    )
  }
}
