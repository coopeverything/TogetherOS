// apps/api/src/modules/notifications/repos/InMemoryNotificationRepo.ts
// In-memory implementation of NotificationRepo for testing and fixtures

import type {
  NotificationRepo,
  } from './NotificationRepo'
import type {
  Notification as NotificationType,
  CreateNotificationInput,
  NotificationFilters,
  NotificationCounts,
  NotificationStatus,
} from '@togetheros/types'
import { Notification } from '../entities/Notification'

/**
 * In-memory notification repository
 * Stores notifications in memory (non-persistent)
 */
export class InMemoryNotificationRepo implements NotificationRepo {
  private notifications: Map<string, Notification>

  constructor(initialNotifications: NotificationType[] = []) {
    this.notifications = new Map()

    // Load initial data
    initialNotifications.forEach((data) => {
      const notification = Notification.fromPersistence(data)
      this.notifications.set(notification.id, notification)
    })
  }

  async create(input: CreateNotificationInput): Promise<NotificationType> {
    const notification = Notification.create(input)
    this.notifications.set(notification.id, notification)
    return notification.toJSON()
  }

  async findById(id: string): Promise<NotificationType | null> {
    const notification = this.notifications.get(id)
    return notification ? notification.toJSON() : null
  }

  async listForUser(userId: string, filters: NotificationFilters = {}): Promise<NotificationType[]> {
    let notifications = Array.from(this.notifications.values()).filter((n) => n.userId === userId)

    // Apply status filter
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
      notifications = notifications.filter((n) => statuses.includes(n.status))
    }

    // Apply type filter
    if (filters.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type]
      notifications = notifications.filter((n) => types.includes(n.type))
    }

    // Apply priority filter
    if (filters.priority) {
      notifications = notifications.filter((n) => n.priority === filters.priority)
    }

    // Apply unread only filter
    if (filters.unreadOnly) {
      notifications = notifications.filter((n) => n.isUnread())
    }

    // Sort by newest first
    notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    // Apply pagination
    const offset = filters.offset ?? 0
    const limit = filters.limit ?? 20

    return notifications.slice(offset, offset + limit).map((n) => n.toJSON())
  }

  async countForUser(userId: string, filters: NotificationFilters = {}): Promise<number> {
    const allNotifications = await this.listForUser(userId, { ...filters, limit: 999999, offset: 0 })
    return allNotifications.length
  }

  async getCounts(userId: string): Promise<NotificationCounts> {
    const all = Array.from(this.notifications.values()).filter((n) => n.userId === userId)
    const unread = all.filter((n) => n.isUnread())

    return {
      unread: unread.length,
      total: all.length,
    }
  }

  async updateStatus(
    notificationId: string,
    userId: string,
    status: NotificationStatus
  ): Promise<NotificationType | null> {
    const notification = this.notifications.get(notificationId)

    if (!notification || notification.userId !== userId) {
      return null
    }

    let updated: Notification
    switch (status) {
      case 'read':
        updated = notification.markAsRead()
        break
      case 'unread':
        updated = notification.markAsUnread()
        break
      case 'archived':
        updated = notification.archive()
        break
      default:
        return null
    }

    this.notifications.set(updated.id, updated)
    return updated.toJSON()
  }

  async markAllAsRead(userId: string): Promise<number> {
    const userNotifications = Array.from(this.notifications.values()).filter(
      (n) => n.userId === userId && n.isUnread()
    )

    userNotifications.forEach((notification) => {
      const updated = notification.markAsRead()
      this.notifications.set(updated.id, updated)
    })

    return userNotifications.length
  }

  async delete(id: string, userId: string): Promise<void> {
    const notification = this.notifications.get(id)

    if (notification && notification.userId === userId) {
      this.notifications.delete(id)
    }
  }

  async deleteAllArchived(userId: string): Promise<number> {
    const archived = Array.from(this.notifications.values()).filter(
      (n) => n.userId === userId && n.status === 'archived'
    )

    archived.forEach((n) => this.notifications.delete(n.id))

    return archived.length
  }

  async bulkCreate(inputs: CreateNotificationInput[]): Promise<NotificationType[]> {
    const created: NotificationType[] = []

    for (const input of inputs) {
      const notification = await this.create(input)
      created.push(notification)
    }

    return created
  }
}
