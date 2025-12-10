// packages/validators/src/notifications.ts
// TogetherOS Notifications Module - Zod Validation Schemas

import { z } from 'zod'

/**
 * Notification type enum schema
 */
export const notificationTypeSchema = z.enum([
  'mention',
  'proposal_update',
  'discussion_reply',
  'group_update',
  'system_message',
  'support_points',
  'badge_earned',
  'reaction',
])

/**
 * Notification status enum schema
 */
export const notificationStatusSchema = z.enum([
  'unread',
  'read',
  'archived',
])

/**
 * Notification priority enum schema
 */
export const notificationPrioritySchema = z.enum([
  'normal',
  'high',
])

/**
 * Notification reference schema
 */
export const notificationReferenceSchema = z.object({
  type: z.enum(['post', 'proposal', 'discussion', 'group', 'user', 'badge']),
  id: z.string().uuid('Reference ID must be a valid UUID'),
  url: z.string().min(1).max(500).optional(),
})

/**
 * Create notification input schema
 */
export const createNotificationSchema = z.object({
  userId: z.string().uuid('User ID must be a valid UUID'),
  type: notificationTypeSchema,
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  icon: z.string().min(1).max(10).optional(),
  priority: notificationPrioritySchema.default('normal'),
  reference: notificationReferenceSchema.optional(),
  actorId: z.string().uuid('Actor ID must be a valid UUID').optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

/**
 * Type inference from schema
 */
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>

/**
 * Full notification schema
 */
export const notificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: notificationTypeSchema,
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  icon: z.string().min(1).max(10).optional(),
  priority: notificationPrioritySchema,
  status: notificationStatusSchema,
  reference: notificationReferenceSchema.optional(),
  actorId: z.string().uuid().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  createdAt: z.coerce.date(),
  readAt: z.coerce.date().optional(),
  archivedAt: z.coerce.date().optional(),
})

/**
 * Type inference from schema
 */
export type Notification = z.infer<typeof notificationSchema>

/**
 * Update notification status schema
 */
export const updateNotificationStatusSchema = z.object({
  notificationId: z.string().uuid('Notification ID must be a valid UUID'),
  userId: z.string().uuid('User ID must be a valid UUID'),
  status: notificationStatusSchema,
})

/**
 * Type inference from schema
 */
export type UpdateNotificationStatusInput = z.infer<typeof updateNotificationStatusSchema>

/**
 * Notification preferences schema
 */
export const notificationPreferencesSchema = z.object({
  userId: z.string().uuid(),
  enabledTypes: z.object({
    mention: z.boolean(),
    proposal_update: z.boolean(),
    discussion_reply: z.boolean(),
    group_update: z.boolean(),
    system_message: z.boolean(),
    support_points: z.boolean(),
    badge_earned: z.boolean(),
    reaction: z.boolean(),
  }),
  emailDigest: z.enum(['realtime', 'daily', 'weekly', 'disabled']),
  pushEnabled: z.boolean(),
  updatedAt: z.coerce.date(),
})

/**
 * Notification filters schema
 */
export const notificationFiltersSchema = z.object({
  status: z.union([
    notificationStatusSchema,
    z.array(notificationStatusSchema),
  ]).optional(),
  type: z.union([
    notificationTypeSchema,
    z.array(notificationTypeSchema),
  ]).optional(),
  priority: notificationPrioritySchema.optional(),
  unreadOnly: z.boolean().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
})

/**
 * Type inference from schema
 */
export type NotificationFilters = z.infer<typeof notificationFiltersSchema>

/**
 * Notification counts schema
 */
export const notificationCountsSchema = z.object({
  unread: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
})

