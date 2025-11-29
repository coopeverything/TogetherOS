/**
 * Notification database operations
 * PostgreSQL persistence for the Notifications & Inbox module
 */

import { query } from './index'
import type {
  Notification,
  CreateNotificationInput,
  NotificationFilters,
  NotificationCounts,
  NotificationStatus,
  NotificationPreferences,
  NotificationType,
} from '@togetheros/types'
import { NOTIFICATION_ICONS } from '@togetheros/types'

/**
 * Database row types
 */
interface NotificationRow {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  icon: string | null
  priority: 'normal' | 'high'
  status: NotificationStatus
  reference_type: string | null
  reference_id: string | null
  reference_url: string | null
  actor_id: string | null
  metadata: Record<string, unknown> | null
  created_at: Date
  read_at: Date | null
  archived_at: Date | null
}

interface PreferencesRow {
  user_id: string
  enable_mention: boolean
  enable_proposal_update: boolean
  enable_discussion_reply: boolean
  enable_group_update: boolean
  enable_system_message: boolean
  enable_support_points: boolean
  enable_badge_earned: boolean
  enable_reaction: boolean
  email_digest: 'realtime' | 'daily' | 'weekly' | 'disabled'
  push_enabled: boolean
  created_at: Date
  updated_at: Date
}

/**
 * Map database row to Notification type
 */
function rowToNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    icon: row.icon || NOTIFICATION_ICONS[row.type],
    priority: row.priority,
    status: row.status,
    reference: row.reference_type && row.reference_id
      ? {
          type: row.reference_type as 'post' | 'proposal' | 'discussion' | 'group' | 'user' | 'badge',
          id: row.reference_id,
          url: row.reference_url || undefined,
        }
      : undefined,
    actorId: row.actor_id || undefined,
    metadata: row.metadata || undefined,
    createdAt: row.created_at,
    readAt: row.read_at || undefined,
    archivedAt: row.archived_at || undefined,
  }
}

/**
 * Map preferences row to NotificationPreferences type
 */
function rowToPreferences(row: PreferencesRow): NotificationPreferences {
  return {
    userId: row.user_id,
    enabledTypes: {
      mention: row.enable_mention,
      proposal_update: row.enable_proposal_update,
      discussion_reply: row.enable_discussion_reply,
      group_update: row.enable_group_update,
      system_message: row.enable_system_message,
      support_points: row.enable_support_points,
      badge_earned: row.enable_badge_earned,
      reaction: row.enable_reaction,
    },
    emailDigest: row.email_digest,
    pushEnabled: row.push_enabled,
    updatedAt: row.updated_at,
  }
}

// ============================================
// NOTIFICATION CRUD OPERATIONS
// ============================================

/**
 * Create a new notification
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<Notification> {
  const icon = input.icon || NOTIFICATION_ICONS[input.type]

  const result = await query<NotificationRow>(
    `INSERT INTO notifications_notifications (
      user_id, type, title, message, icon, priority,
      reference_type, reference_id, reference_url,
      actor_id, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [
      input.userId,
      input.type,
      input.title,
      input.message,
      icon,
      input.priority || 'normal',
      input.reference?.type || null,
      input.reference?.id || null,
      input.reference?.url || null,
      input.actorId || null,
      input.metadata ? JSON.stringify(input.metadata) : null,
    ]
  )

  return rowToNotification(result.rows[0])
}

/**
 * Find notification by ID
 */
export async function findNotificationById(
  id: string
): Promise<Notification | null> {
  const result = await query<NotificationRow>(
    'SELECT * FROM notifications_notifications WHERE id = $1',
    [id]
  )

  if (!result.rows[0]) {
    return null
  }

  return rowToNotification(result.rows[0])
}

/**
 * List notifications for a user with filters
 */
export async function listNotificationsForUser(
  userId: string,
  filters: NotificationFilters = {}
): Promise<Notification[]> {
  let whereClause = 'WHERE user_id = $1'
  const params: (string | string[] | number)[] = [userId]
  let paramIndex = 2

  // Status filter
  if (filters.status) {
    const statuses = Array.isArray(filters.status)
      ? filters.status
      : [filters.status]
    whereClause += ` AND status = ANY($${paramIndex}::notification_status[])`
    params.push(statuses)
    paramIndex++
  }

  // Type filter
  if (filters.type) {
    const types = Array.isArray(filters.type) ? filters.type : [filters.type]
    whereClause += ` AND type = ANY($${paramIndex}::notification_type[])`
    params.push(types)
    paramIndex++
  }

  // Priority filter
  if (filters.priority) {
    whereClause += ` AND priority = $${paramIndex}`
    params.push(filters.priority)
    paramIndex++
  }

  // Unread only filter
  if (filters.unreadOnly) {
    whereClause += ` AND status = 'unread'`
  }

  // Pagination
  const limit = filters.limit ?? 20
  const offset = filters.offset ?? 0

  const result = await query<NotificationRow>(
    `SELECT * FROM notifications_notifications
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  )

  return result.rows.map(rowToNotification)
}

/**
 * Count notifications for a user
 */
export async function countNotificationsForUser(
  userId: string,
  filters: NotificationFilters = {}
): Promise<number> {
  let whereClause = 'WHERE user_id = $1'
  const params: (string | string[])[] = [userId]
  let paramIndex = 2

  if (filters.status) {
    const statuses = Array.isArray(filters.status)
      ? filters.status
      : [filters.status]
    whereClause += ` AND status = ANY($${paramIndex}::notification_status[])`
    params.push(statuses)
    paramIndex++
  }

  if (filters.type) {
    const types = Array.isArray(filters.type) ? filters.type : [filters.type]
    whereClause += ` AND type = ANY($${paramIndex}::notification_type[])`
    params.push(types)
    paramIndex++
  }

  if (filters.unreadOnly) {
    whereClause += ` AND status = 'unread'`
  }

  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM notifications_notifications ${whereClause}`,
    params
  )

  return parseInt(result.rows[0]?.count || '0', 10)
}

