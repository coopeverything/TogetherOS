/**
 * Learning Paths, Lessons, and Quizzes type definitions
 * Based on onboarding enhancement spec - Phase 1 (schema + types)
 */

import { z } from 'zod'

// ============================================================
// Learning Path Types
// ============================================================

/**
 * Learning path categories
 */
export type LearningPathCategory =
  | 'getting-started'
  | 'governance'
  | 'economy'
  | 'community'
  | 'technology'
  | 'culture'

/**
 * Learning path definition
 */
export interface LearningPath {
  id: string
  slug: string
  title: string
  description?: string
  icon?: string // emoji
  category?: LearningPathCategory
  orderIndex: number
  isActive: boolean
  rpReward: number
  estimatedMinutes: number
  createdAt: Date
  updatedAt: Date
  // Computed/joined fields
  lessonCount?: number
  completedLessonCount?: number
}

/**
 * Learning path with lessons
 */
export interface LearningPathWithLessons extends LearningPath {
  lessons: Lesson[]
}

// ============================================================
// Lesson Types
// ============================================================

/**
 * Lesson content types
 */
export type LessonContentType = 'markdown' | 'structured' | 'video'

/**
 * Structured lesson content format
 */
export interface StructuredLessonContent {
  format: 'structured'
  structured: {
    introduction: string
    keyPoints: string[]
    example?: string
    reflection?: string
    nextSteps?: string
  }
}

/**
 * Markdown lesson content format
 */
export interface MarkdownLessonContent {
  format: 'markdown'
  markdown: string
}

/**
 * Video lesson content format
 */
export interface VideoLessonContent {
  format: 'video'
  video: {
    url: string
    provider: 'youtube' | 'vimeo' | 'self-hosted'
    duration?: number
    transcript?: string
  }
}

/**
 * Union type for lesson content
 */
export type LessonContent =
  | StructuredLessonContent
  | MarkdownLessonContent
  | VideoLessonContent

/**
 * Lesson definition
 */
export interface Lesson {
  id: string
  pathId: string
  slug: string
  title: string
  description?: string
  contentType: LessonContentType
  content: LessonContent
  orderIndex: number
  durationMinutes: number
  rpReward: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  // Computed/joined fields
  quiz?: Quiz
  userProgress?: UserLessonProgress
}

// ============================================================
// Quiz Types
// ============================================================

/**
 * Quiz question types
 */
export type QuizQuestionType = 'multiple_choice' | 'true_false' | 'multi_select'

/**
 * Quiz question option
 */
export interface QuizQuestionOption {
  id: string
  text: string
  isCorrect: boolean
}

/**
 * Quiz question definition
 */
export interface QuizQuestion {
  id: string
  quizId: string
  questionText: string
  questionType: QuizQuestionType
  options: QuizQuestionOption[]
  explanation?: string
  orderIndex: number
  points: number
  createdAt: Date
}

/**
 * Quiz definition
 */
export interface Quiz {
  id: string
  lessonId?: string
  title: string
  description?: string
  passingScore: number // percentage (0-100)
  rpReward: number
  maxAttempts: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  // Computed/joined fields
  questions?: QuizQuestion[]
  totalPoints?: number
  userAttempts?: UserQuizAttempt[]
}

// ============================================================
// User Progress Types
// ============================================================

/**
 * Progress status values
 */
export type ProgressStatus = 'started' | 'completed' | 'skipped'

/**
 * User's lesson progress
 */
export interface UserLessonProgress {
  id: string
  userId: string
  lessonId: string
  status: ProgressStatus
  startedAt: Date
  completedAt?: Date
  rpAwarded: number
  createdAt: Date
}

/**
 * User's path progress
 */
export interface UserPathProgress {
  id: string
  userId: string
  pathId: string
  status: 'started' | 'completed'
  lessonsCompleted: number
  startedAt: Date
  completedAt?: Date
  rpAwarded: number
  createdAt: Date
}

/**
 * User's quiz attempt
 */
export interface UserQuizAttempt {
  id: string
  userId: string
  quizId: string
  attemptNumber: number
  score: number // percentage (0-100)
  answers: Record<string, string | string[]> // questionId -> selectedOptionId(s)
  passed: boolean
  rpAwarded: number
  completedAt: Date
  createdAt: Date
}

// ============================================================
// API Input/Output Types
// ============================================================

/**
 * Input for creating a learning path
 */
export interface CreateLearningPathInput {
  slug: string
  title: string
  description?: string
  icon?: string
  category?: LearningPathCategory
  orderIndex?: number
  isActive?: boolean
  rpReward?: number
  estimatedMinutes?: number
}

/**
 * Input for updating a learning path
 */
