'use client'

/**
 * Lesson Page - View lesson content
 * Route: /learn/[pathSlug]/[lessonId]
 */

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface StructuredContent {
  format: 'structured'
  structured: {
    introduction: string
    keyPoints: string[]
    example?: string
    reflection?: string
    nextSteps?: string
  }
}

interface MarkdownContent {
  format: 'markdown'
  markdown: string
}

interface VideoContent {
  format: 'video'
  video: {
    url: string
    provider: 'youtube' | 'vimeo' | 'self-hosted'
    duration?: number
    transcript?: string
  }
}

type LessonContent = StructuredContent | MarkdownContent | VideoContent

interface Lesson {
  id: string
  pathId: string
  slug: string
  title: string
  description?: string
  contentType: 'markdown' | 'structured' | 'video'
  content: LessonContent
  durationMinutes: number
  rpReward: number
  pathSlug: string
  pathTitle: string
  quiz?: {
    id: string
    title: string
    rpReward: number
  }
  userProgress?: {
    status: 'started' | 'completed' | 'skipped'
    rpAwarded: number
  } | null
  previousLesson?: { id: string; title: string } | null
  nextLesson?: { id: string; title: string } | null
}

export default function LessonPage({ params }: { params: Promise<{ pathSlug: string; lessonId: string }> }) {
  const { pathSlug, lessonId } = use(params)
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [completionResult, setCompletionResult] = useState<{
    rpAwarded: number
    pathProgress?: { pathCompleted: boolean; pathRpAwarded: number }
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/learning/lessons/${lessonId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLesson(data.data)
        } else {
          setError(data.error || 'Failed to load lesson')
        }
      })
      .catch(() => setError('Failed to load lesson'))
      .finally(() => setLoading(false))
  }, [lessonId])

  const handleComplete = async () => {
    if (completing) return
    setCompleting(true)

    try {
      const res = await fetch(`/api/learning/lessons/${lessonId}/complete`, {
        method: 'POST',
      })
      const data = await res.json()

      if (data.success) {
        setCompletionResult(data.data)
        // Update local state
        if (lesson) {
          setLesson({
            ...lesson,
            userProgress: { status: 'completed', rpAwarded: data.data.rpAwarded },
          })
        }
      } else {
        setError(data.error || 'Failed to complete lesson')
      }
    } catch {
      setError('Failed to complete lesson')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Loading lesson...</div>
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Lesson not found'}</p>
          <button onClick={() => router.push('/learn')} className="text-blue-600 hover:underline">
            Back to Learning Hub
          </button>
        </div>
      </div>
    )
  }

  const isCompleted = lesson.userProgress?.status === 'completed'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-4">
          <Link href="/learn" className="hover:text-blue-600">Learn</Link>
          <span className="mx-2">/</span>
          <Link href={`/learn/${lesson.pathSlug}`} className="hover:text-blue-600">
            {lesson.pathTitle}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white">{lesson.title}</span>
        </nav>

        {/* Lesson Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{lesson.title}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-6">
            <span>{lesson.durationMinutes} min read</span>
            <span className="text-green-600">+{lesson.rpReward} RP</span>
            {isCompleted && (
              <span className="text-green-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Completed
              </span>
            )}
          </div>

          {/* Content Render */}
          <div className="prose prose-sm max-w-none">
            {lesson.contentType === 'structured' && (
              <StructuredContentView content={lesson.content as StructuredContent} />
            )}
            {lesson.contentType === 'markdown' && (
              <MarkdownContentView content={lesson.content as MarkdownContent} />
            )}
            {lesson.contentType === 'video' && (
              <VideoContentView content={lesson.content as VideoContent} />
            )}
          </div>
        </div>

        {/* Completion Result */}
        {completionResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Lesson Completed!
            </div>
            <p className="text-green-700 text-sm">
              You earned <strong>+{completionResult.rpAwarded} RP</strong>
              {completionResult.pathProgress?.pathCompleted && (
                <> and completed the path for an extra <strong>+{completionResult.pathProgress.pathRpAwarded} RP</strong>!</>
              )}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            {lesson.previousLesson && (
              <Link
                href={`/learn/${pathSlug}/${lesson.previousLesson.id}`}
                className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:text-blue-600 flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mark Complete Button */}
            {!isCompleted && (
              <button
                onClick={handleComplete}
                disabled={completing}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {completing ? 'Completing...' : 'Mark as Complete'}
              </button>
            )}

            {/* Quiz button */}
            {lesson.quiz && (
              <Link
                href={`/learn/quiz/${lesson.quiz.id}`}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Take Quiz (+{lesson.quiz.rpReward} RP)
              </Link>
            )}

            {/* Next lesson */}
            {lesson.nextLesson ? (
              <Link
                href={`/learn/${pathSlug}/${lesson.nextLesson.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                Next Lesson
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <Link
                href={`/learn/${pathSlug}`}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Path
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StructuredContentView({ content }: { content: StructuredContent }) {
  const { structured } = content

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{structured.introduction}</p>
      </div>

      {/* Key Points */}
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Key Points</h3>
        <ul className="space-y-2">
          {structured.keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span className="text-gray-700 dark:text-gray-300">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Example */}
      {structured.example && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
          <h4 className="font-medium text-blue-800 mb-2">Example</h4>
          <p className="text-blue-700">{structured.example}</p>
        </div>
      )}

      {/* Reflection */}
      {structured.reflection && (
        <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r">
          <h4 className="font-medium text-purple-800 mb-2">Reflection</h4>
          <p className="text-purple-700 italic">{structured.reflection}</p>
        </div>
      )}

      {/* Next Steps */}
      {structured.nextSteps && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r">
          <h4 className="font-medium text-green-800 mb-2">Next Steps</h4>
          <p className="text-green-700">{structured.nextSteps}</p>
        </div>
      )}
    </div>
  )
}

function VideoContentView({ content }: { content: VideoContent }) {
  const { video } = content

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
    return match ? match[1] : null
  }

  if (video.provider === 'youtube') {
    const videoId = getYouTubeId(video.url)
    if (videoId) {
      return (
        <div className="space-y-4">
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full h-full rounded-lg"
              allowFullScreen
            />
          </div>
          {video.transcript && (
            <details className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300">
                View Transcript
              </summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-500 whitespace-pre-wrap">{video.transcript}</p>
            </details>
          )}
        </div>
      )
    }
  }

  return (
    <div>
      <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
        Watch Video
      </a>
    </div>
  )
}

function MarkdownContentView({ content }: { content: MarkdownContent }) {
  // Simple markdown rendering without external dependency
  // Supports basic formatting: headers, bold, italic, lists, blockquotes
  const { markdown } = content

  const renderMarkdown = (text: string) => {
    // Split into lines for processing
    const lines = text.split('\n')
    const elements: JSX.Element[] = []
    let listItems: string[] = []
    let inList = false

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc pl-5 space-y-1 mb-4">
            {listItems.map((item, i) => (
              <li key={i}>{formatInline(item)}</li>
            ))}
          </ul>
        )
        listItems = []
        inList = false
      }
    }

    const formatInline = (text: string) => {
      // Handle bold, italic, and links
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">$1</code>')
    }

    lines.forEach((line, i) => {
      const trimmed = line.trim()

      // Headers
      if (trimmed.startsWith('### ')) {
        flushList()
        elements.push(
          <h3 key={i} className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-2">
            {trimmed.slice(4)}
          </h3>
        )
      } else if (trimmed.startsWith('## ')) {
        flushList()
        elements.push(
          <h2 key={i} className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3">
            {trimmed.slice(3)}
          </h2>
        )
      } else if (trimmed.startsWith('# ')) {
        flushList()
        elements.push(
          <h1 key={i} className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4">
            {trimmed.slice(2)}
          </h1>
        )
      }
      // Lists
      else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        inList = true
        listItems.push(trimmed.slice(2))
      } else if (trimmed.match(/^\d+\. /)) {
        inList = true
        listItems.push(trimmed.replace(/^\d+\. /, ''))
      }
      // Blockquotes
      else if (trimmed.startsWith('> ')) {
        flushList()
        elements.push(
          <blockquote key={i} className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 dark:text-gray-500 my-4">
            {formatInline(trimmed.slice(2))}
          </blockquote>
        )
      }
      // Empty lines
      else if (trimmed === '') {
        flushList()
      }
      // Regular paragraphs
      else {
        flushList()
        elements.push(
          <p
            key={i}
            className="text-gray-700 dark:text-gray-300 mb-3"
            dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
          />
        )
      }
    })

    flushList()
    return elements
  }

  return <div className="space-y-2">{renderMarkdown(markdown)}</div>
}
