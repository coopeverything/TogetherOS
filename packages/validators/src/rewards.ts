// packages/validators/src/rewards.ts
// TogetherOS Rewards Module - Zod Validation Schemas

import { z } from 'zod'
import type { RewardEventType, SP_WEIGHTS } from '@togetheros/types/rewards'

/**
 * Reward event type enum schema
 */
export const rewardEventTypeSchema = z.enum([
  'pr_merged_small',
  'pr_merged_medium',
  'pr_merged_large',
  'docs_contribution',
  'code_review',
  'issue_triage',
  'bug_fix',
  'group_created',
  'group_joined',
  'city_group_joined',
])

/**
 * Event context schema
 * Flexible object for domain-specific metadata
 */
export const eventContextSchema = z.object({
  pr_number: z.number().int().positive().optional(),
  issue_number: z.number().int().positive().optional(),
  repo: z.string().min(1).max(200).optional(),
  lines_changed: z.number().int().nonnegative().optional(),
}).catchall(z.union([z.string(), z.number(), z.boolean()]))

/**
 * Create reward event input schema
 * Validates input for creating new reward events
 */
export const createRewardEventSchema = z.object({
  memberId: z.string().uuid('Member ID must be a valid UUID'),
  event_type: rewardEventTypeSchema,
  context: eventContextSchema,
  source: z.string().min(1).max(50),
  timestamp: z.coerce.date().optional(),
})

/**
 * Type inference from schema
 */
export type CreateRewardEventInput = z.infer<typeof createRewardEventSchema>

/**
 * Full reward event schema (including generated fields)
 */
export const rewardEventSchema = z.object({
  id: z.string().uuid(),
  memberId: z.string().uuid(),
  event_type: rewardEventTypeSchema,
  sp_weight: z.number().int().positive(),
  context: eventContextSchema,
  source: z.string().min(1).max(50),
  dedup_key: z.string().min(1),
  timestamp: z.coerce.date(),
  status: z.enum(['pending', 'processed', 'failed']),
  processedAt: z.coerce.date().optional(),
})

/**
 * Type inference from schema
 */
export type RewardEvent = z.infer<typeof rewardEventSchema>

/**
 * Member reward balance schema
 */
export const memberRewardBalanceSchema = z.object({
  memberId: z.string().uuid(),
  total: z.number().int().nonnegative(),
  available: z.number().int().nonnegative(),
  allocated: z.number().int().nonnegative(),
  updatedAt: z.coerce.date(),
}).refine(
  (data) => data.total === data.available + data.allocated,
  {
    message: 'Total SP must equal available + allocated',
    path: ['total'],
  }
)

/**
 * Badge schema
 */
export const badgeSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(50),
  description: z.string().min(10).max(500),
  icon: z.string().min(1).max(200),
  criteria: z.string().min(10).max(500),
  category: z.enum(['contribution', 'milestone', 'special']),
})

/**
 * Member badge schema
 */
export const memberBadgeSchema = z.object({
  memberId: z.string().uuid(),
  badgeId: z.string().uuid(),
  earnedAt: z.coerce.date(),
  eventId: z.string().uuid().optional(),
})

/**
 * Validation helper: Check if event type is valid
 */
export function isValidEventType(type: string): type is RewardEventType {
  return rewardEventTypeSchema.safeParse(type).success
}

/**
 * Validation helper: Get SP weight for event type
 */
export function getSPWeight(eventType: RewardEventType): number {
  const weights: Record<RewardEventType, number> = {
    pr_merged_small: 5,
    pr_merged_medium: 10,
    pr_merged_large: 20,
    docs_contribution: 8,
    code_review: 3,
    issue_triage: 2,
    bug_fix: 15,
    group_created: 15,
    group_joined: 3,
    city_group_joined: 0,
  }
  return weights[eventType]
}

/**
 * Validation helper: Calculate PR size category
 */
export function calculatePRSize(linesChanged: number): 'small' | 'medium' | 'large' {
  if (linesChanged < 50) return 'small'
  if (linesChanged < 200) return 'medium'
  return 'large'
}

/**
 * Validation helper: Generate deduplication key
 */
export function generateDedupKey(source: string, context: Record<string, any>): string {
  // Create stable key from source + relevant context fields
  const keyParts = [source]
  
  if (context.pr_number) keyParts.push(`pr:${context.pr_number}`)
  if (context.issue_number) keyParts.push(`issue:${context.issue_number}`)
  if (context.repo) keyParts.push(`repo:${context.repo}`)
  
  return keyParts.join('::')
}
