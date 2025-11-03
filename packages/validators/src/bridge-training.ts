/**
 * Bridge Training Interface - Zod Validators
 *
 * Validates input for the Bridge training system that allows admins to improve
 * Bridge's responses by providing example Q&A pairs with quality ratings.
 */

import { z } from 'zod'

// Source citation schema
export const bridgeSourceSchema = z.object({
  path: z.string().min(1, 'Source path is required'),
  title: z.string().min(1, 'Source title is required'),
  url: z.string().url('Invalid source URL'),
})

// Training example status enum
export const trainingStatusSchema = z.enum([
  'pending',
  'reviewed',
  'approved',
  'rejected',
  'used_in_training',
])

// Training batch status enum
export const trainingBatchStatusSchema = z.enum([
  'draft',
  'ready',
  'training',
  'completed',
  'failed',
])

// Training batch type enum
export const trainingBatchTypeSchema = z.enum([
  'rag_enhancement',
  'fine_tuning',
  'prompt_engineering',
])

// Feedback type enum
export const feedbackTypeSchema = z.enum([
  'helpful',
  'incorrect',
  'incomplete',
  'tone_issue',
])

// === Input Validators ===

// Create training example
export const createTrainingExampleSchema = z.object({
  question: z.string().min(1, 'Question is required').max(5000, 'Question too long'),
  contextPath: z.string().max(500).optional(),
  questionCategory: z.string().max(100).optional(),
  bridgeResponse: z.string().min(1, 'Bridge response is required'),
  bridgeModel: z.string().min(1, 'Bridge model is required').max(50),
  bridgeTemperature: z.number().min(0).max(2).optional(),
  bridgeSources: z.array(bridgeSourceSchema).optional(),
  bridgeResponseTimeMs: z.number().int().positive().optional(),
})

// Rate Bridge response (1-5 stars for each metric)
export const rateBridgeResponseSchema = z.object({
  exampleId: z.string().uuid('Invalid example ID'),
  helpfulnessRating: z
    .number()
    .int()
    .min(1, 'Helpfulness rating must be at least 1')
    .max(5, 'Helpfulness rating cannot exceed 5'),
  accuracyRating: z
    .number()
    .int()
    .min(1, 'Accuracy rating must be at least 1')
    .max(5, 'Accuracy rating cannot exceed 5'),
  toneRating: z
    .number()
    .int()
    .min(1, 'Tone rating must be at least 1')
    .max(5, 'Tone rating cannot exceed 5'),
})

// Provide ideal response
export const provideIdealResponseSchema = z.object({
  exampleId: z.string().uuid('Invalid example ID'),
  idealResponse: z
    .string()
    .min(1, 'Ideal response is required')
    .max(10000, 'Ideal response too long'),
  idealSources: z.array(bridgeSourceSchema).optional(),
  idealKeywords: z.array(z.string().max(50)).max(20).optional(),
  reviewNotes: z.string().max(2000).optional(),
})

// Approve example
export const approveExampleSchema = z.object({
  exampleId: z.string().uuid('Invalid example ID'),
  reviewNotes: z.string().max(2000).optional(),
})

// Reject example
export const rejectExampleSchema = z.object({
  exampleId: z.string().uuid('Invalid example ID'),
  reviewNotes: z.string().min(1, 'Review notes are required for rejection').max(2000),
})

// Create training batch
export const createTrainingBatchSchema = z.object({
  name: z.string().min(1, 'Batch name is required').max(255),
  description: z.string().max(2000).optional(),
  trainingType: trainingBatchTypeSchema,
  config: z.record(z.string(), z.any()),
  exampleIds: z.array(z.string().uuid()).min(1, 'At least one example is required'),
})

// Submit feedback
export const submitFeedbackSchema = z.object({
  exampleId: z.string().uuid('Invalid example ID'),
  feedbackType: feedbackTypeSchema,
  feedbackText: z.string().max(2000).optional(),
})

// === Query/Filter Validators ===

// Training example filters
export const trainingExampleFiltersSchema = z.object({
  status: trainingStatusSchema.optional(),
  category: z.string().max(100).optional(),
  searchQuery: z.string().max(500).optional(),
  minQualityScore: z.number().int().min(0).max(100).optional(),
  sortBy: z.enum(['createdAt', 'qualityScore', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().optional().default(1),
  pageSize: z.number().int().positive().max(100).optional().default(20),
})

// === Type Inference Exports ===
// These allow TypeScript to infer types from Zod schemas

export type BridgeSourceInput = z.infer<typeof bridgeSourceSchema>
export type CreateTrainingExampleInput = z.infer<typeof createTrainingExampleSchema>
export type RateBridgeResponseInput = z.infer<typeof rateBridgeResponseSchema>
export type ProvideIdealResponseInput = z.infer<typeof provideIdealResponseSchema>
export type ApproveExampleInput = z.infer<typeof approveExampleSchema>
export type RejectExampleInput = z.infer<typeof rejectExampleSchema>
export type CreateTrainingBatchInput = z.infer<typeof createTrainingBatchSchema>
export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>
export type TrainingExampleFilters = z.infer<typeof trainingExampleFiltersSchema>
