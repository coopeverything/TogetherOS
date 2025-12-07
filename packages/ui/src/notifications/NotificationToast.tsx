/**
 * NotificationToast Component
 *
 * Toast notification display for temporary in-app notifications.
 * Appears in the top-right corner and auto-dismisses.
 */

'use client'

import { useEffect } from 'react'
import type { Notification, NotificationType } from '@togetheros/types'

export interface NotificationToastProps {
  /** Notification data to display */
  notification: Notification

  /** Callback when toast is dismissed */
  onDismiss?: (id: string) => void

  /** Auto-dismiss duration in ms (default: 5000) */
  duration?: number

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
 * Get color scheme for notification type - uses theme-aware accent colors
 */
function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    mention: 'bg-accent-1-bg border-accent-1/30',
    proposal_update: 'bg-accent-2-bg border-accent-2/30',
    discussion_reply: 'bg-success-bg border-success/30',
    group_update: 'bg-warning-bg border-warning/30',
    system_message: 'bg-bg-2 border-border',
    support_points: 'bg-accent-3-bg border-accent-3/30',
    badge_earned: 'bg-joy-100 border-joy-300',
    reaction: 'bg-accent-4-bg border-accent-4/30',
  }
  return colors[type] || 'bg-bg-2 border-border'
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

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return dateObj.toLocaleDateString()
}

export function NotificationToast({
  notification,
  onDismiss,
  duration = 5000,
  className = '',
}: NotificationToastProps) {
  // Auto-dismiss after duration
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss?.(notification.id)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [notification.id, duration, onDismiss])

  return (
    <div
      className={`
        relative
        flex items-start gap-3
        w-80 p-4
        border rounded-lg shadow-lg
        ${getNotificationColor(notification.type)}
        animate-slide-in-right
        ${className}
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className="flex-shrink-0 text-sm">
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-900">
          {notification.title}
        </p>
        <p className="mt-1 text-sm text-ink-700 line-clamp-2">
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-ink-400">
          {formatTimeAgo(notification.createdAt)}
        </p>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={() => onDismiss?.(notification.id)}
        className="flex-shrink-0 text-ink-400 hover:text-ink-700"
        aria-label="Dismiss notification"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  )
}
