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
 * Get color scheme for notification type
 */
function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    mention: 'bg-blue-50 border-blue-200',
    proposal_update: 'bg-purple-50 border-purple-200',
    discussion_reply: 'bg-green-50 border-green-200',
    group_update: 'bg-yellow-50 border-yellow-200',
    system_message: 'bg-gray-50 border-gray-200',
    support_points: 'bg-amber-50 border-amber-200',
    badge_earned: 'bg-orange-50 border-orange-200',
    reaction: 'bg-pink-50 border-pink-200',
  }
  return colors[type] || 'bg-gray-50 border-gray-200'
}

/**
 * Format timestamp for display
 */
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return new Date(date).toLocaleDateString()
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
      <div className="flex-shrink-0 text-2xl">
        {getNotificationIcon(notification.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {notification.title}
        </p>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
          {notification.message}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {formatTimeAgo(notification.createdAt)}
        </p>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={() => onDismiss?.(notification.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600"
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
