'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { NotificationBell, NotificationToast, NotificationInbox } from '@togetheros/ui'
import type { Notification, NotificationStatus } from '@togetheros/types'

// Mock notification data
const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '00000000-0000-0000-0000-000000000001',
    type: 'mention',
    title: 'Sarah mentioned you',
    message: 'Sarah mentioned you in a discussion about "Community Gardens"',
    status: 'unread',
    priority: 'normal',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    metadata: {
      reference: {
        type: 'discussion',
        id: 'd-123',
      },
    },
  },
  {
    id: '2',
    userId: '00000000-0000-0000-0000-000000000001',
    type: 'proposal_update',
    title: 'Proposal Status Changed',
    message: 'The proposal "Local Food Co-op" has moved to voting stage',
    status: 'unread',
    priority: 'high',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    metadata: {
      reference: {
        type: 'proposal',
        id: 'p-456',
      },
    },
  },
  {
    id: '3',
    userId: '00000000-0000-0000-0000-000000000001',
    type: 'discussion_reply',
    title: 'New reply to your discussion',
    message: 'Alex replied to "How can we improve bike infrastructure?"',
    status: 'read',
    priority: 'normal',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    readAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    metadata: {
      reference: {
        type: 'discussion',
        id: 'd-789',
      },
    },
  },
  {
    id: '4',
    userId: '00000000-0000-0000-0000-000000000001',
    type: 'group_update',
    title: 'New member joined',
    message: 'Jordan just joined the "Urban Gardeners" group',
    status: 'read',
    priority: 'normal',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    readAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    metadata: {
      reference: {
        type: 'group',
        id: 'g-101',
      },
    },
  },
  {
    id: '5',
    userId: '00000000-0000-0000-0000-000000000001',
    type: 'badge_earned',
    title: 'New Badge Earned!',
    message: 'You earned the "Active Participant" badge for your contributions',
    status: 'read',
    priority: 'high',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    readAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    metadata: {
      reference: {
        type: 'badge',
        id: 'b-202',
      },
    },
  },
  {
    id: '6',
    userId: '00000000-0000-0000-0000-000000000001',
    type: 'support_points',
    title: 'Support Points Received',
    message: 'You received 5 Support Points for your proposal contribution',
    status: 'archived',
    priority: 'normal',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    readAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    archivedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    metadata: {},
  },
]

