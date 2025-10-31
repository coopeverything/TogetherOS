// packages/validators/src/groups.ts
// TogetherOS Groups Module - Zod Validation Schemas

import { z } from 'zod'
import type { GroupType, GroupRoleType, MembershipStatus } from '@togetheros/types/groups'

/**
 * Group type enum schema
 */
export const groupTypeSchema = z.enum(['local', 'thematic', 'federated'])

/**
 * Group role type enum schema
 */
export const groupRoleTypeSchema = z.enum(['admin', 'coordinator', 'member'])

/**
 * Membership status enum schema
 */
export const membershipStatusSchema = z.enum(['active', 'inactive', 'pending', 'suspended'])

/**
 * Handle validation regex
 * Format: lowercase alphanumeric + hyphens, 3-50 chars
 */
const handleRegex = /^[a-z0-9-]+$/

/**
 * Create group input schema
 * Validates input for creating new groups
 */
export const createGroupSchema = z.object({
  name: z.string()
    .min(3, 'Group name must be at least 3 characters')
    .max(100, 'Group name cannot exceed 100 characters'),

  handle: z.string()
    .min(3, 'Handle must be at least 3 characters')
    .max(50, 'Handle cannot exceed 50 characters')
    .regex(handleRegex, 'Handle must be lowercase alphanumeric with hyphens only'),

  type: groupTypeSchema,

  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),

  location: z.string()
    .max(100, 'Location cannot exceed 100 characters')
    .optional(),

  creatorId: z.string().uuid('Creator ID must be a valid UUID'),
}).refine(
  (data) => data.type !== 'local' || !!data.location,
  {
    message: 'Location is required for local groups',
    path: ['location'],
  }
)

/**
 * Type inference from schema
 */
export type CreateGroupInput = z.infer<typeof createGroupSchema>

/**
 * Update group input schema
 */
export const updateGroupSchema = z.object({
  name: z.string()
    .min(3)
    .max(100)
    .optional(),

  description: z.string()
    .min(10)
    .max(500)
    .optional(),

  location: z.string()
    .max(100)
    .optional(),
})

/**
 * Type inference from schema
 */
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>

/**
 * Full group schema (including generated fields)
 */
export const groupSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(100),
  handle: z.string().min(3).max(50).regex(handleRegex),
  type: groupTypeSchema,
  description: z.string().min(10).max(500).optional(),
  location: z.string().max(100).optional(),
  members: z.array(z.string().uuid()),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

/**
 * Type inference from schema
 */
export type Group = z.infer<typeof groupSchema>

/**
 * Join group input schema
 */
export const joinGroupSchema = z.object({
  groupId: z.string().uuid('Group ID must be a valid UUID'),
  memberId: z.string().uuid('Member ID must be a valid UUID'),
  message: z.string()
    .min(10, 'Introduction message must be at least 10 characters')
    .max(500, 'Introduction message cannot exceed 500 characters')
    .optional(),
})

/**
 * Type inference from schema
 */
export type JoinGroupInput = z.infer<typeof joinGroupSchema>

/**
 * Group role schema
 */
export const groupRoleSchema = z.object({
  id: z.string().uuid(),
  groupId: z.string().uuid(),
  memberId: z.string().uuid(),
  role: groupRoleTypeSchema,
  grantedAt: z.coerce.date(),
  expiresAt: z.coerce.date().optional(),
  grantedBy: z.string().uuid(),
  recallable: z.boolean(),
}).refine(
  (data) => !data.expiresAt || data.expiresAt > data.grantedAt,
  {
    message: 'Expiration date must be after granted date',
    path: ['expiresAt'],
  }
)

/**
 * Type inference from schema
 */
export type GroupRole = z.infer<typeof groupRoleSchema>

/**
 * Group membership schema
 */
