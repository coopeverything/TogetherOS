// apps/api/src/modules/notifications/handlers/notifications.ts
// API handlers for notifications

import type {
  Notification as NotificationType,
  CreateNotificationInput,
  NotificationFilters,
  NotificationCounts,
  NotificationStatus,
} from '@togetheros/types'
import { InMemoryNotificationRepo } from '../repos/InMemoryNotificationRepo'
import { sampleNotifications } from '../fixtures'

// Singleton repo for in-memory storage (session-scoped)
let notificationRepo: InMemoryNotificationRepo | null = null

/**
 * Get or initialize notification repo
 */
function getNotificationRepo(): InMemoryNotificationRepo {
  if (!notificationRepo) {
    // Initialize with sample fixtures
    notificationRepo = new InMemoryNotificationRepo(sampleNotifications)
  }
  return notificationRepo
}

/**
 * GET /api/notifications
 * List notifications for a user with optional filters
 * Query params: status, type, priority, unreadOnly, offset, limit
 */
export async function listNotifications(
  userId: string,
  filters: NotificationFilters = {}
): Promise<{
  notifications: NotificationType[]
  total: number
  hasMore: boolean
}> {
  const repo = getNotificationRepo()

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
  const repo = getNotificationRepo()
  return repo.findById(id)
}

/**
 * GET /api/notifications/counts
 * Get notification counts for a user
 */
export async function getNotificationCounts(userId: string): Promise<NotificationCounts> {
  const repo = getNotificationRepo()
  return repo.getCounts(userId)
}

/**
 * PATCH /api/notifications/:id/status
 * Update notification status (read, unread, archived)
 * Body: { status: NotificationStatus }
 */
export async function updateNotificationStatus(
  notificationId: string,
  userId: string,
  status: NotificationStatus
): Promise<NotificationType | null> {
  const repo = getNotificationRepo()
  return repo.updateStatus(notificationId, userId, status)
}

/**
 * POST /api/notifications/mark-all-read
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<{ count: number }> {
  const repo = getNotificationRepo()
  const count = await repo.markAllAsRead(userId)
  return { count }
}

/**
 * POST /api/notifications
 * Create a new notification
 * Body: CreateNotificationInput
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<NotificationType> {
  const repo = getNotificationRepo()
  return repo.create(input)
}

/**
 * POST /api/notifications/bulk
 * Create multiple notifications (for broadcasts)
 * Body: { notifications: CreateNotificationInput[] }
 */
export async function bulkCreateNotifications(
  inputs: CreateNotificationInput[]
): Promise<{ notifications: NotificationType[]; count: number }> {
  const repo = getNotificationRepo()
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
  const repo = getNotificationRepo()
  await repo.delete(notificationId, userId)
  return { success: true }
}

/**
 * DELETE /api/notifications/archived
 * Delete all archived notifications for a user
 */
export async function deleteAllArchived(userId: string): Promise<{ count: number }> {
  const repo = getNotificationRepo()
  const count = await repo.deleteAllArchived(userId)
  return { count }
}
