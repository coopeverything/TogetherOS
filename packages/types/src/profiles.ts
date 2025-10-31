// packages/types/src/profiles.ts
// TogetherOS Profiles Module - Core Entity Definitions

/**
 * Cooperation path IDs
 * Maps to the 8 canonical Cooperation Paths
 */
export type CooperationPathId =
  | 'education'
  | 'economy'
  | 'wellbeing'
  | 'technology'
  | 'governance'
  | 'community'
  | 'media'
  | 'planet'

/**
 * Onboarding step states
 */
export type OnboardingStep =
  | 'welcome'
  | 'paths'
  | 'profile'
  | 'skills'
  | 'complete'

/**
 * Core profile entity
 * Represents a user's public profile and preferences
 */
export interface Profile {
  /** Unique identifier (matches user ID) */
  id: string

  /** User's email address */
  email: string

  /** Whether email has been verified */
  emailVerified: boolean

  /** Display name (optional, 2-100 chars) */
  name?: string

  /** Unique username handle (3-50 chars, optional) */
  username?: string

  /** Bio/about text (optional, max 500 chars) */
  bio?: string

  /** Avatar URL (optional) */
  avatarUrl?: string

  /** City name (optional) */
  city?: string

  /** State/province (optional) */
  state?: string

  /** Country (optional) */
  country?: string

  /** Timezone (optional, IANA format) */
  timezone?: string

  /** Selected cooperation paths */
  paths: CooperationPathId[]

  /** User's skills (array of tags) */
  skills: string[]

  /** What the user can offer to the community */
  canOffer?: string

  /** What the user is seeking help with */
  seekingHelp?: string

  /** Current onboarding step */
  onboardingStep: OnboardingStep

  /** When onboarding was completed */
  onboardingCompletedAt?: Date

  /** When profile was created */
  createdAt: Date

  /** Last modification timestamp */
  updatedAt: Date
}

/**
 * Profile update input
 * Fields that can be updated by the user
 */
export interface ProfileUpdateInput {
  name?: string
  username?: string
  bio?: string
  avatarUrl?: string
  city?: string
  state?: string
  country?: string
  timezone?: string
  paths?: CooperationPathId[]
  skills?: string[]
  canOffer?: string
  seekingHelp?: string
}

/**
 * Profile completion metrics
 */
export interface ProfileCompletionStatus {
  /** Overall completion percentage (0-100) */
  percentage: number

  /** Completed field names */
  completedFields: string[]

  /** Missing field names */
  missingFields: string[]

  /** Whether profile is considered "complete" (>=70%) */
  isComplete: boolean
}

/**
 * Cooperation path metadata
 */
export interface CooperationPath {
  id: CooperationPathId
  name: string
  emoji: string
  description: string
}

/**
 * Profile display settings
 */
export interface ProfileVisibility {
  /** Show profile in public directory */
  showInDirectory: boolean

  /** Show location publicly */
  showLocation: boolean

  /** Show skills publicly */
  showSkills: boolean

  /** Show email to other members */
  showEmail: boolean
}
