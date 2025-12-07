/**
 * NotificationInbox Component
 *
 * Full inbox view for notifications with filtering and actions.
 * Displays a list of notifications with mark-as-read, archive, and delete actions.
 */

'use client'

import { useState } from 'react'
import type { Notification, NotificationStatus, NotificationType } from '@togetheros/types'

export interface NotificationInboxProps {
  /** Array of notifications to display */
  notifications: Notification[]

  /** Callback when notification is clicked */
  onNotificationClick?: (notification: Notification) => void

  /** Callback when mark as read/unread/archived */
  onUpdateStatus?: (notificationId: string, status: NotificationStatus) => void

  /** Callback when delete clicked */
  onDelete?: (notificationId: string) => void

  /** Callback when mark all as read clicked */
  onMarkAllAsRead?: () => void

  /** Loading state */
  loading?: boolean

  /** Optional CSS class name */
  className?: string
}

/**
 * Get icon for notification type
 */
function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    mention: '💬',
    proposal_update: '📋',
    discussion_reply: '💭',
    group_update: '👥',
    system_message: '📢',
    support_points: '⭐',
    badge_earned: '🏆',
    reaction: '❤️',
  }
  return icons[type] || '🔔'
}

/**
 * Format timestamp for display
 * Handles both Date objects and ISO date strings
 */
function formatTimeAgo(date: Date | string): string {
  const now = new Date()
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return dateObj.toLocaleDateString()
}

export function NotificationInbox({
  notifications,
  onNotificationClick,
  onUpdateStatus,
  onDelete,
  onMarkAllAsRead,
  loading = false,
  className = '',
}: NotificationInboxProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all')

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === 'unread') return notification.status === 'unread'
    if (filter === 'archived') return notification.status === 'archived'
    return notification.status !== 'archived' // 'all' excludes archived
  })

  const unreadCount = notifications.filter((n) => n.status === 'unread').length

  return (
    <div className={`bg-bg-1 rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-ink-900">Notifications</h2>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-sm text-brand-600 hover:text-brand-700"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 p-4 border-b border-border">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 text-sm rounded-full ${
            filter === 'all'
              ? 'bg-brand-bg text-brand-600'
              : 'bg-bg-2 text-ink-700 hover:bg-bg-0'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1 text-sm rounded-full ${
            filter === 'unread'
              ? 'bg-brand-bg text-brand-600'
              : 'bg-bg-2 text-ink-700 hover:bg-bg-0'
          }`}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
        <button
          onClick={() => setFilter('archived')}
          className={`px-3 py-1 text-sm rounded-full ${
            filter === 'archived'
              ? 'bg-brand-bg text-brand-600'
              : 'bg-bg-2 text-ink-700 hover:bg-bg-0'
          }`}
        >
          Archived
        </button>
      </div>

      {/* Notification List */}
      <div className="divide-y divide-border">
        {loading ? (
          <div className="p-4 text-center text-ink-400">Loading...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-4 text-center text-ink-400">
            {filter === 'unread' && 'No unread notifications'}
            {filter === 'archived' && 'No archived notifications'}
            {filter === 'all' && 'No notifications'}
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`
                flex items-start gap-3 p-4
                hover:bg-bg-2 cursor-pointer transition-colors
                ${notification.status === 'unread' ? 'bg-info-bg' : ''}
              `}
              onClick={() => onNotificationClick?.(notification)}
            >
              {/* Unread Indicator */}
              {notification.status === 'unread' && (
                <div className="flex-shrink-0 w-2 h-2 mt-2 bg-brand-600 rounded-full" />
              )}

              {/* Icon */}
              <div className="flex-shrink-0 text-sm">
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-900">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm text-ink-700">
                  {notification.message}
                </p>
                <p className="mt-1 text-xs text-ink-400">
                  {formatTimeAgo(notification.createdAt)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1">
                {notification.status === 'unread' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onUpdateStatus?.(notification.id, 'read')
                    }}
                    className="text-xs text-brand-600 hover:text-brand-700"
                  >
                    Mark read
                  </button>
                )}
                {notification.status === 'read' && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onUpdateStatus?.(notification.id, 'archived')
                      }}
                      className="text-xs text-ink-700 hover:text-ink-900"
                    >
                      Archive
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onUpdateStatus?.(notification.id, 'unread')
                      }}
                      className="text-xs text-ink-700 hover:text-ink-900"
                    >
                      Mark unread
                    </button>
                  </>
                )}
                {notification.status === 'archived' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete?.(notification.id)
                    }}
                    className="text-xs text-danger hover:opacity-80"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
