// apps/api/src/modules/notifications/handlers/notifications.ts
// API handlers for notifications - Database-backed with in-memory fallback

import type {
  Notification as NotificationType,
  CreateNotificationInput,
  NotificationFilters,
  NotificationCounts,
  NotificationStatus,
  NotificationPreferences,
} from '@togetheros/types'
import * as db from '@togetheros/db'

// Fallback to in-memory for testing/development without database
import { InMemoryNotificationRepo } from '../repos/InMemoryNotificationRepo'
import { sampleNotifications } from '../fixtures'

let inMemoryRepo: InMemoryNotificationRepo | null = null
const useDatabase = process.env.DATABASE_URL !== undefined

function getInMemoryRepo(): InMemoryNotificationRepo {
  if (!inMemoryRepo) {
    inMemoryRepo = new InMemoryNotificationRepo(sampleNotifications)
  }
  return inMemoryRepo
}

/**
 * GET /api/notifications
 * List notifications for a user with optional filters
 */
export async function listNotifications(
  userId: string,
  filters: NotificationFilters = {}
): Promise<{
  notifications: NotificationType[]
  total: number
  hasMore: boolean
}> {
  if (useDatabase) {
    const notifications = await db.listNotificationsForUser(userId, filters)
    const total = await db.countNotificationsForUser(userId, filters)
    const limit = filters.limit ?? 20
    const offset = filters.offset ?? 0
    const hasMore = offset + notifications.length < total

    return { notifications, total, hasMore }
  }

  // Fallback to in-memory
  const repo = getInMemoryRepo()
  const notifications = await repo.listForUser(userId, filters)
  const total = await repo.countForUser(userId, filters)
  const limit = filters.limit ?? 20
  const offset = filters.offset ?? 0
  const hasMore = offset + notifications.length < total

  return { notifications, total, hasMore }
}

/**
 * GET /api/notifications/:id
 * Get single notification by ID
 */
export async function getNotification(id: string): Promise<NotificationType | null> {
  if (useDatabase) {
    return db.findNotificationById(id)
  }

  const repo = getInMemoryRepo()
  return repo.findById(id)
}

/**
 * GET /api/notifications/counts
 * Get notification counts for a user
 */
export async function getNotificationCounts(userId: string): Promise<NotificationCounts> {
  if (useDatabase) {
    return db.getNotificationCounts(userId)
  }

  const repo = getInMemoryRepo()
  return repo.getCounts(userId)
}

/**
 * PATCH /api/notifications/:id/status
 * Update notification status (read, unread, archived)
 */
export async function updateNotificationStatus(
  notificationId: string,
  userId: string,
  status: NotificationStatus
): Promise<NotificationType | null> {
  if (useDatabase) {
    return db.updateNotificationStatus(notificationId, userId, status)
  }

  const repo = getInMemoryRepo()
  return repo.updateStatus(notificationId, userId, status)
}

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<{ count: number }> {
  if (useDatabase) {
    const count = await db.markAllNotificationsAsRead(userId)
    return { count }
  }

  const repo = getInMemoryRepo()
  const count = await repo.markAllAsRead(userId)
  return { count }
}

/**
 * POST /api/notifications/actions/mark-as-read
 * Mark a single notification as read
 */
export async function markAsRead(
  notificationId: string,
  userId: string
): Promise<NotificationType | null> {
  return updateNotificationStatus(notificationId, userId, 'read')
}

/**
 * POST /api/notifications/actions/mark-as-unread
 * Mark a single notification as unread
 */
export async function markAsUnread(
  notificationId: string,
  userId: string
): Promise<NotificationType | null> {
  return updateNotificationStatus(notificationId, userId, 'unread')
}

/**
 * POST /api/notifications
 * Create a new notification
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<NotificationType> {
  if (useDatabase) {
    return db.createNotification(input)
  }

  const repo = getInMemoryRepo()
  return repo.create(input)
}

/**
 * POST /api/notifications/bulk
 * Create multiple notifications (for broadcasts)
 */
export async function bulkCreateNotifications(
  inputs: CreateNotificationInput[]
): Promise<{ notifications: NotificationType[]; count: number }> {
  if (useDatabase) {
    const notifications = await db.bulkCreateNotifications(inputs)
    return { notifications, count: notifications.length }
  }

  const repo = getInMemoryRepo()
  const notifications = await repo.bulkCreate(inputs)
  return { notifications, count: notifications.length }
}

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<{ success: boolean }> {
  if (useDatabase) {
    const success = await db.deleteNotification(notificationId, userId)
    return { success }
  }

  const repo = getInMemoryRepo()
  await repo.delete(notificationId, userId)
  return { success: true }
}

/**
 * DELETE /api/notifications/archived
 * Delete all archived notifications for a user
 */
export async function deleteAllArchived(userId: string): Promise<{ count: number }> {
  if (useDatabase) {
    const count = await db.deleteAllArchivedNotifications(userId)
    return { count }
  }

  const repo = getInMemoryRepo()
  const count = await repo.deleteAllArchived(userId)
  return { count }
}

// ============================================
// PREFERENCES HANDLERS
// ============================================

/**
 * GET /api/notifications/preferences
 * Get notification preferences for a user
 */
export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  if (useDatabase) {
    return db.getNotificationPreferences(userId)
  }

  // Return defaults for in-memory mode
  return {
    userId,
    enabledTypes: {
      mention: true,
      proposal_update: true,
      discussion_reply: true,
      group_update: true,
      system_message: true,
      support_points: true,
      badge_earned: true,
      reaction: true,
    },
    emailDigest: 'daily',
    pushEnabled: false,
    updatedAt: new Date(),
  }
}

/**
 * PUT /api/notifications/preferences
 * Update notification preferences for a user
 */
export async function updatePreferences(
  userId: string,
  preferences: Partial<Omit<NotificationPreferences, 'userId' | 'updatedAt'>>
): Promise<NotificationPreferences> {
  if (useDatabase) {
    return db.updateNotificationPreferences(userId, preferences)
  }

  // Return merged defaults for in-memory mode
  const current = await getNotificationPreferences(userId)
  return {
    ...current,
    ...preferences,
    enabledTypes: {
      ...current.enabledTypes,
      ...preferences.enabledTypes,
    },
    updatedAt: new Date(),
  }
}