export interface UpdateLearningPathInput {
  slug?: string
  title?: string
  description?: string
  icon?: string
  category?: LearningPathCategory
  orderIndex?: number
  isActive?: boolean
  rpReward?: number
  estimatedMinutes?: number
}

/**
 * Input for creating a lesson
 */
export interface CreateLessonInput {
  pathId: string
  slug: string
  title: string
  description?: string
  contentType: LessonContentType
  content: LessonContent
  orderIndex?: number
  durationMinutes?: number
  rpReward?: number
  isActive?: boolean
}

/**
 * Input for updating a lesson
 */
export interface UpdateLessonInput {
  slug?: string
  title?: string
  description?: string
  contentType?: LessonContentType
  content?: LessonContent
  orderIndex?: number
  durationMinutes?: number
  rpReward?: number
  isActive?: boolean
}

/**
 * Input for creating a quiz
 */
export interface CreateQuizInput {
  lessonId?: string
  title: string
  description?: string
  passingScore?: number
  rpReward?: number
  maxAttempts?: number
  isActive?: boolean
  questions?: CreateQuizQuestionInput[]
}

/**
 * Input for creating a quiz question
 */
export interface CreateQuizQuestionInput {
  questionText: string
  questionType: QuizQuestionType
  options: QuizQuestionOption[]
  explanation?: string
  orderIndex?: number
  points?: number
}

/**
 * Input for updating a quiz
 */
export interface UpdateQuizInput {
  lessonId?: string | null
  title?: string
  description?: string
  passingScore?: number
  rpReward?: number
  maxAttempts?: number
  isActive?: boolean
}

/**
 * Input for submitting quiz answers
 */
export interface SubmitQuizInput {
  userId: string
  quizId: string
  answers: Record<string, string | string[]>
}

/**
 * Result from submitting a quiz
 */
export interface QuizSubmitResult {
  passed: boolean
  score: number
  totalPoints: number
  earnedPoints: number
  rpAwarded: number
  attemptNumber: number
  attemptsRemaining: number
  questionResults: QuestionResult[]
}

/**
 * Individual question result
 */
export interface QuestionResult {
  questionId: string
  correct: boolean
  selectedOptions: string[]
  correctOptions: string[]
  explanation?: string
  pointsEarned: number
}

/**
 * Input for completing a lesson
 */
export interface CompleteLessonInput {
  userId: string
  lessonId: string
}

/**
 * Result from completing a lesson
 */
export interface LessonCompleteResult {
  success: boolean
  lessonId: string
  rpAwarded: number
  pathProgress?: {
    lessonsCompleted: number
    totalLessons: number
    pathCompleted: boolean
    pathRpAwarded?: number
  }
  badgesEarned?: string[]
}

// ============================================================
// Dashboard/Summary Types
// ============================================================

/**
 * User's overall learning progress summary
 */
export interface LearningProgressSummary {
  userId: string
  totalPaths: number
  completedPaths: number
  totalLessons: number
  completedLessons: number
  totalQuizzes: number
  passedQuizzes: number
  totalRPEarned: number
  currentStreak?: number
  lastActivityAt?: Date
}

/**
 * Learning path with user progress
 */
export interface LearningPathWithProgress extends LearningPath {
  userProgress?: UserPathProgress
  lessons: LessonWithProgress[]
}

/**
 * Lesson with user progress
 */
export interface LessonWithProgress extends Lesson {
  userProgress?: UserLessonProgress
  quizStatus?: 'not_attempted' | 'failed' | 'passed'
}

// ============================================================
// Zod Schemas for Validation
// ============================================================

/**
 * Schema for learning path category
 */
export const learningPathCategorySchema = z.enum([
  'getting-started',
  'governance',
  'economy',
  'community',
  'technology',
  'culture',
])

/**
 * Schema for lesson content type
 */
export const lessonContentTypeSchema = z.enum(['markdown', 'structured', 'video'])

/**
 * Schema for quiz question type
 */
export const quizQuestionTypeSchema = z.enum(['multiple_choice', 'true_false', 'multi_select'])

/**
 * Schema for quiz question option
 */
export const quizQuestionOptionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  isCorrect: z.boolean(),
})

/**
 * Schema for structured lesson content
 */
export const structuredContentSchema = z.object({
  format: z.literal('structured'),
  structured: z.object({
    introduction: z.string().min(1),
    keyPoints: z.array(z.string()).min(1),
    example: z.string().optional(),
    reflection: z.string().optional(),
    nextSteps: z.string().optional(),
  }),
})

/**
 * Schema for markdown lesson content
 */
export const markdownContentSchema = z.object({
  format: z.literal('markdown'),
  markdown: z.string().min(1),
})

/**
 * Schema for video lesson content
 */
