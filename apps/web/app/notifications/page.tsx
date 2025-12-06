'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Notification, NotificationCounts, NotificationStatus } from '@togetheros/types'

type FilterTab = 'all' | 'unread' | 'proposal_update' | 'discussion_reply' | 'group_update' | 'system_message'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [counts, setCounts] = useState<NotificationCounts>({ unread: 0, total: 0 })
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [loading, setLoading] = useState(true)

  // Fetch notifications
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (activeFilter === 'unread') {
          params.set('unreadOnly', 'true')
        } else if (activeFilter !== 'all') {
          params.set('type', activeFilter)
        }

        const [notifRes, countsRes] = await Promise.all([
          fetch(`/api/notifications?${params.toString()}`),
          fetch('/api/notifications/count'),
        ])

        const notifData = await notifRes.json()
        const countsData = await countsRes.json()

        setNotifications(notifData.notifications || [])
        setCounts(countsData.counts || { unread: 0, total: 0 })
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [activeFilter])

  // Mark as read handler
  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications/actions/mark-as-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      })

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, status: 'read' as NotificationStatus, readAt: new Date() } : n
        )
      )
      setCounts((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1) }))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  // Mark all as read handler
  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications/actions/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, status: 'read' as NotificationStatus, readAt: new Date() }))
      )
      setCounts((prev) => ({ ...prev, unread: 0 }))
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const filters: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'proposal_update', label: 'Proposals' },
    { key: 'discussion_reply', label: 'Discussions' },
    { key: 'group_update', label: 'Groups' },
    { key: 'system_message', label: 'System' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-4 lg:px-8 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {counts.unread > 0 ? `${counts.unread} unread` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {counts.unread > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
            >
              Mark all as read
            </button>
          )}
          <Link
            href="/notifications/settings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-3 flex-wrap border-b border-gray-200 dark:border-gray-700 pb-4">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 ${
              activeFilter === filter.key
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {filter.label}
            {filter.key === 'unread' && counts.unread > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white dark:bg-gray-800/20 text-xs rounded-full">
                {counts.unread}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-sm mb-4">🔔</div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">No notifications</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {activeFilter === 'unread'
              ? "You're all caught up!"
              : 'No notifications to show for this filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-lg border transition-colors ${
                notif.status === 'unread'
                  ? 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                  : 'bg-white dark:bg-gray-800 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-sm flex-shrink-0">{notif.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-semibold mb-1 ${
                      notif.status === 'unread' ? 'text-gray-900 dark:text-white' : 'text-gray-700'
                    }`}
                  >
                    {notif.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{notif.message}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {new Date(notif.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    {notif.status === 'unread' && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-orange-600 hover:text-orange-700 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
                      >
                        Mark as read
                      </button>
                    )}
                    {notif.reference?.url && (
                      <Link
                        href={notif.reference.url}
                        className="text-orange-600 hover:text-orange-700 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </div>
                {notif.priority === 'high' && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                    Important
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
