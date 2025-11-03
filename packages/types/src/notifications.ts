// packages/types/src/notifications.ts
// TogetherOS Notifications Module - Core Entity Definitions

/**
 * Notification types that can be triggered
 */
export type NotificationType =
  | 'mention'              // User mentioned in post/comment
  | 'proposal_update'      // Proposal status changed
  | 'discussion_reply'     // Reply to user's discussion
  | 'group_update'         // Group membership or activity
  | 'system_message'       // Platform announcements
  | 'support_points'       // SP allocation reminder
  | 'badge_earned'         // New badge achievement
  | 'reaction'             // Someone reacted to user's content

/**
 * Notification status
 */
export type NotificationStatus = 'unread' | 'read' | 'archived'

/**
 * Notification priority
 */
export type NotificationPriority = 'normal' | 'high'

/**
 * Notification entity reference
 * Links notification to source entity (post, proposal, etc.)
 */
export interface NotificationReference {
  /** Type of entity referenced */
  type: 'post' | 'proposal' | 'discussion' | 'group' | 'user' | 'badge'

  /** Entity ID */
  id: string

  /** Optional URL path for navigation */
  url?: string
}

/**
 * Core notification entity
 */
export interface Notification {
  /** Unique identifier (UUID v4) */
  id: string

  /** User who receives the notification */
  userId: string

  /** Type of notification */
  type: NotificationType

  /** Notification title */
  title: string

  /** Notification body/description */
  body: string

  /** Icon emoji or identifier */
  icon: string

  /** Priority level */
  priority: NotificationPriority

  /** Current status */
  status: NotificationStatus

  /** Reference to source entity */
  reference?: NotificationReference

  /** User who triggered the notification (optional) */
  actorId?: string

  /** Additional metadata */
  metadata?: Record<string, any>

  /** When notification was created */
  createdAt: Date

  /** When notification was read (if applicable) */
  readAt?: Date

  /** When notification was archived (if applicable) */
  archivedAt?: Date
}

/**
 * Input for creating a new notification
 */
export interface CreateNotificationInput {
  userId: string
  type: NotificationType
  title: string
  body: string
  icon: string
  priority?: NotificationPriority
  reference?: NotificationReference
  actorId?: string
  metadata?: Record<string, any>
}

/**
 * Input for updating notification status
 */
export interface UpdateNotificationStatusInput {
  notificationId: string
  userId: string
  status: NotificationStatus
}

/**
 * Notification preferences for a user
 */
export interface NotificationPreferences {
  /** User ID */
  userId: string

  /** Enable/disable by notification type */
  enabledTypes: {
    mention: boolean
    proposal_update: boolean
    discussion_reply: boolean
    group_update: boolean
    system_message: boolean
    support_points: boolean
    badge_earned: boolean
    reaction: boolean
  }

  /** Email digest frequency */
  emailDigest: 'realtime' | 'daily' | 'weekly' | 'disabled'

  /** Enable browser push notifications */
  pushEnabled: boolean

  /** Updated timestamp */
  updatedAt: Date
}

/**
 * Notification query filters
 */
export interface NotificationFilters {
  /** Filter by status */
  status?: NotificationStatus | NotificationStatus[]

  /** Filter by type */
  type?: NotificationType | NotificationType[]

  /** Filter by priority */
  priority?: NotificationPriority

  /** Only unread */
  unreadOnly?: boolean

  /** Limit results */
  limit?: number

  /** Offset for pagination */
  offset?: number
}

/**
 * Notification count by status
 */
export interface NotificationCounts {
  unread: number
  total: number
}

/**
 * Default icons for notification types
 */
export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  mention: '💬',
  proposal_update: '📋',
  discussion_reply: '💬',
  group_update: '👥',
  system_message: '📢',
  support_points: '⭐',
  badge_earned: '🏆',
  reaction: '❤️',
}
