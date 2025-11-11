// apps/api/src/modules/bridge-training/repos/InMemoryBridgeTrainingRepo.ts
// In-memory implementation of BridgeTrainingRepo

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

export class InMemoryBridgeTrainingRepo implements BridgeTrainingRepo {
  private examples: Map<string, BridgeTrainingExample> = new Map()

  constructor(initialExamples: BridgeTrainingExample[] = []) {
    initialExamples.forEach((example) => {
      this.examples.set(example.id, example)
    })
  }

  async create(
    input: CreateTrainingExampleInput,
    userId: string
  ): Promise<BridgeTrainingExample> {
    const now = new Date()
    const example: BridgeTrainingExample = {
      id: this.generateId(),
      question: input.question,
      contextPath: input.contextPath,
      questionCategory: input.questionCategory,
      bridgeResponse: input.bridgeResponse,
      bridgeModel: input.bridgeModel,
      bridgeTemperature: input.bridgeTemperature,
      bridgeSources: input.bridgeSources,
      bridgeResponseTimeMs: input.bridgeResponseTimeMs,
      trainingStatus: 'pending',
      usedInTraining: false,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    }

    this.examples.set(example.id, example)
    return example
  }

  async findById(id: string): Promise<BridgeTrainingExample | null> {
    return this.examples.get(id) || null
  }

  async update(
    input: UpdateTrainingExampleInput,
    userId: string
  ): Promise<BridgeTrainingExample | null> {
    const example = this.examples.get(input.exampleId);
    if (!example || example.deletedAt) return null;

    // Apply partial updates
    if (input.question !== undefined) {
      example.question = input.question;
    }
    if (input.bridgeResponse !== undefined) {
      example.bridgeResponse = input.bridgeResponse;
    }
    if (input.idealResponse !== undefined) {
      example.idealResponse = input.idealResponse;
    }
    if (input.helpfulnessRating !== undefined) {
      example.helpfulnessRating = input.helpfulnessRating;
    }
    if (input.accuracyRating !== undefined) {
      example.accuracyRating = input.accuracyRating;
    }
    if (input.toneRating !== undefined) {
      example.toneRating = input.toneRating;
    }

    example.updatedAt = new Date();

    return example;
  }

  async list(filters: TrainingExampleFilters = {}): Promise<PaginatedTrainingExamples> {
    let items = Array.from(this.examples.values()).filter((ex) => !ex.deletedAt)

    // Apply filters
    if (filters.status) {
      items = items.filter((ex) => ex.trainingStatus === filters.status)
    }
    if (filters.category) {
      items = items.filter((ex) => ex.questionCategory === filters.category)
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      items = items.filter(
        (ex) =>
          ex.question.toLowerCase().includes(query) ||
          ex.bridgeResponse.toLowerCase().includes(query) ||
          ex.idealResponse?.toLowerCase().includes(query)
      )
    }
    if (filters.minQualityScore !== undefined) {
      items = items.filter((ex) => (ex.qualityScore ?? 0) >= filters.minQualityScore!)
    }

    // Sort
    const sortBy = filters.sortBy || 'createdAt'
    const sortOrder = filters.sortOrder || 'desc'
    items.sort((a, b) => {
      let aVal: any
      let bVal: any

      switch (sortBy) {
        case 'qualityScore':
          aVal = a.qualityScore ?? 0
          bVal = b.qualityScore ?? 0
          break
        case 'status':
          aVal = a.trainingStatus
          bVal = b.trainingStatus
          break
        default: // createdAt
          aVal = a.createdAt.getTime()
          bVal = b.createdAt.getTime()
      }

      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      return sortOrder === 'desc' ? -comparison : comparison
    })

    // Paginate
    const page = filters.page || 1
    const pageSize = filters.pageSize || 20
    const total = items.length
    const totalPages = Math.ceil(total / pageSize)
    const offset = (page - 1) * pageSize
    const paginatedItems = items.slice(offset, offset + pageSize)

    return {
      items: paginatedItems,
      total,
      page,
      pageSize,
      totalPages,
    }
  }