export const groupMembershipSchema = z.object({
  id: z.string().uuid(),
  groupId: z.string().uuid(),
  memberId: z.string().uuid(),
  status: membershipStatusSchema,
  joinedAt: z.coerce.date(),
  lastActiveAt: z.coerce.date().optional(),
  introMessage: z.string().max(500).optional(),
})

/**
 * Type inference from schema
 */
export type GroupMembership = z.infer<typeof groupMembershipSchema>

/**
 * Group filters schema
 */
export const groupFiltersSchema = z.object({
  type: groupTypeSchema.optional(),
  location: z.string().optional(),
  memberCount: z.object({
    min: z.number().int().nonnegative().optional(),
    max: z.number().int().positive().optional(),
  }).optional(),
  search: z.string().max(200).optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
  sortBy: z.enum(['newest', 'oldest', 'most_members', 'alphabetical']).default('newest'),
})

/**
 * Type inference from schema
 */
export type GroupFilters = z.infer<typeof groupFiltersSchema>

/**
 * Group stats schema
 */
export const groupStatsSchema = z.object({
  groupId: z.string().uuid(),
  memberCount: z.number().int().nonnegative(),
  activeMemberCount: z.number().int().nonnegative(),
  proposalCount: z.number().int().nonnegative(),
  eventCount: z.number().int().nonnegative(),
  activityScore: z.number().min(0).max(100),
  calculatedAt: z.coerce.date(),
})

/**
 * Type inference from schema
 */
export type GroupStats = z.infer<typeof groupStatsSchema>

/**
 * Validation helper: Check if handle is valid format
 */
export function isValidHandle(handle: string): boolean {
  return handleRegex.test(handle) && handle.length >= 3 && handle.length <= 50
}

/**
 * Validation helper: Normalize handle (lowercase, trim)
 */
export function normalizeHandle(handle: string): string {
  return handle.toLowerCase().trim()
}

/**
 * Validation helper: Check if group type is valid
 */
export function isValidGroupType(type: string): type is GroupType {
  return groupTypeSchema.safeParse(type).success
}

/**
 * Validation helper: Generate federation handle
 * Format: @handle@domain.tld
 */
export function generateFederationHandle(handle: string, domain: string): string {
  const normalized = normalizeHandle(handle)
  return `@${normalized}@${domain}`
}

/**
 * Validation helper: Parse federation handle
 * Returns { handle, domain } or null if invalid
 */
export function parseFederationHandle(
  federatedHandle: string
): { handle: string; domain: string } | null {
  const match = federatedHandle.match(/^@([a-z0-9-]+)@([a-z0-9.-]+)$/)
  if (!match) return null

  const [, handle, domain] = match
  return { handle, domain }
}

/**
 * Validation helper: Check if member can join group
 * Business rules:
 * - Member cannot be already in group
 * - Member cannot be suspended
 * - Max 20 groups per member
 */
export function canJoinGroup(
  memberId: string,
  group: Group,
  memberGroupCount: number
): { allowed: boolean; reason?: string } {
  // Check if already a member
  if (group.members.includes(memberId)) {
    return { allowed: false, reason: 'Already a member of this group' }
  }

  // Check max groups limit
  if (memberGroupCount >= 20) {
    return { allowed: false, reason: 'Maximum 20 groups per member' }
  }

  return { allowed: true }
}

/**
 * Validation helper: Calculate activity score
 * Based on member activity, proposals, events
 */
export function calculateActivityScore(
  memberCount: number,
  activeMemberCount: number,
  proposalCount: number,
  eventCount: number
): number {
  // Activity ratio (0-40 points)
  const activityRatio = memberCount > 0 ? (activeMemberCount / memberCount) : 0
  const activityPoints = Math.min(40, activityRatio * 40)

  // Proposal activity (0-30 points)
  const proposalPoints = Math.min(30, proposalCount * 2)

  // Event activity (0-30 points)
  const eventPoints = Math.min(30, eventCount * 3)

  return Math.round(activityPoints + proposalPoints + eventPoints)
}
