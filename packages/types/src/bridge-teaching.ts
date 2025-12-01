/**
 * Bridge Teaching Session Types
 *
 * Defines types for the Teaching Session feature that enables trainers
 * to teach Bridge how to respond to different user archetypes through
 * interactive role-play conversations.
 */

// ============================================================================
// ENUMS AND BASIC TYPES
// ============================================================================

/**
 * Conversation mode within a teaching session
 * - demo: Trainer demonstrates ideal responses while Bridge plays archetype
 * - practice: Bridge attempts responses while trainer plays archetype
 * - discussion: Both as themselves, analyzing and extracting patterns
 */
export type ConversationMode = 'demo' | 'practice' | 'discussion'

/**
 * Who is speaking in a conversation turn
 */
export type Speaker = 'trainer' | 'bridge'

/**
 * Rating for Bridge's practice attempts
 */
export type FeedbackRating = 'positive' | 'negative' | 'neutral'

/**
 * Session lifecycle status
 */
export type SessionStatus = 'active' | 'completed' | 'archived'

/**
 * Trust level for user archetypes
 */
export type TrustLevel = 'low' | 'medium' | 'high' | 'neutral'

/**
 * Types of debate/challenge Bridge can raise
 */
export type DebateType = 'counter' | 'challenge' | 'question' | 'alternative'

// ============================================================================
// USER ARCHETYPES
// ============================================================================

/**
 * Defines a user archetype that Bridge learns to handle
 * Each archetype has distinct communication needs and anti-patterns to avoid
 */