  async findSimilar(
    searchQuery: string,
    options?: {
      status?: 'approved' | 'reviewed' | 'pending';
      minQualityScore?: number;
      limit?: number;
    }
  ): Promise<BridgeTrainingExample[]> {
    const status = options?.status || 'approved';
    const limit = options?.limit || 3;

    const queryLower = searchQuery.toLowerCase();

    // Note: quality_score rates Bridge's ORIGINAL answer, not the ideal response
    // So we DON'T filter by quality_score - low scores mean we SHOULD learn from ideal response!
    // We only require that an ideal_response exists
    let items = Array.from(this.examples.values())
      .filter((ex) => !ex.deletedAt)
      .filter((ex) => ex.trainingStatus === status)
      .filter((ex) => ex.idealResponse && ex.idealResponse.trim() !== '')
      .filter(
        (ex) =>
          ex.question.toLowerCase().includes(queryLower) ||
          ex.bridgeResponse.toLowerCase().includes(queryLower) ||
          ex.idealResponse?.toLowerCase().includes(queryLower)
      );

    // Sort by creation date descending (most recent first)
    items.sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return items.slice(0, limit);
  }

  async rateResponse(
    input: RateBridgeResponseInput,
    userId: string
  ): Promise<BridgeTrainingExample | null> {
    const example = this.examples.get(input.exampleId)
    if (!example) return null

    example.helpfulnessRating = input.helpfulnessRating
    example.accuracyRating = input.accuracyRating
    example.toneRating = input.toneRating

    // Calculate quality score (average of 3 ratings, scaled to 0-100)
    example.qualityScore = Math.round(
      ((input.helpfulnessRating + input.accuracyRating + input.toneRating) * 100) / 15
    )

    example.updatedAt = new Date()
    example.trainingStatus = 'reviewed'

    return example
  }

  async provideIdealResponse(
    input: ProvideIdealResponseInput,
    userId: string
  ): Promise<BridgeTrainingExample | null> {
    const example = this.examples.get(input.exampleId)
    if (!example) return null

    example.idealResponse = input.idealResponse
    example.idealSources = input.idealSources
    example.idealKeywords = input.idealKeywords
    example.reviewNotes = input.reviewNotes
    example.reviewedBy = userId
    example.reviewedAt = new Date()
    example.updatedAt = new Date()
    example.trainingStatus = 'reviewed'

    return example
  }

  async approve(
    exampleId: string,
    userId: string,
    reviewNotes?: string
  ): Promise<BridgeTrainingExample | null> {
    const example = this.examples.get(exampleId)
    if (!example) return null

    example.trainingStatus = 'approved'
    example.reviewedBy = userId
    example.reviewedAt = new Date()
    if (reviewNotes) example.reviewNotes = reviewNotes
    example.updatedAt = new Date()

    return example
  }

  async reject(
    exampleId: string,
    userId: string,
    reviewNotes: string
  ): Promise<BridgeTrainingExample | null> {
    const example = this.examples.get(exampleId)
    if (!example) return null

    example.trainingStatus = 'rejected'
    example.reviewedBy = userId
    example.reviewedAt = new Date()
    example.reviewNotes = reviewNotes
    example.updatedAt = new Date()

    return example
  }

  async getStatistics(): Promise<TrainingStatistics> {
    const allExamples = Array.from(this.examples.values()).filter((ex) => !ex.deletedAt)

    const totalExamples = allExamples.length
    const pendingReview = allExamples.filter((ex) => ex.trainingStatus === 'pending').length
    const approved = allExamples.filter((ex) => ex.trainingStatus === 'approved').length
    const rejected = allExamples.filter((ex) => ex.trainingStatus === 'rejected').length

    const withQualityScore = allExamples.filter((ex) => ex.qualityScore !== undefined)
    const averageQuality =
      withQualityScore.length > 0
        ? withQualityScore.reduce((sum, ex) => sum + (ex.qualityScore || 0), 0) /
          withQualityScore.length
        : 0

    const categoryCounts: Record<string, number> = {}
    allExamples.forEach((ex) => {
      if (ex.questionCategory) {
        categoryCounts[ex.questionCategory] = (categoryCounts[ex.questionCategory] || 0) + 1
      }
    })

    return {
      totalExamples,
      pendingReview,
      approved,
      rejected,
      averageQuality,
      categoryCounts,
      recentActivity: [], // Not implemented in MVP
    }
  }

  async delete(exampleId: string, userId: string): Promise<void> {
    const example = this.examples.get(exampleId)
    if (example) {
      example.deletedAt = new Date()
      example.deletedBy = userId
      example.updatedAt = new Date()
    }
  }

  private generateId(): string {
    return `example_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}
