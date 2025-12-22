// packages/ui/src/feed/PostComposerUnified.tsx
// Unified modal for creating posts with auto-URL detection
// Single input accepts both text and social media URLs

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

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
  // Edit mode props
  editMode?: boolean
  editPostId?: string
  initialTitle?: string
  initialContent?: string
  initialTopics?: string[]
}

export interface CreatePostData {
  type: 'native'
  title?: string
  content: string
  topics: string[]
  groupId?: string
  // For edit mode
  postId?: string
  // Media attachments
  mediaUrls?: string[]
}

// Simple URL regex (matches http/https URLs)
const URL_REGEX = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/gi

function detectUrls(text: string): string[] {
  const matches = text.match(URL_REGEX)
  return matches || []
}

function detectSocialMedia(urls: string[]): boolean {
  return urls.some(url => {
    const lower = url.toLowerCase()
    return lower.includes('instagram.com') ||
           lower.includes('tiktok.com') ||
           lower.includes('twitter.com') ||
           lower.includes('x.com') ||
           lower.includes('facebook.com') ||
           lower.includes('youtube.com')
  })
}

export function PostComposerUnified({
  isOpen,
  onClose,
  onSubmit,
  topics: availableTopics,
  onSuggestTopics,
  editMode = false,
  editPostId,
  initialTitle = '',
  initialContent = '',
  initialTopics = [],
}: PostComposerProps) {
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)
  const [selectedTopics, setSelectedTopics] = useState<string[]>(initialTopics)
  const [suggestedTopics, setSuggestedTopics] = useState<TopicSuggestion[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [detectedUrls, setDetectedUrls] = useState<string[]>([])
  const [hasSocialMedia, setHasSocialMedia] = useState(false)
  // Media upload state
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Track whether modal was previously open to detect actual open event
  const wasOpenRef = useRef(false)

  // Reset form when modal opens (NOT on every props change while open)
  useEffect(() => {
    // Only reset when modal actually opens (transition from closed to open)
    if (isOpen && !wasOpenRef.current) {
      setTitle(initialTitle)
      setContent(initialContent)
      setSelectedTopics(initialTopics)
      setSuggestedTopics([])
      setMediaUrls([])
      setUploadError(null)
    }
    wasOpenRef.current = isOpen
  }, [isOpen, initialTitle, initialContent, initialTopics])

  // Real-time URL detection (debounced)
  useEffect(() => {
    if (!content) {
      setDetectedUrls([])
      setHasSocialMedia(false)
      return
    }

    const timer = setTimeout(() => {
      const urls = detectUrls(content)
      setDetectedUrls(urls)
      setHasSocialMedia(detectSocialMedia(urls))
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [content])

  // Handle file upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check if adding more files would exceed limit
    if (mediaUrls.length + files.length > 4) {
      setUploadError('Maximum 4 images allowed per post')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch('/api/feed/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Upload failed')
      }

      const data = await response.json()
      setMediaUrls(prev => [...prev, ...data.urls])

      if (data.errors && data.errors.length > 0) {
        setUploadError(data.errors.join(', '))
      }
    } catch (err) {
      console.error('Upload error:', err)
      setUploadError(err instanceof Error ? err.message : 'Failed to upload images')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Remove uploaded image
  const removeMedia = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index))
  }

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      alert('Content is required')
      return
    }

    // Validate title length if provided (backend requires min 10 chars)
    if (title.trim() && title.trim().length < 10) {
      alert('Title must be at least 10 characters if provided')
      return
    }

    // Topics are now optional - users can post without selecting any

    setIsSubmitting(true)

    try {
      await onSubmit({
        type: 'native',
        title: title.trim() || undefined,
        content: content.trim(),
        topics: selectedTopics,
        postId: editMode ? editPostId : undefined,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      })

      // Reset form
      setTitle('')
      setContent('')
      setSelectedTopics([])
      setSuggestedTopics([])
      setDetectedUrls([])
      setHasSocialMedia(false)
      setMediaUrls([])
      setUploadError(null)
      onClose()
    } catch (error) {
      console.error(editMode ? 'Failed to update post:' : 'Failed to create post:', error)
      alert(editMode ? 'Failed to update post. Please try again.' : 'Failed to create post. Please try again.')
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

    if (!content.trim()) {
      alert('Please add some content first')
      return
    }

    const suggestions = onSuggestTopics(content, title || undefined)
    setSuggestedTopics(suggestions)
  }

  const addSuggestedTopic = (topic: string) => {
    if (!selectedTopics.includes(topic) && selectedTopics.length < 5) {
      setSelectedTopics([...selectedTopics, topic])
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-bg-1 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="border-b border-border px-4 py-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink-900">
            {editMode ? 'Edit Post' : 'Create Post'}
          </h2>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-4 py-4 space-y-2">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-ink-700 mb-1">
                Title (optional, min 10 chars if provided)
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your post a title..."
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-1 text-ink-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                maxLength={200}
              />
              <p className={`text-xs mt-1 ${title.trim() && title.trim().length < 10 ? 'text-danger' : 'text-ink-400'}`}>
                {title.length}/200 characters {title.trim() && title.trim().length < 10 && '(min 10 required)'}
              </p>
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-ink-700 mb-1">
                Content <span className="text-danger">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, ideas, or questions...&#10;&#10;Links are optional! You can:&#10;• Write plain text (no link needed)&#10;• Include social media URLs for auto-previews&#10;• Mix text + URLs"
                className="w-full px-3 py-2 border border-border rounded-lg bg-bg-1 text-ink-900 placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                rows={10}
                maxLength={5000}
                required
              />
              <p className="text-xs text-ink-400 mt-1">
                {content.length}/5000 characters • Markdown supported • URLs auto-detected
              </p>
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                Images (optional, up to 4)
              </label>

              {/* Upload button */}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="media-upload"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || mediaUrls.length >= 4}
                  className="px-4 py-2 bg-bg-2 text-ink-700 rounded-lg font-medium hover:bg-bg-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    <>
                      📷 Add Images
                    </>
                  )}
                </button>
                <span className="text-xs text-ink-400">
                  {mediaUrls.length}/4 • Max 5MB each • JPEG, PNG, GIF, WebP
                </span>
              </div>

              {/* Upload error */}
              {uploadError && (
                <p className="text-xs text-danger mt-1">{uploadError}</p>
              )}

              {/* Image previews */}
              {mediaUrls.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {mediaUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="absolute top-1 right-1 bg-danger text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-80"
                        title="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* URL detection indicator */}
            {detectedUrls.length > 0 && (
              <div className={`rounded-lg p-3 ${hasSocialMedia ? 'bg-brand-50 border border-brand-200' : 'bg-bg-2 border border-border'}`}>
                <div className="flex items-start gap-2">
                  <span className="text-sm">{hasSocialMedia ? '✅' : 'ℹ️'}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${hasSocialMedia ? 'text-brand-700' : 'text-ink-700'}`}>
                      {hasSocialMedia ? `${detectedUrls.length} social media ${detectedUrls.length === 1 ? 'URL' : 'URLs'} detected` : `${detectedUrls.length} ${detectedUrls.length === 1 ? 'URL' : 'URLs'} detected`}
                    </p>
                    {hasSocialMedia && (
                      <p className="text-xs text-brand-600 mt-1">
                        We'll automatically fetch preview cards (thumbnail, title, description) when you submit.
                      </p>
                    )}
                    <ul className="mt-2 space-y-1">
                      {detectedUrls.map((url, idx) => (
                        <li key={idx} className="text-xs text-ink-400 truncate">
                          {url}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Bridge Topic Suggestions (Phase 3) */}
            {onSuggestTopics && (
              <div className="bg-bg-2 border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-ink-900">
                    🤖 AI Topic Suggestions
                  </h3>
                  <button
                    type="button"
                    onClick={handleGetSuggestions}
                    disabled={!content.trim()}
                    className="px-3 py-1 bg-brand-600 text-white text-xs rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Get Suggestions
                  </button>
                </div>

                {suggestedTopics.length > 0 ? (
                  <div className="space-y-2">
                    {suggestedTopics.map((suggestion) => (
                      <div
                        key={suggestion.topic}
                        className="flex items-center justify-between bg-bg-1 rounded p-2"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-ink-900">
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
                          <p className="text-xs text-ink-400 mt-1">{suggestion.reason}</p>
                        </div>
                        {!selectedTopics.includes(suggestion.topic) && selectedTopics.length < 5 && (
                          <button
                            type="button"
                            onClick={() => addSuggestedTopic(suggestion.topic)}
                            className="ml-2 px-3 py-1 bg-joy-600 text-white text-xs rounded-lg hover:bg-joy-700 transition-colors"
                          >
                            Add
                          </button>
                        )}
                        {selectedTopics.includes(suggestion.topic) && (
                          <span className="ml-2 text-xs text-brand-600 font-medium">✓ Added</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-ink-400">
                    Click "Get Suggestions" to let Bridge analyze your content and suggest relevant topics.
                  </p>
                )}
              </div>
            )}

            {/* Topic selection */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                Topics (optional, up to 5)
              </label>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {availableTopics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTopics.includes(topic)
                        ? 'bg-joy-600 text-white'
                        : 'bg-bg-2 text-ink-700 hover:bg-bg-3'
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2 text-ink-400">
                Selected: {selectedTopics.length}/5 • Topics help others discover your post
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-ink-700 hover:bg-bg-2 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-joy-600 text-white rounded-lg font-medium hover:bg-joy-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? (editMode ? 'Saving...' : 'Creating...')
                : (editMode ? 'Save Changes' : 'Create Post')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
