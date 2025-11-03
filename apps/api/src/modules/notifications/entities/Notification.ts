// apps/api/src/modules/notifications/entities/Notification.ts
// Domain entity for Notification - Pure business logic

import type {
  Notification as NotificationType,
  NotificationType as NotificationTypeEnum,
  NotificationStatus,
  NotificationPriority,
  NotificationReference,
  CreateNotificationInput,
} from '@togetheros/types'
import { NOTIFICATION_ICONS } from '@togetheros/types'
import { notificationSchema, createNotificationSchema } from '@togetheros/validators'
import { v4 as uuidv4 } from 'uuid'

/**
 * Notification entity
 * Represents a user notification with business logic
 */
export class Notification {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly type: NotificationTypeEnum,
    public readonly title: string,
    public readonly body: string,
    public readonly icon: string,
    public readonly priority: NotificationPriority,
    public readonly status: NotificationStatus,
    public readonly reference: NotificationReference | undefined,
    public readonly actorId: string | undefined,
    public readonly metadata: Record<string, any> | undefined,
    public readonly createdAt: Date,
    public readonly readAt: Date | undefined,
    public readonly archivedAt: Date | undefined
  ) {}

  /**
   * Factory: Create new notification
   */
  static create(input: CreateNotificationInput): Notification {
    const now = new Date()

    // Validate input
    const validated = createNotificationSchema.parse(input)

    // Use default icon if not provided
    const icon = validated.icon || NOTIFICATION_ICONS[validated.type]

    const notificationData = {
      id: uuidv4(),
      userId: validated.userId,
      type: validated.type,
      title: validated.title,
      body: validated.body,
      icon,
      priority: validated.priority || 'normal',
      status: 'unread' as NotificationStatus,
      reference: validated.reference,
      actorId: validated.actorId,
      metadata: validated.metadata,
      createdAt: now,
      readAt: undefined,
      archivedAt: undefined,
    }

    // Validate complete notification
    const fullValidated = notificationSchema.parse(notificationData)

    return new Notification(
      fullValidated.id,
      fullValidated.userId,
      fullValidated.type,
      fullValidated.title,
      fullValidated.body,
      fullValidated.icon,
      fullValidated.priority,
      fullValidated.status,
      fullValidated.reference,
      fullValidated.actorId,
      fullValidated.metadata,
      fullValidated.createdAt,
      fullValidated.readAt,
      fullValidated.archivedAt
    )
  }

  /**
   * Factory: Reconstitute from database
   */
  static fromPersistence(data: NotificationType): Notification {
    const validated = notificationSchema.parse(data)

    return new Notification(
      validated.id,
      validated.userId,
      validated.type,
      validated.title,
      validated.body,
      validated.icon,
      validated.priority,
      validated.status,
      validated.reference,
      validated.actorId,
      validated.metadata,
      validated.createdAt,
      validated.readAt,
      validated.archivedAt
    )
  }

  /**
   * Mark notification as read
   */
  markAsRead(): Notification {
    if (this.status === 'read') {
      return this // Already read
    }

    return new Notification(
      this.id,
      this.userId,
      this.type,
      this.title,
      this.body,
      this.icon,
      this.priority,
      'read',
      this.reference,
      this.actorId,
      this.metadata,
      this.createdAt,
      new Date(),
      this.archivedAt
    )
  }

  /**
   * Mark notification as unread
   */
  markAsUnread(): Notification {
    if (this.status === 'unread') {
      return this // Already unread
    }

    return new Notification(
      this.id,
      this.userId,
      this.type,
      this.title,
      this.body,
      this.icon,
      this.priority,
      'unread',
      this.reference,
      this.actorId,
      this.metadata,
      this.createdAt,
      undefined,
      undefined // Unarchive if needed
    )
  }

  /**
   * Archive notification
   */
  archive(): Notification {
    if (this.status === 'archived') {
      return this // Already archived
    }

    return new Notification(
      this.id,
      this.userId,
      this.type,
      this.title,
      this.body,
      this.icon,
      this.priority,
      'archived',
      this.reference,
      this.actorId,
      this.metadata,
      this.createdAt,
      this.readAt,
      new Date()
    )
  }

  /**
   * Convert to plain object for API response
   */
  toJSON(): NotificationType {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      title: this.title,
      body: this.body,
      icon: this.icon,
      priority: this.priority,
      status: this.status,
      reference: this.reference,
      actorId: this.actorId,
      metadata: this.metadata,
      createdAt: this.createdAt,
      readAt: this.readAt,
      archivedAt: this.archivedAt,
    }
  }

  /**
   * Check if notification is unread
   */
  isUnread(): boolean {
    return this.status === 'unread'
  }

  /**
   * Check if notification is high priority
   */
  isHighPriority(): boolean {
    return this.priority === 'high'
  }
}
