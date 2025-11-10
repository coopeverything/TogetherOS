// apps/api/src/modules/bridge-training/repos/BridgeTrainingRepo.ts
// Repository interface for Bridge Training entity

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

/**
 * Bridge Training repository interface
 * Defines contract for training data access
 */
export interface BridgeTrainingRepo {
  /**
   * Create a new training example
   */
  create(input: CreateTrainingExampleInput, userId: string): Promise<BridgeTrainingExample>

  /**
   * Find training example by ID
   */
  findById(id: string): Promise<BridgeTrainingExample | null>

  /**
   * Update a training example (partial update)
   */
  update(input: UpdateTrainingExampleInput, userId: string): Promise<BridgeTrainingExample | null>

  /**
   * List training examples with filters and pagination
   */
  list(filters?: TrainingExampleFilters): Promise<PaginatedTrainingExamples>

  /**
   * Find similar training examples (for RAG in Q&A flow)
   * Returns approved examples with high quality scores, ordered by relevance
   */
  findSimilar(
    searchQuery: string,
    options?: {
      status?: 'approved' | 'reviewed' | 'pending';
      minQualityScore?: number;
      limit?: number;
    }
  ): Promise<BridgeTrainingExample[]>

  /**
   * Rate a Bridge response (helpfulness, accuracy, tone)
   */
  rateResponse(input: RateBridgeResponseInput, userId: string): Promise<BridgeTrainingExample | null>

  /**
   * Provide ideal response for training example
   */
  provideIdealResponse(
    input: ProvideIdealResponseInput,
    userId: string
  ): Promise<BridgeTrainingExample | null>

  /**
   * Approve a training example for use in training
   */
  approve(exampleId: string, userId: string, reviewNotes?: string): Promise<BridgeTrainingExample | null>

  /**
   * Reject a training example
   */
  reject(
    exampleId: string,
    userId: string,
    reviewNotes: string
  ): Promise<BridgeTrainingExample | null>

  /**
   * Get training statistics
   */
  getStatistics(): Promise<TrainingStatistics>

  /**
   * Delete a training example (soft delete)
   */
  delete(exampleId: string, userId: string): Promise<void>
}