export interface UserArchetype {
  id: string
  name: string
  description: string
  mindset: string
  sentimentMarkers: string[]
  trustLevel: TrustLevel
  needs: string[]
  antiPatterns: string[]
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Predefined archetype IDs
 */
export type PredefinedArchetypeId =
  | 'skeptic'
  | 'enthusiast'
  | 'pragmatist'
  | 'wounded-helper'
  | 'curious-observer'

// ============================================================================
// TEACHING SESSION
// ============================================================================

/**
 * A complete teaching session containing setup, turns, and extracted patterns
 */
export interface TeachingSession {
  id: string
  trainerId: string
  trainerName?: string
  topic: string
  archetype: UserArchetype
  archetypeId: string
  status: SessionStatus
  turns: ConversationTurn[]
  extractedPatterns: ExtractedPattern[]
  totalDemoTurns: number
  totalPracticeTurns: number
  practiceSuccessRate: number | null
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

/**
 * Input for creating a new teaching session
 */
export interface CreateTeachingSessionInput {
  topic: string
  archetypeId: string
}

/**
 * Input for updating a teaching session
 */
export interface UpdateTeachingSessionInput {
  status?: SessionStatus
  completedAt?: Date
}

// ============================================================================
// CONVERSATION TURNS
// ============================================================================

/**
 * A single message/turn within a teaching session conversation
 */
export interface ConversationTurn {
  id: string
  sessionId: string
  mode: ConversationMode
  speaker: Speaker
  role: string // e.g., "as Skeptic", "demonstrating", "practicing"
  message: string
  feedback?: TurnFeedback
  explanation?: string // Trainer's explanation for demo responses
  isDebate: boolean
  debateType?: DebateType
  debateResolved?: boolean
  turnOrder: number
  createdAt: Date
}

/**
 * Feedback provided on a practice turn
 */
export interface TurnFeedback {
  rating: FeedbackRating
  comment?: string
  retryRequested: boolean
}

/**
 * Input for adding a new conversation turn
 */
export interface AddTurnInput {
  mode: ConversationMode
  speaker: Speaker
  role?: string
  message: string
  explanation?: string
  isDebate?: boolean
  debateType?: DebateType
}

/**
 * Input for providing feedback on a turn
 */
export interface ProvideFeedbackInput {
  turnId: string
  rating: FeedbackRating
  comment?: string
  retryRequested?: boolean
}

// ============================================================================
// DEBATE / CHALLENGE
// ============================================================================

/**
 * A debate or challenge raised by Bridge during training
 */
export interface DebateResponse {
  type: DebateType
  observation: string
  evidence?: string // Quote or reference proving the point
  counterArgument?: string
  alternatives?: string[]
  resolution?: string // What Bridge needs to proceed
}

/**
 * Context provided to debate engine for contradiction detection
 */
export interface DebateContext {
  sessionId: string
  previousTurns: ConversationTurn[]
  existingPatterns: ExtractedPattern[]
  currentMode: ConversationMode
  latestTrainerMessage: string
}

// ============================================================================
// EXTRACTED PATTERNS
// ============================================================================

/**
 * A learned response pattern extracted from teaching sessions
 */
export interface ExtractedPattern {
  id: string
  sessionId: string | null
  archetype: string
  sentimentMarkers: string[]
  topicContext: string[]
  principle: string
  responseGuidelines: ResponseGuidelines
  examples: PatternExample[]
  confidence: number // 0-1
  usageCount: number
  lastUsedAt?: Date
  isActive: boolean
  createdAt: Date
  refinedAt?: Date
  createdBy?: string
}

/**
 * Guidelines for how to respond when this pattern matches
 */
export interface ResponseGuidelines {
  openWith: string
  tone: string
  includeElements: string[]
  avoidElements: string[]
  nudgeToward: string
}

/**
 * Example interaction demonstrating a pattern
 */
export interface PatternExample {
  userMessage: string
  goodResponse: string
  explanation: string
}

/**
 * Input for extracting patterns from a session
 */
export interface ExtractPatternsInput {
  sessionId: string
  manualPrinciples?: string[] // Optional trainer-specified principles
}

/**
 * Input for refining an existing pattern
 */
export interface RefinePatternInput {
  principle?: string
  responseGuidelines?: Partial<ResponseGuidelines>
  examples?: PatternExample[]
  sentimentMarkers?: string[]
  topicContext?: string[]
  confidence?: number
  isActive?: boolean
}

// ============================================================================
// PATTERN MATCHING
// ============================================================================

/**
 * Result of matching patterns against a user message
 */
export interface MatchedPattern {
  pattern: ExtractedPattern
  matchConfidence: number
  matchedMarkers: string[]
  matchedTopics: string[]
}

/**
 * Context for pattern matching
 */
export interface PatternMatchContext {
  userMessage: string
  topic?: string
  previousTurns?: SimpleTurn[]
  detectedArchetype?: string
  detectedSentiment?: 'positive' | 'negative' | 'neutral' | 'mixed'
}

/**
 * Simplified turn for context
 */
export interface SimpleTurn {
  speaker: 'user' | 'bridge'
  message: string
}

// ============================================================================
// PATTERN USAGE TRACKING
// ============================================================================

/**
 * Record of a pattern being used in a real conversation
 */
export interface PatternUsage {
  id: string
  patternId: string
  conversationId?: string
  userMessage: string
  bridgeResponse: string
  matchConfidence: number
  userRating?: number // 1-5
  wasHelpful?: boolean
  createdAt: Date
}

/**
 * Input for recording pattern usage
 */
export interface RecordPatternUsageInput {
  patternId: string
  conversationId?: string
  userMessage: string
  bridgeResponse: string
  matchConfidence: number
}

// ============================================================================
// ADMIN/SUMMARY VIEWS
// ============================================================================

/**
 * Summary view of a pattern for admin display
 */
export interface PatternSummary {
  id: string
  archetype: string
  principle: string
  confidence: number
  usageCount: number
  isActive: boolean
  createdAt: Date
  refinedAt?: Date
  topic?: string
  sessionId?: string
  trainerId?: string
  trainerName?: string
  trainerEmail?: string
  avgRating: number
  helpfulRate: number
}

/**
 * Filters for querying patterns
 */
export interface PatternFilters {
  archetype?: string
  topic?: string
  isActive?: boolean
  minConfidence?: number
  minUsageCount?: number
  trainerId?: string
}

/**
 * Statistics for teaching sessions
 */
export interface TeachingStats {
  totalSessions: number
  completedSessions: number
  totalPatterns: number
  activePatterns: number
  avgPracticeSuccessRate: number
  patternsByArchetype: Record<string, number>
  recentSessions: TeachingSession[]
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface TeachingSessionResponse {
  success: boolean
  session?: TeachingSession
  error?: string
}

export interface TeachingSessionListResponse {
  success: boolean
  sessions?: TeachingSession[]
  total?: number
  error?: string
}

export interface PatternResponse {
  success: boolean
  pattern?: ExtractedPattern
  error?: string
}

export interface PatternListResponse {
  success: boolean
  patterns?: PatternSummary[]
  total?: number
  error?: string
}

export interface ExtractPatternsResponse {
  success: boolean
  patterns?: ExtractedPattern[]
  extractionNotes?: string
  error?: string
}

export interface DebateCheckResponse {
  hasDebate: boolean
  debate?: DebateResponse
}

// ============================================================================
// BRIDGE RESPONSE GENERATION
// ============================================================================

/**
 * Input for generating Bridge's archetype role-play message (Demo mode)
 */
export interface GenerateArchetypeMessageInput {
  archetype: UserArchetype
  topic: string
  conversationHistory: ConversationTurn[]
  lastTrainerResponse?: string
}

/**
 * Input for generating Bridge's practice response (Practice mode)
 */
export interface GeneratePracticeResponseInput {
  archetype: UserArchetype
  topic: string
  trainerMessage: string
  conversationHistory: ConversationTurn[]
  learnedPatterns: ExtractedPattern[]
  feedbackFromSession: TurnFeedback[]
}

/**
 * Output from Bridge response generation
 */
export interface BridgeGenerationOutput {
  message: string
  appliedPatterns?: string[] // IDs of patterns that influenced the response
  confidence?: number
  reasoning?: string // Internal reasoning (for debugging/transparency)
}
