'use client'

/**
 * Learning Badges Page - View earned and available badges
 * Route: /learn/badges
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface BadgeProgress {
  current: number
  threshold: number
  percentage: number
}

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: string
  earnedAt?: string
  progress?: BadgeProgress
}

interface BadgesData {
  badges: Badge[]
  summary: {
    earned: number
    total: number
    percentage: number
  }
}

export default function LearningBadgesPage() {
  const [data, setData] = useState<BadgesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'earned' | 'in-progress'>('all')

  useEffect(() => {
    fetch('/api/learning/badges')
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          setData(response.data)
        } else {
          setError(response.error || 'Failed to load badges')
        }
      })
      .catch(() => setError('Failed to load badges'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Loading badges...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load badges'}</p>
          <Link href="/learn" className="text-blue-600 hover:underline">
            Back to Learning Hub
          </Link>
        </div>
      </div>
    )
  }

  const filteredBadges = data.badges.filter(badge => {
    if (filter === 'earned') return !!badge.earnedAt
    if (filter === 'in-progress') return !badge.earnedAt
    return true
  })

  const categoryLabels: Record<string, string> = {
    milestone: 'Milestones',
    contribution: 'Achievements',
    special: 'Special',
  }

  // Group badges by category
  const groupedBadges = filteredBadges.reduce((acc, badge) => {
    const category = badge.category
    if (!acc[category]) acc[category] = []
    acc[category].push(badge)
    return acc
  }, {} as Record<string, Badge[]>)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">
          <Link href="/learn" className="hover:text-blue-600">Learn</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white">Badges</span>
        </nav>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Learning Badges
              </h1>
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                Track your learning achievements and unlock new badges
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {data.summary.earned}/{data.summary.total}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">badges earned</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Collection Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">{data.summary.percentage}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${data.summary.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {(['all', 'earned', 'in-progress'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'All Badges' : f === 'earned' ? 'Earned' : 'In Progress'}
            </button>
          ))}
        </div>

        {/* Badges by Category */}
        {Object.entries(groupedBadges).map(([category, badges]) => (
          <div key={category} className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              {categoryLabels[category] || category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map(badge => (
                <div
                  key={badge.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg border p-4 ${
                    badge.earnedAt
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`text-3xl ${
                        badge.earnedAt ? '' : 'grayscale opacity-50'
                      }`}
                    >
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">{badge.name}</h3>
                        {badge.earnedAt && (
                          <span className="text-green-600 text-sm">✓</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-1">{badge.description}</p>

                      {/* Progress or earned date */}
                      {badge.earnedAt ? (
                        <p className="text-xs text-green-600 mt-2">
                          Earned {new Date(badge.earnedAt).toLocaleDateString()}
                        </p>
                      ) : badge.progress ? (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>
                              {badge.progress.current}/{badge.progress.threshold}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${badge.progress.percentage}%` }}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredBadges.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 dark:text-gray-500">
            No badges found for this filter.
          </div>
        )}

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            href="/learn"
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Learning Hub
          </Link>
        </div>
      </div>
    </div>
  )
}
