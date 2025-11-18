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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Moderation Queue
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Review flagged content and take appropriate action.
        </p>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          All
        </button>
      </div>

      {/* Flags List */}
      {flags.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'pending' ? 'No pending flags' : 'No flags found'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {flags.map((flag) => (
            <div
              key={flag.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    flag.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : flag.status === 'resolved'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {flag.status}
                  </span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    {flag.contentType}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(flag.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reason:</span>
                  <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">{flag.reason}</span>
                </div>
                {flag.details && (
                  <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Details:</span>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{flag.details}</p>
                  </div>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Content ID: {flag.contentId}
                </div>
              </div>

              {flag.status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                  <button className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                    Resolve
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                    Dismiss
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
