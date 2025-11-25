/**
 * Daily Challenges type definitions
 * Based on gamification Phase 3 spec
 */

/**
 * Challenge categories
 */
export type ChallengeCategory = 'social' | 'contribution' | 'exploration' | 'growth'

/**
 * Challenge difficulty levels
 */
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard'

/**
 * Challenge completion status
 */
export type ChallengeStatus = 'pending' | 'completed' | 'expired'

/**
 * Action types that can trigger challenge completion
 */
export type ChallengeActionType =
  | 'post_message'
  | 'post_comment'
  | 'view_paths'
  | 'add_skills'
  | 'send_invitation'
  | 'proposal_interact'
  | 'complete_journey'
  | 'welcome_member'
  | 'start_thread'
  | 'offer_help'
  | 'share_resource'
  | 'rate_proposal'
  | 'update_profile'
  | 'visit_group'
  | 'join_group'

/**
 * Challenge action target (what needs to be done)
 */
export interface ChallengeActionTarget {
  count?: number
  groupType?: string
  targetId?: string
}

/**
 * Challenge definition (admin-configurable template)
 */
export interface ChallengeDefinition {
  id: string
  name: string
  description: string
  category: ChallengeCategory
  difficulty: ChallengeDifficulty
  rpReward: number
  actionType: ChallengeActionType
  actionTarget: ChallengeActionTarget
  isActive: boolean
  isFirstWeek: boolean
  dayNumber?: number
  icon?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * User's assigned challenge instance
 */
export interface UserChallenge {
  id: string
  userId: string
  challengeId: string
  challenge?: ChallengeDefinition
  assignedDate: Date
  status: ChallengeStatus
  completedAt?: Date
  progress: ChallengeProgress
  rpAwarded?: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Challenge progress tracking
 */
export interface ChallengeProgress {
  current?: number
  target?: number
  actions?: string[]
}

/**
 * First-week journey progress
 */
export interface FirstWeekProgress {
  id: string
  userId: string
  startDate: Date
  currentDay: number
  completedDays: number[]
  totalRPEarned: number
  streakBonusRP: number
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

/**
 * Daily challenge card display data
 */
export interface DailyChallengeCard {
  challenge: ChallengeDefinition
  userChallenge?: UserChallenge
  isLocked?: boolean
  unlockDay?: number
}

/**
 * First-week journey day data
 */
export interface FirstWeekDay {
  dayNumber: number
  challenge: ChallengeDefinition
  status: 'locked' | 'available' | 'completed'
  completedAt?: Date
  rpEarned?: number
}

/**
 * First-week journey summary
 */
export interface FirstWeekSummary {
  days: FirstWeekDay[]
  currentDay: number
  totalRPEarned: number
  streakBonusRP: number
  isComplete: boolean
  completionDate?: Date
}

/**
 * Challenge completion result
 */
export interface ChallengeCompletionResult {
  success: boolean
  challengeId: string
  rpAwarded: number
  streakBonus?: number
  message: string
  nextChallenge?: ChallengeDefinition
}

/**
 * Input for completing a challenge
 */
export interface CompleteChallengeInput {
  userId: string
  challengeId: string
  actionData?: Record<string, unknown>
}

/**
 * Input for assigning daily challenges
 */
export interface AssignDailyChallengesInput {
  userId: string
  count?: number
  categories?: ChallengeCategory[]
}

/**
 * Challenge streak data
 */
export interface ChallengeStreak {
  currentStreak: number
  longestStreak: number
  lastCompletedDate?: Date
  streakBonusMultiplier: number
}

/**
 * Streak bonus multipliers
 */
export const STREAK_BONUSES: Record<number, number> = {
  3: 1.1,   // 3-day streak: +10% RP
  7: 1.25,  // 7-day streak: +25% RP
  14: 1.5,  // 14-day streak: +50% RP
  30: 2.0,  // 30-day streak: +100% RP
}

/**
 * Get streak bonus multiplier for a given streak length
 */
export function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return STREAK_BONUSES[30]
  if (streakDays >= 14) return STREAK_BONUSES[14]
  if (streakDays >= 7) return STREAK_BONUSES[7]
  if (streakDays >= 3) return STREAK_BONUSES[3]
  return 1
}

/**
 * Calculate RP with streak bonus
 */
export function calculateRPWithStreak(baseRP: number, streakDays: number): number {
  const multiplier = getStreakMultiplier(streakDays)
  return Math.round(baseRP * multiplier)
}

/**
 * Default daily challenge count
 */
export const DEFAULT_DAILY_CHALLENGE_COUNT = 3

/**
 * First-week journey constants
 */
export const FIRST_WEEK_DAYS = 7
export const FIRST_WEEK_COMPLETION_BONUS = 100 // Bonus RP for completing all 7 days
