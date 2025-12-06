// packages/ui/src/feed/PostComposer.tsx
// Modal for creating native posts or importing social media content
// Phase 3: Includes Bridge topic suggestions

'use client'

import { useState } from 'react'

export interface TopicSuggestion {
  topic: string
  confidence: number
  reason: string
}

export interface PostComposerProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreatePostData) => void | Promise<void>
  topics: string[]  // Available topic tags
  onSuggestTopics?: (content: string, title?: string) => TopicSuggestion[]  // Bridge topic suggestion callback
}

export interface CreatePostData {
  type: 'native' | 'import'
  // Native post fields
  title?: string
  content?: string
  // Import fields
  sourceUrl?: string
  // Shared
  topics: string[]
  groupId?: string
}

export function PostComposer({ isOpen, onClose, onSubmit, topics: availableTopics, onSuggestTopics }: PostComposerProps) {
  const [mode, setMode] = useState<'native' | 'import'>('native')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [suggestedTopics, setSuggestedTopics] = useState<TopicSuggestion[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === 'native' && !content) {
      alert('Content is required')
      return
    }

    if (mode === 'import' && !sourceUrl) {
      alert('Source URL is required')
      return
    }

    if (selectedTopics.length === 0) {
      alert('Please select at least one topic')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        type: mode,
        title: mode === 'native' ? title : undefined,
        content: mode === 'native' ? content : undefined,
        sourceUrl: mode === 'import' ? sourceUrl : undefined,
        topics: selectedTopics,
      })

      // Reset form
      setTitle('')
      setContent('')
      setSourceUrl('')
      setSelectedTopics([])
      setSuggestedTopics([])
      onClose()
    } catch (error) {
      console.error('Failed to create post:', error)
      alert('Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topic))
    } else if (selectedTopics.length < 5) {
      setSelectedTopics([...selectedTopics, topic])
    } else {
      alert('Maximum 5 topics allowed')
    }
  }

  const handleGetSuggestions = () => {
    if (!onSuggestTopics) {
      alert('Topic suggestions not available')
      return
    }

    const textToAnalyze = mode === 'native' ? content : sourceUrl
    if (!textToAnalyze) {
      alert('Please add some content first')
      return
    }

    const suggestions = onSuggestTopics(textToAnalyze, mode === 'native' ? title : undefined)
    setSuggestedTopics(suggestions)
  }

  const addSuggestedTopic = (topic: string) => {
    if (!selectedTopics.includes(topic) && selectedTopics.length < 5) {
      setSelectedTopics([...selectedTopics, topic])
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Create Post</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode switcher */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('native')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'native'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✍️ Write Post
            </button>
            <button
              onClick={() => setMode('import')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'import'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔗 Import from Social Media
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-4 py-4 space-y-2">
            {mode === 'native' ? (
              <>
                {/* Native post fields */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your post a title..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {title.length}/200 characters
                  </p>
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your thoughts... (Markdown supported)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    rows={8}
                    maxLength={5000}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {content.length}/5000 characters • Markdown supported
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Import fields */}
                <div>
                  <label htmlFor="sourceUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    Social Media URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    id="sourceUrl"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://instagram.com/p/... or https://x.com/..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supports: Instagram, TikTok, X/Twitter, Facebook
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> We'll fetch preview data (title, description, thumbnail) from the URL.
                    In Phase 1, this uses mock data. Real oEmbed/Open Graph fetching coming in Phase 3.
                  </p>
                </div>
              </>
            )}

            {/* Bridge Topic Suggestions (Phase 3) */}
            {onSuggestTopics && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    🤖 AI Topic Suggestions
                  </h3>
                  <button
                    type="button"
                    onClick={handleGetSuggestions}
                    disabled={!content && !sourceUrl}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Get Suggestions
                  </button>
                </div>

                {suggestedTopics.length > 0 ? (
                  <div className="space-y-2">
                    {suggestedTopics.map((suggestion) => (
                      <div
                        key={suggestion.topic}
                        className="flex items-center justify-between bg-white dark:bg-gray-800 rounded p-2"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-gray-900 dark:text-white">
                              {suggestion.topic}
                            </span>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: suggestion.confidence > 0.7
                                  ? '#dcfce7'
                                  : suggestion.confidence > 0.4
                                    ? '#fef3c7'
                                    : '#fee2e2',
                                color: suggestion.confidence > 0.7
                                  ? '#166534'
                                  : suggestion.confidence > 0.4
                                    ? '#92400e'
                                    : '#991b1b',
                              }}
                            >
                              {Math.round(suggestion.confidence * 100)}% match
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{suggestion.reason}</p>
                        </div>
                        {!selectedTopics.includes(suggestion.topic) && selectedTopics.length < 5 && (
                          <button
                            type="button"
                            onClick={() => addSuggestedTopic(suggestion.topic)}
                            className="ml-2 px-3 py-1 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 transition-colors"
                          >
                            Add
                          </button>
                        )}
                        {selectedTopics.includes(suggestion.topic) && (
                          <span className="ml-2 text-xs text-green-600 font-medium">✓ Added</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-600">
                    Click "Get Suggestions" to let Bridge analyze your content and suggest relevant topics.
                  </p>
                )}
              </div>
            )}

            {/* Topic selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topics <span className="text-red-500">*</span> (1-5)
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTopics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTopics.includes(topic)
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected: {selectedTopics.length}/5
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
