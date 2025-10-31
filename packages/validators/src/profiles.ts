// packages/validators/src/profiles.ts
// TogetherOS Profiles Module - Zod Validation Schemas

import { z } from 'zod'
import type { CooperationPathId, OnboardingStep } from '@togetheros/types/profiles'

/**
 * Cooperation path ID enum schema
 */
export const cooperationPathIdSchema = z.enum([
  'education',
  'economy',
  'wellbeing',
  'technology',
  'governance',
  'community',
  'media',
  'planet'
])

/**
 * Onboarding step enum schema
 */
export const onboardingStepSchema = z.enum([
  'welcome',
  'paths',
  'profile',
  'skills',
  'complete'
])

/**
 * Username validation regex
 * Format: lowercase/uppercase letters, numbers, underscores, hyphens
 * 3-50 characters
 */
const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/

/**
 * Profile update input schema
 * Validates user-provided profile updates
 */
export const profileUpdateSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),

  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username cannot exceed 50 characters')
    .regex(usernameRegex, 'Username must contain only letters, numbers, underscores, and hyphens')
    .optional(),

  bio: z.string()
    .max(500, 'Bio cannot exceed 500 characters')
    .optional(),

  avatarUrl: z.string()
    .url('Avatar URL must be a valid URL')
    .optional()
    .or(z.literal('')),

  city: z.string()
    .max(100, 'City cannot exceed 100 characters')
    .optional(),

  state: z.string()
    .max(100, 'State/Province cannot exceed 100 characters')
    .optional(),

  country: z.string()
    .max(100, 'Country cannot exceed 100 characters')
    .optional(),

  timezone: z.string()
    .max(50, 'Timezone cannot exceed 50 characters')
    .optional(),

  paths: z.array(cooperationPathIdSchema)
    .max(8, 'Cannot select more than 8 paths')
    .optional(),

  skills: z.array(z.string().min(1).max(50))
    .max(20, 'Cannot have more than 20 skills')
    .optional(),

  canOffer: z.string()
    .max(1000, 'Can offer text cannot exceed 1000 characters')
    .optional(),

  seekingHelp: z.string()
    .max(1000, 'Seeking help text cannot exceed 1000 characters')
    .optional()
})

/**
 * Skill tag validation schema
 * Individual skill must be 1-50 characters
 */
export const skillTagSchema = z.string()
  .min(1, 'Skill must not be empty')
  .max(50, 'Skill cannot exceed 50 characters')

/**
 * Skills array validation schema
 * Max 20 skills
 */
export const skillsArraySchema = z.array(skillTagSchema)
  .max(20, 'Cannot have more than 20 skills')

/**
 * Profile visibility settings schema
 */
export const profileVisibilitySchema = z.object({
  showInDirectory: z.boolean().default(true),
  showLocation: z.boolean().default(true),
  showSkills: z.boolean().default(true),
  showEmail: z.boolean().default(false)
})

/**
 * Onboarding step update schema
 */
export const onboardingStepUpdateSchema = z.object({
  step: onboardingStepSchema
})

/**
 * Email validation schema
 */
export const emailSchema = z.string()
  .email('Invalid email address')
  .max(255, 'Email cannot exceed 255 characters')

/**
 * Helper function to validate profile update input
 */
export function validateProfileUpdate(data: unknown) {
  return profileUpdateSchema.parse(data)
}

/**
 * Helper function to validate skills array
 */
export function validateSkills(skills: unknown) {
  return skillsArraySchema.parse(skills)
}

/**
 * Helper function to validate cooperation paths
 */
export function validatePaths(paths: unknown) {
  return z.array(cooperationPathIdSchema).parse(paths)
}

/**
 * Type exports
 */
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type ProfileVisibilitySettings = z.infer<typeof profileVisibilitySchema>
export type OnboardingStepUpdate = z.infer<typeof onboardingStepUpdateSchema>
