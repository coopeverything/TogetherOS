'use client'

/**
 * Learning Path Detail - View lessons in a path
 * Route: /learn/[pathSlug]
 */

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Lesson {
  id: string
  slug: string
  title: string
  description?: string
  contentType: 'markdown' | 'structured' | 'video'
  orderIndex: number
  durationMinutes: number
  rpReward: number
  quizId?: string
  userProgress?: {
    status: 'started' | 'completed' | 'skipped'
    startedAt: string
    completedAt?: string
    rpAwarded: number
  } | null
}

interface LearningPath {
  id: string
  slug: string
  title: string
  description?: string
  icon?: string
  rpReward: number
  estimatedMinutes: number
  lessons: Lesson[]
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

export default function PathDetailPage({ params }: { params: Promise<{ pathSlug: string }> }) {
  const { pathSlug } = use(params)
  const router = useRouter()
  const [path, setPath] = useState<LearningPath | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/learning/paths/${pathSlug}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPath(data.data)
        } else {
          setError(data.error || 'Failed to load path')
        }
      })
      .catch(() => setError('Failed to load path'))
      .finally(() => setLoading(false))
  }, [pathSlug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-0">
        <div className="text-ink-700">Loading...</div>
      </div>
    )
  }

  if (error || !path) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-0">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Path not found'}</p>
          <button
            onClick={() => router.push('/learn')}
            className="text-blue-600 hover:underline"
          >
            Back to Learning Hub
          </button>
        </div>
      </div>
    )
  }

  const progress = path.lessonCount > 0
    ? Math.round((path.completedLessonCount / path.lessonCount) * 100)
    : 0

  // Find next incomplete lesson
  const nextLesson = path.lessons.find(
    l => l.userProgress?.status !== 'completed'
  )

  return (
    <div className="min-h-screen bg-bg-0 py-4 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-ink-700 mb-4">
          <Link href="/learn" className="hover:text-blue-600">
            Learn
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink-900">{path.title}</span>
        </nav>

        {/* Header */}
        <div className="bg-bg-1 rounded-lg border border-border p-4 mb-3">
          <div className="flex items-start gap-4">
            <div className="text-sm">{path.icon || '📚'}</div>
            <div className="flex-1">
              <h1 className="text-sm font-semibold text-ink-900 mb-2">
                {path.title}
              </h1>
              {path.description && (
                <p className="text-ink-700 mb-4">{path.description}</p>
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-ink-400 mb-4">
                <span>{path.lessonCount} lessons</span>
                <span>~{path.estimatedMinutes} min</span>
                <span className="text-green-600 font-medium">+{path.rpReward} RP</span>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-ink-700">Progress</span>
                  <span className="text-ink-900 font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-bg-2 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Continue/Start button */}
              {nextLesson ? (
                <Link
                  href={`/learn/${path.slug}/${nextLesson.id}`}
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {path.completedLessonCount > 0 ? 'Continue Learning' : 'Start Learning'}
                </Link>
              ) : (
                <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                  Path Completed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <div className="bg-bg-1 rounded-lg border border-border">
          <div className="px-4 py-2 border-b border-border">
            <h2 className="font-medium text-ink-900">Lessons</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {path.lessons.map((lesson, index) => {
              const isCompleted = lesson.userProgress?.status === 'completed'
              const isNext = nextLesson?.id === lesson.id

              return (
                <Link
                  key={lesson.id}
                  href={`/learn/${path.slug}/${lesson.id}`}
                  className={`flex items-center gap-4 p-4 hover:bg-bg-0 transition-colors ${
                    isNext ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* Number/Status */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted
                        ? 'bg-green-100 text-green-600'
                        : isNext
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-bg-2 text-ink-700'
                    }`}
                  >
                    {isCompleted ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-ink-900 truncate">{lesson.title}</h3>
                      {lesson.quizId && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                          Quiz
                        </span>
                      )}
                    </div>
                    {lesson.description && (
                      <p className="text-sm text-ink-400 truncate">{lesson.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-ink-400 mt-1">
                      <span>{lesson.durationMinutes} min</span>
                      <span className="text-green-600">+{lesson.rpReward} RP</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg className="w-5 h-5 text-ink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
