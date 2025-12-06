'use client'

*
 * Learning Hub - Browse all learning paths
 * Route: /learn
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LEARNING_PATH_CATEGORY_LABELS, type LearningPathCategory } from '@togetheros/types'

interface LearningPath {
  id: string
  slug: string
  title: string
  description?: string
  icon?: string
  category?: LearningPathCategory
  rpReward: number
  estimatedMinutes: number
  lessonCount: number
  completedLessonCount: number
  userProgress?: {
    status: 'started' | 'completed'
    lessonsCompleted: number
    startedAt: string
    completedAt?: string
    rpAwarded: number
  } | null
}

export default function LearnPage() {
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetch('/api/learning/paths')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPaths(data.data)
        } else {
          setError(data.error || 'Failed to load paths')
        }
      })
      .catch(() => setError('Failed to load paths'))
      .finally(() => setLoading(false))
  }, [])

  const categories = ['all', ...Object.keys(LEARNING_PATH_CATEGORY_LABELS)]

  const filteredPaths = selectedCategory === 'all'
    ? paths
    : paths.filter(p => p.category === selectedCategory)

  // Calculate overall progress
  const totalLessons = paths.reduce((sum, p) => sum + p.lessonCount, 0)
  const completedLessons = paths.reduce((sum, p) => sum + p.completedLessonCount, 0)
  const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-0">
        <div className="text-ink-700">Loading learning paths...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-0">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-0 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-ink-900 mb-2">
              Learn
            </h1>
            <p className="text-sm text-ink-700">
              Explore learning paths to understand how TogetherOS works
            </p>
          </div>
          <Link
            href="/learn/badges"
            className="flex items-center gap-2 px-4 py-2 bg-bg-1 border border-border rounded-lg text-sm text-ink-700 hover:bg-bg-0 transition-colors"
          >
            <span className="text-lg">🏆</span>
            <span>Badges</span>
          </Link>
        </div>

        {Overall Progress */}
        {totalLessons > 0 && (
          <div className="bg-bg-1 rounded-lg border border-border p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-ink-700">Overall Progress</span>
              <span className="text-sm text-ink-700">
                {completedLessons} / {totalLessons} lessons
              </span>
            </div>
            <div className="w-full bg-bg-2 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        )}

        {Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-bg-1 text-ink-700 border border-border hover:bg-bg-0'
              }`}
            >
              {cat === 'all' ? 'All Paths' : LEARNING_PATH_CATEGORY_LABELS[cat as LearningPathCategory]}
            </button>
          ))}
        </div>

        {Learning Paths */}
        <div className="space-y-4">
          {filteredPaths.length === 0 ? (
            <div className="text-center py-8 text-ink-400">
              No learning paths available yet.
            </div>
          ) : (
            filteredPaths.map(path => (
              <Link
                key={path.id}
                href={`/learn/${path.slug}`}
                className="block bg-bg-1 rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {Icon */}
                  <div className="text-3xl flex-shrink-0">
                    {path.icon || '📚'}
                  </div>

                  {Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-ink-900 truncate">
                        {path.title}
                      </h3>
                      {path.userProgress?.status === 'completed' && (
                        <span className="text-green-600 text-sm">✓ Complete</span>
                      )}
                    </div>

                    {path.description && (
                      <p className="text-sm text-ink-700 mb-2 line-clamp-2">
                        {path.description}
                      </p>
                    )}

                    {Meta info */}
                    <div className="flex items-center gap-4 text-xs text-ink-400">
                      <span>{path.lessonCount} lessons</span>
                      <span>~{path.estimatedMinutes} min</span>
                      <span className="text-green-600 font-medium">
                        +{path.rpReward} RP
                      </span>
                    </div>

                    {Progress bar */}
                    {path.lessonCount > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-ink-400 mb-1">
                          <span>Progress</span>
                          <span>
                            {path.completedLessonCount} / {path.lessonCount}
                          </span>
                        </div>
                        <div className="w-full bg-bg-2 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              path.completedLessonCount === path.lessonCount
                                ? 'bg-green-500'
                                : 'bg-blue-500'
                            }`}
                            style={{
                              width: `${(path.completedLessonCount / path.lessonCount) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {Arrow */}
                  <svg
                    className="w-5 h-5 text-ink-400 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
