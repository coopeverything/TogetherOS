'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { NotificationPreferences, NotificationType } from '@togetheros/types'
import { NOTIFICATION_ICONS } from '@togetheros/types'

const NOTIFICATION_TYPE_LABELS: Record<NotificationType, { label: string; description: string }> = {
  mention: { label: 'Mentions', description: 'When someone mentions you in a post or comment' },
  proposal_update: { label: 'Proposal Updates', description: 'When proposals you follow change status' },
  discussion_reply: { label: 'Discussion Replies', description: 'When someone replies to your discussions' },
  group_update: { label: 'Group Updates', description: 'Group membership and activity notifications' },
  system_message: { label: 'System Messages', description: 'Platform announcements and updates' },
  support_points: { label: 'Support Points', description: 'SP allocation reminders and updates' },
  badge_earned: { label: 'Badges Earned', description: 'When you earn new achievement badges' },
  reaction: { label: 'Reactions', description: 'When someone reacts to your content' },
}

const EMAIL_DIGEST_OPTIONS = [
  { value: 'realtime', label: 'Real-time', description: 'Get emails as they happen' },
  { value: 'daily', label: 'Daily Digest', description: 'One email per day summarizing activity' },
  { value: 'weekly', label: 'Weekly Digest', description: 'One email per week summarizing activity' },
  { value: 'disabled', label: 'Disabled', description: 'No email notifications' },
] as const

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Fetch preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await fetch('/api/notifications/preferences')
        const data = await res.json()
        setPreferences(data.preferences)
      } catch (error) {
        console.error('Failed to fetch preferences:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [])

  // Save preferences
  const savePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!preferences) return

    setSaving(true)
    setSaved(false)

    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      const data = await res.json()
      setPreferences(data.preferences)
      setSaved(true)

      // Clear saved indicator after 2 seconds
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  // Toggle notification type
  const toggleType = (type: NotificationType) => {
    if (!preferences) return

    const newEnabledTypes = {
      ...preferences.enabledTypes,
      [type]: !preferences.enabledTypes[type],
    }

    setPreferences({ ...preferences, enabledTypes: newEnabledTypes })
    savePreferences({ enabledTypes: newEnabledTypes })
  }

  // Update email digest
  const updateEmailDigest = (value: NotificationPreferences['emailDigest']) => {
    if (!preferences) return

    setPreferences({ ...preferences, emailDigest: value })
    savePreferences({ emailDigest: value })
  }

  // Toggle push notifications
  const togglePush = () => {
    if (!preferences) return

    setPreferences({ ...preferences, pushEnabled: !preferences.pushEnabled })
    savePreferences({ pushEnabled: !preferences.pushEnabled })
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-4 lg:px-8 py-4">
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    )
  }

  if (!preferences) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-4 lg:px-8 py-4">
        <div className="text-center py-6">
          <p className="text-ink-700">Failed to load preferences. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-4 lg:px-8 py-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Link
          href="/notifications"
          className="text-ink-400 hover:text-ink-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-ink-900">Notification Settings</h1>
          <p className="text-ink-700">Manage how you receive notifications</p>
        </div>
        {(saving || saved) && (
          <span className={`text-sm font-medium ${saved ? 'text-green-600' : 'text-ink-400'}`}>
            {saving ? 'Saving...' : 'Saved!'}
          </span>
        )}
      </div>

      {/* Notification Types */}
      <div className="bg-bg-1 rounded-lg border border-border mb-3">
        <div className="px-4 py-2 border-b border-border">
          <h2 className="text-sm font-semibold text-ink-900">Notification Types</h2>
          <p className="text-sm text-ink-700">Choose which notifications you want to receive</p>
        </div>
        <div className="divide-y divide-gray-100">
          {(Object.keys(NOTIFICATION_TYPE_LABELS) as NotificationType[]).map((type) => {
            const { label, description } = NOTIFICATION_TYPE_LABELS[type]
            const icon = NOTIFICATION_ICONS[type]
            const isEnabled = preferences.enabledTypes[type]

            return (
              <div key={type} className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm">{icon}</span>
                  <div>
                    <p className="font-medium text-ink-900">{label}</p>
                    <p className="text-sm text-ink-400">{description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleType(type)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                    isEnabled ? 'bg-orange-600' : 'bg-bg-2'
                  }`}
                  role="switch"
                  aria-checked={isEnabled}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-bg-1 shadow ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Email Digest */}
      <div className="bg-bg-1 rounded-lg border border-border mb-3">
        <div className="px-4 py-2 border-b border-border">
          <h2 className="text-sm font-semibold text-ink-900">Email Notifications</h2>
          <p className="text-sm text-ink-700">How often to receive email summaries</p>
        </div>
        <div className="p-4 space-y-3">
          {EMAIL_DIGEST_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                preferences.emailDigest === option.value
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-border hover:bg-bg-0'
              }`}
            >
              <input
                type="radio"
                name="emailDigest"
                value={option.value}
                checked={preferences.emailDigest === option.value}
                onChange={() => updateEmailDigest(option.value)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-border"
              />
              <div>
                <p className="font-medium text-ink-900">{option.label}</p>
                <p className="text-sm text-ink-400">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-bg-1 rounded-lg border border-border">
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-ink-900">Push Notifications</h2>
            <p className="text-sm text-ink-700">Receive browser notifications for important updates</p>
          </div>
          <button
            onClick={togglePush}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
              preferences.pushEnabled ? 'bg-orange-600' : 'bg-bg-2'
            }`}
            role="switch"
            aria-checked={preferences.pushEnabled}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-bg-1 shadow ring-0 transition duration-200 ease-in-out ${
                preferences.pushEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        {preferences.pushEnabled && (
          <div className="px-4 pb-4">
            <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-3">
              Push notifications require browser permission. Click &quot;Allow&quot; when prompted.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