/**
 * Get notification counts (unread, total) for a user
 */
export async function getNotificationCounts(
  userId: string
): Promise<NotificationCounts> {
  const result = await query<{ total: string; unread: string }>(
    `SELECT
       COUNT(*) as total,
       COUNT(*) FILTER (WHERE status = 'unread') as unread
     FROM notifications_notifications
     WHERE user_id = $1`,
    [userId]
  )

  const row = result.rows[0]
  return {
    total: parseInt(row?.total || '0', 10),
    unread: parseInt(row?.unread || '0', 10),
  }
}

/**
 * Update notification status
 */
export async function updateNotificationStatus(
  notificationId: string,
  userId: string,
  status: NotificationStatus
): Promise<Notification | null> {
  let updateFields = 'status = $3'
  const now = new Date()

  if (status === 'read') {
    updateFields += ', read_at = $4'
  } else if (status === 'archived') {
    updateFields += ', archived_at = $4'
  } else if (status === 'unread') {
    updateFields += ', read_at = NULL, archived_at = NULL'
  }

  const params: (string | Date)[] = [notificationId, userId, status]
  if (status === 'read' || status === 'archived') {
    params.push(now)
  }

  const result = await query<NotificationRow>(
    `UPDATE notifications_notifications
     SET ${updateFields}
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    params
  )

  if (!result.rows[0]) {
    return null
  }

  return rowToNotification(result.rows[0])
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(
  userId: string
): Promise<number> {
  const result = await query(
    `UPDATE notifications_notifications
     SET status = 'read', read_at = NOW()
     WHERE user_id = $1 AND status = 'unread'`,
    [userId]
  )

  return result.rowCount || 0
}

/**
 * Delete a notification
 */
export async function deleteNotification(
  notificationId: string,
  userId: string
): Promise<boolean> {
  const result = await query(
    'DELETE FROM notifications_notifications WHERE id = $1 AND user_id = $2',
    [notificationId, userId]
  )

  return (result.rowCount || 0) > 0
}

/**
 * Delete all archived notifications for a user
 */
export async function deleteAllArchivedNotifications(
  userId: string
): Promise<number> {
  const result = await query(
    `DELETE FROM notifications_notifications
     WHERE user_id = $1 AND status = 'archived'`,
    [userId]
  )

  return result.rowCount || 0
}

/**
 * Bulk create notifications (for broadcasts)
 */
export async function bulkCreateNotifications(
  inputs: CreateNotificationInput[]
): Promise<Notification[]> {
  if (inputs.length === 0) {
    return []
  }

  const notifications: Notification[] = []

  // Use a transaction for bulk insert
  for (const input of inputs) {
    const notification = await createNotification(input)
    notifications.push(notification)
  }

  return notifications
}

// ============================================
// USER PREFERENCES OPERATIONS
// ============================================

/**
 * Get user notification preferences
 * Returns defaults if no preferences set
 */
export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  const result = await query<PreferencesRow>(
    'SELECT * FROM notifications_preferences WHERE user_id = $1',
    [userId]
  )

  if (!result.rows[0]) {
    // Return defaults
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

  return rowToPreferences(result.rows[0])
}

/**
 * Update user notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<Omit<NotificationPreferences, 'userId' | 'updatedAt'>>
): Promise<NotificationPreferences> {
  // Build dynamic update based on provided fields
  const updates: string[] = []
  const values: (string | boolean)[] = [userId]
  let paramIndex = 2

  if (preferences.enabledTypes) {
    const types = preferences.enabledTypes
    if (types.mention !== undefined) {
      updates.push(`enable_mention = $${paramIndex++}`)
      values.push(types.mention)
    }
    if (types.proposal_update !== undefined) {
      updates.push(`enable_proposal_update = $${paramIndex++}`)
      values.push(types.proposal_update)
    }
    if (types.discussion_reply !== undefined) {
      updates.push(`enable_discussion_reply = $${paramIndex++}`)
      values.push(types.discussion_reply)
    }
    if (types.group_update !== undefined) {
      updates.push(`enable_group_update = $${paramIndex++}`)
      values.push(types.group_update)
    }
    if (types.system_message !== undefined) {
      updates.push(`enable_system_message = $${paramIndex++}`)
      values.push(types.system_message)
    }
    if (types.support_points !== undefined) {
      updates.push(`enable_support_points = $${paramIndex++}`)
      values.push(types.support_points)
    }
    if (types.badge_earned !== undefined) {
      updates.push(`enable_badge_earned = $${paramIndex++}`)
      values.push(types.badge_earned)
    }
    if (types.reaction !== undefined) {
      updates.push(`enable_reaction = $${paramIndex++}`)
      values.push(types.reaction)
    }
  }

  if (preferences.emailDigest !== undefined) {
    updates.push(`email_digest = $${paramIndex++}`)
    values.push(preferences.emailDigest)
  }

  if (preferences.pushEnabled !== undefined) {
    updates.push(`push_enabled = $${paramIndex++}`)
    values.push(preferences.pushEnabled)
  }

  if (updates.length === 0) {
    return getNotificationPreferences(userId)
  }

  // Upsert preferences
  const result = await query<PreferencesRow>(
    `INSERT INTO notifications_preferences (user_id, ${updates.map((u) => u.split(' = ')[0]).join(', ')})
     VALUES ($1, ${values.slice(1).map((_, i) => `$${i + 2}`).join(', ')})
     ON CONFLICT (user_id) DO UPDATE SET ${updates.join(', ')}
     RETURNING *`,
    values
  )

  return rowToPreferences(result.rows[0])
}

/**
 * Check if a notification type is enabled for a user
 */
export async function isNotificationTypeEnabled(
  userId: string,
  type: NotificationType
): Promise<boolean> {
  const prefs = await getNotificationPreferences(userId)
  return prefs.enabledTypes[type] ?? true
}

// ============================================
// NOTIFICATION TRIGGERS (for module integrations)
// ============================================

/**
 * Create a mention notification
 */
export async function notifyMention(
  userId: string,
  actorId: string,
  referenceType: 'post' | 'discussion',
  referenceId: string,
  referenceUrl?: string
): Promise<Notification | null> {
  if (!(await isNotificationTypeEnabled(userId, 'mention'))) {
    return null
  }

  return createNotification({
    userId,
    type: 'mention',
    title: 'You were mentioned',
    message: 'Someone mentioned you in a post',
    actorId,
    reference: { type: referenceType, id: referenceId, url: referenceUrl },
  })
}

/**
 * Create a proposal update notification
 */
export async function notifyProposalUpdate(
  userId: string,
  proposalId: string,
  updateType: 'status_change' | 'new_vote' | 'deliberation_started',
  message: string
): Promise<Notification | null> {
  if (!(await isNotificationTypeEnabled(userId, 'proposal_update'))) {
    return null
  }

  return createNotification({
    userId,
    type: 'proposal_update',
    title: 'Proposal Update',
    message,
    reference: { type: 'proposal', id: proposalId, url: `/governance/${proposalId}` },
    metadata: { updateType },
  })
}

/**
 * Create a discussion reply notification
 */
export async function notifyDiscussionReply(
  userId: string,
  actorId: string,
  discussionId: string,
  discussionUrl?: string
): Promise<Notification | null> {
  if (!(await isNotificationTypeEnabled(userId, 'discussion_reply'))) {
    return null
  }

  return createNotification({
    userId,
    type: 'discussion_reply',
    title: 'New Reply',
    message: 'Someone replied to your discussion',
    actorId,
    reference: { type: 'discussion', id: discussionId, url: discussionUrl },
  })
}

/**
 * Create a group update notification
 */
export async function notifyGroupUpdate(
  userId: string,
  groupId: string,
  updateType: 'member_joined' | 'role_changed' | 'announcement',
  message: string
): Promise<Notification | null> {
  if (!(await isNotificationTypeEnabled(userId, 'group_update'))) {
    return null
  }

  return createNotification({
    userId,
    type: 'group_update',
    title: 'Group Update',
    message,
    reference: { type: 'group', id: groupId, url: `/groups/${groupId}` },
    metadata: { updateType },
  })
}

/**
 * Create a badge earned notification
 */
export async function notifyBadgeEarned(
  userId: string,
  badgeId: string,
  badgeName: string
): Promise<Notification | null> {
  if (!(await isNotificationTypeEnabled(userId, 'badge_earned'))) {
    return null
  }

  return createNotification({
    userId,
    type: 'badge_earned',
    title: 'Badge Earned!',
    message: `You earned the "${badgeName}" badge`,
    priority: 'high',
    reference: { type: 'badge', id: badgeId },
  })
}

/**
 * Create a system message notification (broadcasts to all)
 */
export async function notifySystemMessage(
  userIds: string[],
  title: string,
  message: string,
  priority: 'normal' | 'high' = 'normal'
): Promise<Notification[]> {
  const inputs: CreateNotificationInput[] = userIds.map((userId) => ({
    userId,
    type: 'system_message' as NotificationType,
    title,
    message,
    priority,
  }))

  return bulkCreateNotifications(inputs)
}
