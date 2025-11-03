/**
 * Bridge Training Interface - TypeScript Types
 *
 * Types for the Bridge training system that allows admins to improve
 * Bridge's responses by providing example Q&A pairs with quality ratings.
 */

// Source citation format
export interface BridgeSource {
  path: string
  title: string
  url: string
}

// Core training example entity
export interface BridgeTrainingExample {
  id: string

  // Question and context
  question: string
  contextPath?: string
  questionCategory?: string

  // Bridge's response
  bridgeResponse: string
  bridgeModel: string
  bridgeTemperature?: number
  bridgeSources?: BridgeSource[]
  bridgeResponseTimeMs?: number

  // User ratings of Bridge's response (1-5 stars)
  helpfulnessRating?: number
  accuracyRating?: number
  toneRating?: number

  // User's ideal response
  idealResponse?: string
  idealSources?: BridgeSource[]
  idealKeywords?: string[]

  // Training metadata
  trainingStatus: 'pending' | 'reviewed' | 'approved' | 'rejected' | 'used_in_training'
  reviewedBy?: string
  reviewedAt?: Date
  reviewNotes?: string
  qualityScore?: number // Calculated 0-100

  // Training usage
  usedInTraining: boolean
  trainingBatchId?: string

  // Audit fields
  createdBy: string
  createdAt: Date
  updatedAt: Date
  ipHash?: string

  // Soft delete
  deletedAt?: Date
  deletedBy?: string
}

// Training batch entity
export interface BridgeTrainingBatch {
  id: string
  name: string
  description?: string
  trainingType: 'rag_enhancement' | 'fine_tuning' | 'prompt_engineering'

  config: Record<string, any>
  exampleCount: number

  status: 'draft' | 'ready' | 'training' | 'completed' | 'failed'
  startedAt?: Date
  completedAt?: Date
  errorMessage?: string

  metrics?: Record<string, any>
  modelArtifactUrl?: string

  createdBy: string
  createdAt: Date
}

// Feedback entity
export interface BridgeTrainingFeedback {
  id: string
  exampleId: string

  feedbackType: 'helpful' | 'incorrect' | 'incomplete' | 'tone_issue'
  feedbackText?: string

  submittedBy: string
  submittedAt: Date
  ipHash?: string
}

// Training session entity
export interface BridgeTrainingSession {
  id: string
  adminId: string
  sessionStart: Date
  sessionEnd?: Date

  examplesCreated: number
  examplesApproved: number
  examplesRejected: number

  ipHash?: string
  userAgent?: string
}

// Audit log entry
export interface BridgeTrainingAuditEntry {
  id: string
  timestamp: Date
  eventType:
    | 'training.example.created'
    | 'training.example.rated'
    | 'training.ideal.provided'
    | 'training.example.approved'
    | 'training.example.rejected'
    | 'training.batch.created'
    | 'training.batch.started'
    | 'training.batch.completed'
  actorId: string
  targetType: 'example' | 'batch' | 'session'
  targetId: string
  action: Record<string, any>
  metadata?: Record<string, any>
  ipHash?: string
}

// === Input Types for API ===

export interface CreateTrainingExampleInput {
  question: string
  contextPath?: string
  questionCategory?: string
  bridgeResponse: string
  bridgeModel: string
  bridgeTemperature?: number
  bridgeSources?: BridgeSource[]
  bridgeResponseTimeMs?: number
}

export interface RateBridgeResponseInput {
  exampleId: string
  helpfulnessRating: number // 1-5
  accuracyRating: number // 1-5
  toneRating: number // 1-5
}

export interface ProvideIdealResponseInput {
  exampleId: string
  idealResponse: string
  idealSources?: BridgeSource[]
  idealKeywords?: string[]
  reviewNotes?: string
}

export interface ApproveExampleInput {
  exampleId: string
  reviewNotes?: string
}

export interface RejectExampleInput {
  exampleId: string
  reviewNotes: string
}

export interface CreateTrainingBatchInput {
  name: string
  description?: string
  trainingType: 'rag_enhancement' | 'fine_tuning' | 'prompt_engineering'
  config: Record<string, any>
  exampleIds: string[]
}

export interface SubmitFeedbackInput {
  exampleId: string
  feedbackType: 'helpful' | 'incorrect' | 'incomplete' | 'tone_issue'
  feedbackText?: string
}

// === Query/Filter Types ===

export interface TrainingExampleFilters {
  status?: 'pending' | 'reviewed' | 'approved' | 'rejected'
  category?: string
  searchQuery?: string
  minQualityScore?: number
  sortBy?: 'createdAt' | 'qualityScore' | 'status'
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface PaginatedTrainingExamples {
  items: BridgeTrainingExample[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// === Statistics Types ===

export interface TrainingStatistics {
  totalExamples: number
  pendingReview: number
  approved: number
  rejected: number
  averageQuality: number
  categoryCounts: Record<string, number>
  recentActivity: BridgeTrainingSession[]
}

// === Export convenience types ===

export type TrainingExampleStatus = BridgeTrainingExample['trainingStatus']
export type TrainingBatchStatus = BridgeTrainingBatch['status']
export type TrainingBatchType = BridgeTrainingBatch['trainingType']
export type FeedbackType = BridgeTrainingFeedback['feedbackType']
