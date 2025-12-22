'use client'

import { useEffect, useState } from 'react'

interface Flag {
  id: string
  contentId: string
  contentType: 'topic' | 'post' | 'reply'
  flaggedBy: string
  reason: string
  details?: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: string
}

export default function ModerationQueuePage() {
  const [flags, setFlags] = useState<Flag[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')
  const [updatingFlagId, setUpdatingFlagId] = useState<string | null>(null)

  useEffect(() => {
    fetchFlags()
  }, [filter])

  async function fetchFlags() {
    try {
      setLoading(true)
      const url = '/api/forum/flags?status=pending'

      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch flags')
      const data = await res.json()
      setFlags(data.flags || [])
    } catch (err) {
      console.error('Error fetching flags:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleResolveFlag(flagId: string) {
    if (updatingFlagId) return
    setUpdatingFlagId(flagId)
    try {
      const res = await fetch(`/api/forum/flags/${flagId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'action-taken' }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to resolve flag')
      }
      // Remove flag from list
      setFlags(flags.filter(f => f.id !== flagId))
    } catch (err) {
      console.error('Error resolving flag:', err)
      alert(err instanceof Error ? err.message : 'Failed to resolve flag')
    } finally {
      setUpdatingFlagId(null)
    }
  }

  async function handleDismissFlag(flagId: string) {
    if (updatingFlagId) return
    setUpdatingFlagId(flagId)
    try {
      const res = await fetch(`/api/forum/flags/${flagId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dismissed' }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to dismiss flag')
      }
      // Remove flag from list
      setFlags(flags.filter(f => f.id !== flagId))
    } catch (err) {
      console.error('Error dismissing flag:', err)
      alert(err instanceof Error ? err.message : 'Failed to dismiss flag')
    } finally {
      setUpdatingFlagId(null)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-bg-2 rounded w-1/3"></div>
          <div className="h-32 bg-bg-2 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-4xl">
      <div className="mb-3">
        <h1 className="text-sm font-bold text-ink-900">
          Moderation Queue
        </h1>
        <p className="text-ink-700 mt-2">
          Review flagged content and take appropriate action.
        </p>
      </div>

      {/* Filter */}
      <div className="mb-3 flex gap-2">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-bg-2 text-ink-700 hover:bg-gray-300'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-bg-2 text-ink-700 hover:bg-gray-300'
          }`}
        >
          All
        </button>
      </div>

      {/* Flags List */}
      {flags.length === 0 ? (
        <div className="bg-bg-0 border border-border rounded-lg p-4 text-center">
          <p className="text-ink-700">
            {filter === 'pending' ? 'No pending flags' : 'No flags found'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {flags.map((flag) => (
            <div
              key={flag.id}
              className="bg-bg-1 rounded-lg border border-border p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    flag.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : flag.status === 'resolved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-bg-2 text-ink-900'
                  }`}>
                    {flag.status}
                  </span>
                  <span className="ml-2 text-sm text-ink-400">
                    {flag.contentType}
                  </span>
                </div>
                <span className="text-xs text-ink-400">
                  {new Date(flag.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-ink-700">Reason:</span>
                  <span className="ml-2 text-sm text-ink-900">{flag.reason}</span>
                </div>
                {flag.details && (
                  <div>
                    <span className="text-sm font-medium text-ink-700">Details:</span>
                    <p className="mt-1 text-sm text-ink-700">{flag.details}</p>
                  </div>
                )}
                <div className="text-xs text-ink-400">
                  Content ID: {flag.contentId}
                </div>
              </div>

              {flag.status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-border flex gap-2">
                  <button
                    onClick={() => handleResolveFlag(flag.id)}
                    disabled={updatingFlagId === flag.id}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingFlagId === flag.id ? 'Processing...' : 'Resolve'}
                  </button>
                  <button
                    onClick={() => handleDismissFlag(flag.id)}
                    disabled={updatingFlagId === flag.id}
                    className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingFlagId === flag.id ? 'Processing...' : 'Dismiss'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