export const videoContentSchema = z.object({
  format: z.literal('video'),
  video: z.object({
    url: z.string().url(),
    provider: z.enum(['youtube', 'vimeo', 'self-hosted']),
    duration: z.number().positive().optional(),
    transcript: z.string().optional(),
  }),
})

/**
 * Schema for lesson content (union)
 */
export const lessonContentSchema = z.discriminatedUnion('format', [
  structuredContentSchema,
  markdownContentSchema,
  videoContentSchema,
])

/**
 * Schema for creating a learning path
 */
export const createLearningPathSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  icon: z.string().max(10).optional(),
  category: learningPathCategorySchema.optional(),
  orderIndex: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  rpReward: z.number().int().min(0).max(1000).optional(),
  estimatedMinutes: z.number().int().min(1).max(300).optional(),
})

/**
 * Schema for updating a learning path
 */
export const updateLearningPathSchema = createLearningPathSchema.partial()

/**
 * Schema for creating a lesson
 */
export const createLessonSchema = z.object({
  pathId: z.string().uuid(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  contentType: lessonContentTypeSchema,
  content: lessonContentSchema,
  orderIndex: z.number().int().min(0).optional(),
  durationMinutes: z.number().int().min(1).max(120).optional(),
  rpReward: z.number().int().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
})

/**
 * Schema for updating a lesson
 */
export const updateLessonSchema = createLessonSchema.partial().omit({ pathId: true })

/**
 * Schema for creating a quiz question
 */
export const createQuizQuestionSchema = z.object({
  questionText: z.string().min(1).max(1000),
  questionType: quizQuestionTypeSchema,
  options: z.array(quizQuestionOptionSchema).min(2).max(6),
  explanation: z.string().max(1000).optional(),
  orderIndex: z.number().int().min(0).optional(),
  points: z.number().int().min(1).max(10).optional(),
})

/**
 * Schema for creating a quiz
 */
export const createQuizSchema = z.object({
  lessonId: z.string().uuid().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  passingScore: z.number().int().min(0).max(100).optional(),
  rpReward: z.number().int().min(0).max(100).optional(),
  maxAttempts: z.number().int().min(1).max(10).optional(),
  isActive: z.boolean().optional(),
  questions: z.array(createQuizQuestionSchema).optional(),
})

/**
 * Schema for updating a quiz
 */
export const updateQuizSchema = createQuizSchema.partial()

/**
 * Schema for submitting quiz answers
 */
export const submitQuizSchema = z.object({
  userId: z.string().uuid(),
  quizId: z.string().uuid(),
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
})

/**
 * Schema for completing a lesson
 */
export const completeLessonSchema = z.object({
  userId: z.string().uuid(),
  lessonId: z.string().uuid(),
})

// ============================================================
// Constants
// ============================================================

/**
 * Default RP rewards for learning activities
 */
export const LEARNING_RP_DEFAULTS = {
  LESSON_COMPLETE: 10,
  QUIZ_PASS: 25,
  QUIZ_PERFECT: 10, // bonus for 100%
  PATH_COMPLETE: 50,
  ALL_PATHS_COMPLETE: 100,
} as const

/**
 * Default quiz settings
 */
export const QUIZ_DEFAULTS = {
  PASSING_SCORE: 70,
  MAX_ATTEMPTS: 3,
  RP_REWARD: 25,
} as const

/**
 * Learning path category display names
 */
export const LEARNING_PATH_CATEGORY_LABELS: Record<LearningPathCategory, string> = {
  'getting-started': 'Getting Started',
  governance: 'Governance',
  economy: 'Economy',
  community: 'Community',
  technology: 'Technology',
  culture: 'Culture',
}

/**
 * Get display label for a category
 */
export function getCategoryLabel(category: LearningPathCategory): string {
  return LEARNING_PATH_CATEGORY_LABELS[category]
}

/**
 * Calculate quiz score from answers
 */
export function calculateQuizScore(
  questions: QuizQuestion[],
  answers: Record<string, string | string[]>
): { score: number; totalPoints: number; earnedPoints: number } {
  let totalPoints = 0
  let earnedPoints = 0

  for (const question of questions) {
    totalPoints += question.points
    const userAnswer = answers[question.id]
    const correctOptions = question.options.filter(o => o.isCorrect).map(o => o.id)

    if (question.questionType === 'multi_select') {
      const selectedArray = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
      const isCorrect =
        selectedArray.length === correctOptions.length &&
        selectedArray.every(s => correctOptions.includes(s))
      if (isCorrect) earnedPoints += question.points
    } else {
      const selectedId = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer
      if (correctOptions.includes(selectedId)) {
        earnedPoints += question.points
      }
    }
  }

  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0

  return { score, totalPoints, earnedPoints }
}
