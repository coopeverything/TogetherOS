'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

// Cooperation paths for categorization
const COOPERATION_PATHS = [
  'Collaborative Education',
  'Social Economy',
  'Common Wellbeing',
  'Cooperative Technology',
  'Collective Governance',
  'Community Connection',
  'Collaborative Media & Culture',
  'Common Planet',
]

// Tag suggestions
const TAG_SUGGESTIONS = [
  'governance',
  'coordination',
  'philosophy',
  'mental-flexibility',
  'support-points',
  'economics',
  'anti-plutocracy',
  'practice',
  'personal-development',
  'cooperation',
  'hierarchy',
  'consensus',
  'deliberation',
  'language',
  'community',
  'education',
  'technology',
  'wellbeing',
]

export default function NewArticlePage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [cooperationPaths, setCooperationPaths] = useState<string[]>([])

  // UI state
  const [showPreview, setShowPreview] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Check auth status
  useEffect(() => {
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setIsLoggedIn(true)
          setCurrentUser({ id: data.user.id, name: data.user.display_name || data.user.username })
        } else {
          setIsLoggedIn(false)
        }
      })
      .catch(() => setIsLoggedIn(false))
  }, [])

  // Calculate reading time
  const wordCount = content.split(/\s+/).filter(Boolean).length
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200))

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    } else if (title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters'
    } else if (title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters'
    }

    if (!summary.trim()) {
      newErrors.summary = 'Summary is required'
    } else if (summary.length < 20) {
      newErrors.summary = 'Summary must be at least 20 characters'
    } else if (summary.length > 500) {
      newErrors.summary = 'Summary cannot exceed 500 characters'
    }

    if (!content.trim()) {
      newErrors.content = 'Article content is required'
    } else if (content.length < 100) {
      newErrors.content = 'Article must be at least 100 characters'
    }

    if (tags.length === 0) {
      newErrors.tags = 'At least one tag is required'
    } else if (tags.length > 5) {
      newErrors.tags = 'Maximum 5 tags allowed'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle tag input
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove))
  }

  // Toggle cooperation path
  const togglePath = (path: string) => {
    if (cooperationPaths.includes(path)) {
      setCooperationPaths(cooperationPaths.filter((p) => p !== path))
    } else {
      setCooperationPaths([...cooperationPaths, path])
    }
  }

  // Submit article
  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!validate()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          summary: summary.trim(),
          content: content.trim(),
          tags,
          cooperationPaths,
          status,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to create article')
      }

      const data = await response.json()

      if (status === 'published' && data.article?.slug) {
        router.push(`/articles/${data.article.slug}`)
      } else {
        router.push('/articles')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create article'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    )
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Sign in to write an article
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in to share your perspective with the community.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <nav className="mb-4">
            <Link
              href="/articles"
              className="text-sm text-gray-500 hover:text-orange-600 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Articles
            </Link>
          </nav>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-white text-2xl">
              ✍️
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Write an Article</h1>
              <p className="text-gray-600">Share your perspective with the community</p>
            </div>
          </div>

          {/* Author preview */}
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white text-sm font-medium">
              {currentUser?.name.charAt(0) || '?'}
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Writing as </span>
              <span className="font-medium text-gray-900">{currentUser?.name}</span>
            </div>
          </div>
        </header>

        {/* Error message */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {submitError}
          </div>
        )}

        {/* Editor / Preview Toggle */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-gray-100 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !showPreview
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              showPreview
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Preview
          </button>
        </div>

        {showPreview ? (
          /* Preview Mode */
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="text-sm text-orange-600 uppercase tracking-wide font-medium mb-2">
              Expert Opinion
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {title || 'Your title here...'}
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              {summary || 'Your summary here...'}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
              <span>{readTimeMinutes} min read</span>
              <span>{wordCount} words</span>
            </div>
            <div className="prose prose-lg max-w-none">
              {content ? (
                <ReactMarkdown>{content}</ReactMarkdown>
              ) : (
                <p className="text-gray-400 italic">Your content here...</p>
              )}
            </div>
            {tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Edit Mode */
          <form className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="A compelling title for your article"
                className={`w-full px-4 py-3 rounded-lg border bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-200'
                }`}
                disabled={isSubmitting}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              <p className="mt-1 text-xs text-gray-500">{title.length} / 200 characters</p>
            </div>

            {/* Summary */}
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-900 mb-2">
                Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="A brief description that will appear in article listings"
                rows={3}
                className={`w-full px-4 py-3 rounded-lg border bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical ${
                  errors.summary ? 'border-red-500' : 'border-gray-200'
                }`}
                disabled={isSubmitting}
              />
              {errors.summary && <p className="mt-1 text-sm text-red-600">{errors.summary}</p>}
              <p className="mt-1 text-xs text-gray-500">{summary.length} / 500 characters</p>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-900 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <div className="text-xs text-gray-500 mb-2">Supports Markdown formatting</div>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article here... Use Markdown for formatting (# Heading, **bold**, *italic*, - lists)"
                rows={15}
                className={`w-full px-4 py-3 rounded-lg border bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical font-mono text-sm ${
                  errors.content ? 'border-red-500' : 'border-gray-200'
                }`}
                disabled={isSubmitting}
              />
              {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
              <p className="mt-1 text-xs text-gray-500">
                {wordCount} words · ~{readTimeMinutes} min read
              </p>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-900 mb-2">
                Tags <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-orange-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  id="tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Type a tag and press Enter"
                  className={`flex-1 px-4 py-2 rounded-lg border bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    errors.tags ? 'border-red-500' : 'border-gray-200'
                  }`}
                  disabled={isSubmitting || tags.length >= 5}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!tagInput.trim() || tags.length >= 5}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              {errors.tags && <p className="mt-1 text-sm text-red-600">{errors.tags}</p>}

              {/* Tag suggestions */}
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-xs text-gray-500 mr-2">Suggestions:</span>
                {TAG_SUGGESTIONS.filter((t) => !tags.includes(t))
                  .slice(0, 8)
                  .map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (tags.length < 5) {
                          setTags([...tags, tag])
                        }
                      }}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200"
                    >
                      + {tag}
                    </button>
                  ))}
              </div>
            </div>

            {/* Cooperation Paths */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Cooperation Paths (optional)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Select paths that relate to your article's topic
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {COOPERATION_PATHS.map((path) => (
                  <button
                    key={path}
                    type="button"
                    onClick={() => togglePath(path)}
                    className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                      cooperationPaths.includes(path)
                        ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {path}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <Link
                href="/articles"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Cancel
              </Link>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleSubmit('draft')}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit('published')}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium disabled:opacity-50"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Article'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Help Text */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
          <h4 className="font-medium text-gray-900 mb-2">Writing Tips</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Use clear, descriptive titles that capture your main argument</li>
            <li>Structure your article with headings (## Heading) for readability</li>
            <li>Support your points with examples and reasoning</li>
            <li>Consider how your ideas relate to cooperation and community</li>
            <li>Your article represents your perspective—own it!</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