export default function NotificationsTestPage() {
  const [activeTab, setActiveTab] = useState<'showcase' | 'demo' | 'api'>('showcase')
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [toastNotification, setToastNotification] = useState<Notification | null>(null)

  const unreadCount = notifications.filter((n) => n.status === 'unread').length

  // Simulate receiving a new notification
  const simulateNewNotification = () => {
    const newNotification: Notification = {
      id: `new-${Date.now()}`,
      userId: '00000000-0000-0000-0000-000000000001',
      type: 'reaction',
      title: 'Someone reacted to your post',
      message: 'Chris reacted with ❤️ to your post about community resilience',
      status: 'unread',
      priority: 'normal',
      createdAt: new Date(),
      metadata: {},
    }
    setNotifications([newNotification, ...notifications])
    setToastNotification(newNotification)
  }

  const handleUpdateStatus = (notificationId: string, status: NotificationStatus) => {
    setNotifications(
      notifications.map((n) =>
        n.id === notificationId
          ? {
              ...n,
              status,
              readAt: status === 'read' ? new Date() : n.readAt,
              archivedAt: status === 'archived' ? new Date() : n.archivedAt,
            }
          : n
      )
    )
  }

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((n) => ({
        ...n,
        status: n.status === 'unread' ? 'read' : n.status,
        readAt: n.status === 'unread' ? new Date() : n.readAt,
      }))
    )
  }

  const handleDelete = (notificationId: string) => {
    setNotifications(notifications.filter((n) => n.id !== notificationId))
  }

  return (
    <div className="min-h-screen bg-bg-1 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-900">Notifications Test Page</h1>
          <p className="mt-2 text-ink-600">
            Testing interface for notification components: bell, toast, and inbox.
          </p>
          <div className="mt-3 flex gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              MVP Ready
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              UI Components
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-border">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'showcase' as const, label: 'Component Showcase' },
              { id: 'demo' as const, label: 'Interactive Demo' },
              { id: 'api' as const, label: 'API Documentation' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-ink-400 hover:text-ink-700 hover:border-border'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-bg-0 rounded-lg shadow-sm p-6">
          {/* Component Showcase Tab */}
          {activeTab === 'showcase' && (
            <div className="space-y-10">
              <section>
                <h2 className="text-2xl font-semibold mb-4">NotificationBell Component</h2>
                <p className="text-ink-600 mb-6">
                  Bell icon with unread count badge, typically displayed in the app header.
                </p>
                <div className="flex gap-6 items-center p-6 bg-bg-2 rounded">
                  <div>
                    <p className="text-sm text-ink-600 mb-2">No unread</p>
                    <NotificationBell unreadCount={0} />
                  </div>
                  <div>
                    <p className="text-sm text-ink-600 mb-2">3 unread</p>
                    <NotificationBell unreadCount={3} />
                  </div>
                  <div>
                    <p className="text-sm text-ink-600 mb-2">99+ unread</p>
                    <NotificationBell unreadCount={150} />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">NotificationToast Component</h2>
                <p className="text-ink-600 mb-6">
                  Temporary toast notification that appears in the top-right corner.
                </p>
                <div className="space-y-4">
                  <button
                    onClick={simulateNewNotification}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Show Toast Notification
                  </button>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">NotificationInbox Component</h2>
                <p className="text-ink-600 mb-6">
                  Full inbox view with filtering, status updates, and actions.
                </p>
                <NotificationInbox
                  notifications={notifications}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDelete}
                  onMarkAllAsRead={handleMarkAllAsRead}
                />
              </section>
            </div>
          )}

          {/* Interactive Demo Tab */}
          {activeTab === 'demo' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Interactive Demo</h2>
              <p className="text-ink-600 mb-6">
                Simulate real-world notification scenarios.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={simulateNewNotification}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Simulate New Notification
                </button>
                <button
                  onClick={handleMarkAllAsRead}
                  className="px-4 py-2 bg-ink-600 text-white rounded hover:bg-ink-700"
                >
                  Mark All As Read
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Current State</h3>
                  <div className="p-4 bg-bg-2 rounded space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Total:</span> {notifications.length}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Unread:</span> {unreadCount}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Read:</span>{' '}
                      {notifications.filter((n) => n.status === 'read').length}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Archived:</span>{' '}
                      {notifications.filter((n) => n.status === 'archived').length}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Bell Preview</h3>
                  <div className="p-4 bg-bg-2 rounded flex justify-center">
                    <NotificationBell unreadCount={unreadCount} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Documentation Tab */}
          {activeTab === 'api' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold mb-4">API Endpoints</h2>

              <div className="space-y-6">
                <div className="border border-border rounded p-4">
                  <h3 className="font-mono text-sm font-semibold mb-2">
                    GET /api/notifications
                  </h3>
                  <p className="text-sm text-ink-600 mb-3">
                    List notifications for user with optional filters
                  </p>
                  <div className="bg-bg-2 p-3 rounded text-xs font-mono">
                    Query params: userId, status, type, priority, unreadOnly, offset, limit
                  </div>
                </div>

                <div className="border border-border rounded p-4">
                  <h3 className="font-mono text-sm font-semibold mb-2">
                    GET /api/notifications/counts
                  </h3>
                  <p className="text-sm text-ink-600 mb-3">
                    Get unread and total notification counts
                  </p>
                  <div className="bg-bg-2 p-3 rounded text-xs font-mono">
                    Query params: userId
                  </div>
                </div>

                <div className="border border-border rounded p-4">
                  <h3 className="font-mono text-sm font-semibold mb-2">
                    PATCH /api/notifications/[id]
                  </h3>
                  <p className="text-sm text-ink-600 mb-3">
                    Update notification status (read, unread, archived)
                  </p>
                  <div className="bg-bg-2 p-3 rounded text-xs font-mono">
                    Body: {JSON.stringify({ userId: 'uuid', status: 'read' })}
                  </div>
                </div>

                <div className="border border-border rounded p-4">
                  <h3 className="font-mono text-sm font-semibold mb-2">
                    POST /api/notifications/mark-all-read
                  </h3>
                  <p className="text-sm text-ink-600 mb-3">
                    Mark all notifications as read for user
                  </p>
                  <div className="bg-bg-2 p-3 rounded text-xs font-mono">
                    Body: {JSON.stringify({ userId: 'uuid' })}
                  </div>
                </div>

                <div className="border border-border rounded p-4">
                  <h3 className="font-mono text-sm font-semibold mb-2">
                    POST /api/notifications/bulk
                  </h3>
                  <p className="text-sm text-ink-600 mb-3">
                    Create multiple notifications (broadcast)
                  </p>
                  <div className="bg-bg-2 p-3 rounded text-xs font-mono overflow-x-auto">
                    Body: {JSON.stringify({ notifications: [{ userId: 'uuid', type: 'system_message', title: '...', message: '...' }] })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Container (fixed position) */}
      {toastNotification && (
        <div className="fixed top-4 right-4 z-50">
          <NotificationToast
            notification={toastNotification}
            onDismiss={() => setToastNotification(null)}
            duration={5000}
          />
        </div>
      )}
    </div>
  )
}
