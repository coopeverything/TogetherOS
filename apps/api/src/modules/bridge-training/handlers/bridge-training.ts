// apps/api/src/modules/bridge-training/handlers/bridge-training.ts
// API handlers for Bridge training interface

import type {
  BridgeTrainingExample,
  CreateTrainingExampleInput,
  RateBridgeResponseInput,
  ProvideIdealResponseInput,
  TrainingExampleFilters,
  PaginatedTrainingExamples,
  TrainingStatistics,
} from '@togetheros/types'
import { PostgresBridgeTrainingRepo } from '../repos/PostgresBridgeTrainingRepo'
import { BridgeTrainingRepo } from '../repos/BridgeTrainingRepo'

// Singleton repo for PostgreSQL storage
let trainingRepo: BridgeTrainingRepo | null = null

/**
 * Get or initialize training repo
 */
function getTrainingRepo(): BridgeTrainingRepo {
  if (!trainingRepo) {
    // Initialize PostgreSQL repository
    trainingRepo = new PostgresBridgeTrainingRepo()
  }
  return trainingRepo
}

/**
 * POST /api/bridge-training/examples
 * Create a new training example
 */
export async function createTrainingExample(
  input: CreateTrainingExampleInput,
  userId: string
): Promise<BridgeTrainingExample> {
  const repo = getTrainingRepo()
  return repo.create(input, userId)
}

/**
 * GET /api/bridge-training/examples/:id
 * Get single training example by ID
 */
export async function getTrainingExample(id: string): Promise<BridgeTrainingExample | null> {
  const repo = getTrainingRepo()
  return repo.findById(id)
}

/**
 * GET /api/bridge-training/examples
 * List training examples with filters and pagination
 */
export async function listTrainingExamples(
  filters: TrainingExampleFilters = {}
): Promise<PaginatedTrainingExamples> {
  const repo = getTrainingRepo()
  return repo.list(filters)
}

/**
 * POST /api/bridge-training/examples/:id/rate
 * Rate a Bridge response (helpfulness, accuracy, tone on 1-5 scale)
 */
export async function rateTrainingExample(
  input: RateBridgeResponseInput,
  userId: string
): Promise<BridgeTrainingExample | null> {
  const repo = getTrainingRepo()
  return repo.rateResponse(input, userId)
}

/**
 * POST /api/bridge-training/examples/:id/ideal
 * Provide ideal response for training example
 */
export async function provideIdealResponse(
  input: ProvideIdealResponseInput,
  userId: string
): Promise<BridgeTrainingExample | null> {
  const repo = getTrainingRepo()
  return repo.provideIdealResponse(input, userId)
}

/**
 * POST /api/bridge-training/examples/:id/approve
 * Approve a training example for use in training
 */
export async function approveTrainingExample(
  exampleId: string,
  userId: string,
  reviewNotes?: string
): Promise<BridgeTrainingExample | null> {
  const repo = getTrainingRepo()
  return repo.approve(exampleId, userId, reviewNotes)
}

/**
 * POST /api/bridge-training/examples/:id/reject
 * Reject a training example
 */
export async function rejectTrainingExample(
  exampleId: string,
  userId: string,
  reviewNotes: string
): Promise<BridgeTrainingExample | null> {
  const repo = getTrainingRepo()
  return repo.reject(exampleId, userId, reviewNotes)
}

/**
 * GET /api/bridge-training/statistics
 * Get training statistics
 */
export async function getTrainingStatistics(): Promise<TrainingStatistics> {
  const repo = getTrainingRepo()
  return repo.getStatistics()
}

/**
 * DELETE /api/bridge-training/examples/:id
 * Delete a training example (soft delete)
 */
export async function deleteTrainingExample(
  exampleId: string,
  userId: string
): Promise<{ success: boolean }> {
  const repo = getTrainingRepo()
  await repo.delete(exampleId, userId)
  return { success: true }
}
