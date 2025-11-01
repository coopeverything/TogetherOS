// packages/ui/src/feed/PostComposer.tsx
// Modal for creating native posts or importing social media content

'use client'

import { useState } from 'react'

export interface PostComposerProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreatePostData) => void | Promise<void>
  topics: string[]  // Available topic tags
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

export function PostComposer({ isOpen, onClose, onSubmit, topics: availableTopics }: PostComposerProps) {
  const [mode, setMode] = useState<'native' | 'import'>('native')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create Post</h2>
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
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('native')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'native'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✍️ Write Post
            </button>
            <button
              onClick={() => setMode('import')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'import'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🔗 Import from Social Media
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
