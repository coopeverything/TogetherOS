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

export interface UpdateTrainingExampleInput {
  exampleId: string
  question?: string
  bridgeResponse?: string
  idealResponse?: string
  helpfulnessRating?: number // 1-5
  accuracyRating?: number // 1-5
  toneRating?: number // 1-5
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

// === Conversational Training Types ===

// Conversation entity - represents a multi-turn training conversation
export interface BridgeConversation {
  id: string

  // Conversation metadata
  title?: string // Optional title for the conversation
  category?: string

  // Conversation status
  status: 'in_progress' | 'completed' | 'archived'

  // Quality metrics
  averageQualityScore?: number // Average of all message ratings
  totalMessages: number
  ratedMessages: number

  // Training metadata
  trainingStatus: 'pending' | 'reviewed' | 'approved' | 'rejected' | 'used_in_training'
  usedInTraining: boolean
  trainingBatchId?: string

  // Audit fields
  createdBy: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  ipHash?: string

  // Soft delete
  deletedAt?: Date
  deletedBy?: string
}

// Message entity - represents individual messages in a conversation
export interface BridgeMessage {
  id: string
  conversationId: string

  // Message content
  role: 'user' | 'assistant' // user = member, assistant = Bridge
  content: string

  // Bridge-specific metadata (only for assistant messages)
  bridgeModel?: string
  bridgeTemperature?: number
  bridgeSources?: BridgeSource[]
  bridgeResponseTimeMs?: number

  // Message ordering
  sequenceNumber: number // 0, 1, 2, 3... for ordering

  // Timestamps
  createdAt: Date

  // Soft delete
  deletedAt?: Date
}

// Message rating entity - ratings for Bridge responses (assistant messages only)
export interface BridgeMessageRating {
  id: string
  messageId: string
  conversationId: string

  // Quality rating (1-5 stars) - single rating for both questions and answers
  qualityScore: number

  // Operator's ideal alternative response
  idealResponse?: string
  idealSources?: BridgeSource[]

  // Rating metadata
  ratingNotes?: string

  // Audit fields
  ratedBy: string
  ratedAt: Date
  updatedAt: Date
}

// === Input Types for Conversational Training API ===

export interface CreateConversationInput {
  title?: string
  category?: string
  initialQuestion: string // First user message
}

export interface AddMessageInput {
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  bridgeModel?: string
  bridgeTemperature?: number
  bridgeSources?: BridgeSource[]
  bridgeResponseTimeMs?: number
}

export interface RateMessageInput {
  messageId: string
  qualityScore: number // 1-5
  idealResponse?: string
  idealSources?: BridgeSource[]
  ratingNotes?: string
}

export interface CompleteConversationInput {
  conversationId: string
}

// === Query/Filter Types for Conversations ===

export interface ConversationFilters {
  status?: 'in_progress' | 'completed' | 'archived'
  trainingStatus?: 'pending' | 'reviewed' | 'approved' | 'rejected'
  category?: string
  searchQuery?: string
  minQualityScore?: number
  sortBy?: 'createdAt' | 'averageQualityScore' | 'totalMessages'
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface PaginatedConversations {
  items: BridgeConversation[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ConversationWithMessages {
  conversation: BridgeConversation
  messages: BridgeMessage[]
  ratings: BridgeMessageRating[]
}

// === Export convenience types ===

export type TrainingExampleStatus = BridgeTrainingExample['trainingStatus']
export type TrainingBatchStatus = BridgeTrainingBatch['status']
export type TrainingBatchType = BridgeTrainingBatch['trainingType']
export type FeedbackType = BridgeTrainingFeedback['feedbackType']
export type ConversationStatus = BridgeConversation['status']
export type MessageRole = BridgeMessage['role']
