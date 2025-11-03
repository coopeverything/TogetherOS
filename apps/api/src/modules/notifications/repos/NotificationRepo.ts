// apps/api/src/modules/notifications/repos/NotificationRepo.ts
// Repository interface for Notification entity

import type {
  Notification as NotificationType,
  CreateNotificationInput,
  NotificationFilters,
  NotificationCounts,
  NotificationStatus,
} from '@togetheros/types'

/**
 * Notification repository interface
 * Defines contract for data access
 */
export interface NotificationRepo {
  /**
   * Create a new notification
   */
  create(input: CreateNotificationInput): Promise<NotificationType>

  /**
   * Find notification by ID
   */
  findById(id: string): Promise<NotificationType | null>

  /**
   * List notifications for a user with filters
   */
  listForUser(userId: string, filters?: NotificationFilters): Promise<NotificationType[]>

  /**
   * Count notifications for a user
   */
  countForUser(userId: string, filters?: NotificationFilters): Promise<number>

  /**
   * Get notification counts (unread, total) for a user
   */
  getCounts(userId: string): Promise<NotificationCounts>

  /**
   * Update notification status
   */
  updateStatus(notificationId: string, userId: string, status: NotificationStatus): Promise<NotificationType | null>

  /**
   * Mark all notifications as read for a user
   */
  markAllAsRead(userId: string): Promise<number>

  /**
   * Delete notification
   */
  delete(id: string, userId: string): Promise<void>

  /**
   * Delete all archived notifications for a user
   */
  deleteAllArchived(userId: string): Promise<number>

  /**
   * Bulk create notifications (for broadcasts)
   */
  bulkCreate(inputs: CreateNotificationInput[]): Promise<NotificationType[]>
}
