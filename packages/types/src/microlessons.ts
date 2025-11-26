/**
 * Microlessons type definitions
 * Educational content linked to challenges
 */

import type { ChallengeCategory, ChallengeActionType } from './challenges'

/**
 * Microlesson content formats
 */
export type MicrolessonFormat = 'structured' | 'markdown' | 'media'

/**
 * Structured content (5-part format)
 */
export interface StructuredContent {
  introduction: string
  keyPoints: string[]
  example?: string
  reflection?: string
  nextSteps?: string
}

/**
 * Media item for video/image content
 */
export interface MediaItem {
  type: 'video' | 'image' | 'audio'
  url: string
  caption?: string
  duration?: number // seconds for video/audio
}

/**
 * Microlesson content - supports all 3 formats
 */
export interface MicrolessonContent {
  format: MicrolessonFormat
  structured?: StructuredContent
  markdown?: string
  media?: MediaItem[]
}

/**
 * Gamification microlesson definition
 */
export interface GamificationMicrolesson {
  id: string
  title: string
  description: string
  category: ChallengeCategory
  content: MicrolessonContent
  rpReward: number
  estimatedMinutes: number
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

/**
 * User's microlesson completion record
 */
export interface UserMicrolesson {
  id: string
  userId: string
  microlessonId: string
  microlesson?: GamificationMicrolesson
  completedAt: Date
  rpAwarded: number
  createdAt: Date
}

/**
 * Onboarding suggestion linking challenge to microlesson
 */
export interface OnboardingSuggestion {
  id: string
  challengeId: string
  microlessonId?: string
  suggestedOrder: number
  reason: string
  actionType: ChallengeActionType
  category: ChallengeCategory
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Input for creating/updating a microlesson
 */
export interface MicrolessonInput {
  title: string
  description: string
  category: ChallengeCategory
  content: MicrolessonContent
  rpReward?: number
  estimatedMinutes?: number
  isActive?: boolean
  sortOrder?: number
}

/**
 * Input for updating onboarding suggestions
 */
export interface OnboardingSuggestionInput {
  challengeId: string
  microlessonId?: string
  suggestedOrder: number
  reason: string
  isActive?: boolean
}

/**
 * Microlesson completion result
 */
export interface MicrolessonCompletionResult {
  success: boolean
  microlessonId: string
  rpAwarded: number
  bonusApplied: boolean
  message: string
}

/**
 * Bonus multiplier when microlesson completed before challenge
 */
export const MICROLESSON_BONUS_MULTIPLIER = 1.1 // 10% bonus

/**
 * Default RP reward for microlessons
 */
export const DEFAULT_MICROLESSON_RP = 15

/**
 * Default estimated time for microlessons (minutes)
 */
export const DEFAULT_MICROLESSON_MINUTES = 5

/**
 * Calculate challenge RP with microlesson bonus
 */
export function calculateChallengeRPWithBonus(
  baseRP: number,
  microlessonCompletedFirst: boolean
): number {
  if (microlessonCompletedFirst) {
    return Math.round(baseRP * MICROLESSON_BONUS_MULTIPLIER)
  }
  return baseRP
}
