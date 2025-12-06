/**
 * TopicComposer Component
 *
 * Modal form for creating new forum topics
 */

'use client'

import { useState, useEffect } from 'react'
import type { TopicCategory } from '@togetheros/types/forum'
import { TagInput } from '../profiles/TagInput'
import { cn } from '../utils'

export interface TopicComposerProps {
  /** Whether modal is open */
  isOpen: boolean

  /** Close callback */
  onClose: () => void

  /** Submit callback */
  onSubmit: (data: CreateTopicData) => void | Promise<void>

  /** Whether form is submitting */
  isSubmitting?: boolean

  /** Optional initial title (for pre-filling from wiki/articles) */
  initialTitle?: string

  /** Optional initial description */
  initialDescription?: string

  /** Optional CSS class name */
  className?: string
}

export interface CreateTopicData {
  title: string
  description?: string
  category: TopicCategory
  tags: string[]
}

// All keywords from TogetherOS_CATEGORIES_AND_KEYWORDS
const TAG_SUGGESTIONS = [
  // Collaborative Education
  'learning', 'curriculum', 'tutorials', 'workshops', 'certification', 'docs',
  'open-edu', 'mentorship', 'research-notes',
  // Social Economy
  'timebank', 'mutual-aid', 'microgrants', 'crowdfund', 'cooperative-finance',
  'wallets', 'Social-Horizon', 'credits',
  // Common Wellbeing
  'health', 'nutrition', 'movement', 'care-teams', 'accessibility',
  'mental-health', 'support-groups',
  // Cooperative Technology
  'open-source', 'privacy', 'self-host', 'dev-containers', 'CI/CD', 'infra',
  'maps', 'identity', 'moderation-tools',
  // Collective Governance
  'proposals', 'voting', 'consensus', 'facilitation', 'moderation',
  'restorative', 'metrics', 'support-points',
  // Community Connection
  'groups', 'events', 'meetups', 'chapters', 'city-hubs', 'geo-map', 'directories',
  // Collaborative Media & Culture
  'storytelling', 'film', 'music', 'writing', 'archives', 'media-library',
  'licensing', 'remix',
  // Common Planet
  'regeneration', 'circularity', 'materials', 'food-forest', 'permaculture',
  'repair-cafe', 'climate',
]

const CATEGORY_OPTIONS: { value: TopicCategory; label: string; description: string }[] = [
  {
    value: 'general',
    label: 'General Discussion',
    description: 'Open discussion, best practices, community wisdom'
  },
  {
    value: 'question',
    label: 'Question',
    description: 'Ask questions, share expertise, build knowledge base'
  },
  {
    value: 'proposal',
    label: 'Proposal Idea',
    description: 'Test ideas, gather feedback before formal proposals'
  },
  {
    value: 'deliberation',
    label: 'Deliberation',
    description: 'Structured consensus-building for serious discussions'
  },
  {
    value: 'announcement',
    label: 'Announcement',
    description: 'Important updates, news, event notices'
  },
]

export function TopicComposer({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  initialTitle = '',
  initialDescription = '',
  className = '',
}: TopicComposerProps) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [category, setCategory] = useState<TopicCategory>('general')
  const [tags, setTags] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update state when initial values change (e.g., from URL params)
  useEffect(() => {
    if (initialTitle) setTitle(initialTitle)
    if (initialDescription) setDescription(initialDescription)
  }, [initialTitle, initialDescription])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    } else if (title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    } else if (title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters'
    }

    if (description && description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    } else if (description && description.length > 2000) {
      newErrors.description = 'Description cannot exceed 2000 characters'
    }

    if (tags.length === 0) {
      newErrors.tags = 'At least one tag is required'
    } else if (tags.length > 5) {
      newErrors.tags = 'Maximum 5 tags allowed'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      tags,
    })

    // Reset form on successful submit
    setTitle('')
    setDescription('')
    setCategory('general')
    setTags([])
    setErrors({})
    setShowPreview(false)
  }

  const handleCancel = () => {
    setTitle('')
    setDescription('')
    setCategory('general')
    setTags([])
    setErrors({})
    setShowPreview(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={cn(
        'relative bg-bg-1 rounded-lg shadow-xl',
        'w-full max-w-2xl max-h-[90vh] overflow-y-auto',
        'mx-4',
        className
      )}>
        {/* Header */}
        <div className="sticky top-0 bg-bg-1 border-b border-border px-4 py-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-900">
            Create New Topic
          </h2>
          <button
            onClick={handleCancel}
            className="text-ink-400 hover:text-ink-700 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-4 py-6 space-y-2">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-ink-900 mb-2">
              Title <span className="text-danger">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's this discussion about?"
              className={cn(
                'w-full px-3 py-2 rounded-md border bg-bg-1',
                'text-ink-900 placeholder:text-ink-400',
                'focus:ring-2 focus:ring-brand-500 focus:border-transparent',
                errors.title ? 'border-danger' : 'border-border'
              )}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-danger">{errors.title}</p>
            )}
            <p className="mt-1 text-xs text-ink-400">
              {title.length} / 200 characters
            </p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-ink-900 mb-2">
              Category <span className="text-danger">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TopicCategory)}
              className="w-full px-3 py-2 rounded-md border border-border bg-bg-1 text-ink-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} — {option.description}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="description" className="block text-sm font-medium text-ink-900">
                Description (optional)
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-xs text-brand-600 hover:underline"
                disabled={isSubmitting}
              >
                {showPreview ? 'Edit' : 'Preview'}
              </button>
            </div>

            {showPreview ? (
              <div className="w-full min-h-[120px] px-3 py-2 rounded-md border border-border bg-bg-2">
                {description ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {/* Simple markdown rendering - just line breaks for now */}
                    {description.split('\n').map((line, i) => (
                      <p key={i} className="text-ink-900">
                        {line || '\u00A0'}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-ink-400 italic">Nothing to preview yet...</p>
                )}
              </div>
            ) : (
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more context or details about this topic (supports Markdown)"
                rows={5}
                className={cn(
                  'w-full px-3 py-2 rounded-md border bg-bg-1',
                  'text-ink-900 placeholder:text-ink-400',
                  'focus:ring-2 focus:ring-brand-500 focus:border-transparent',
                  'resize-vertical',
                  errors.description ? 'border-danger' : 'border-border'
                )}
                disabled={isSubmitting}
              />
            )}

            {errors.description && (
              <p className="mt-1 text-sm text-danger">{errors.description}</p>
            )}
            {description && (
              <p className="mt-1 text-xs text-ink-400">
                {description.length} / 2000 characters
              </p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-ink-900 mb-2">
              Tags <span className="text-danger">*</span>
            </label>
            <TagInput
              value={tags}
              onChange={setTags}
              suggestions={TAG_SUGGESTIONS}
              maxTags={5}
              placeholder="Start typing (suggestions will appear)..."
            />
            {errors.tags && (
              <p className="mt-1 text-sm text-danger">{errors.tags}</p>
            )}
            <p className="mt-1 text-xs text-ink-400">
              💡 Type and press <kbd className="px-1.5 py-0.5 bg-bg-2 rounded border border-border text-xs font-mono">Enter</kbd> to add tags. Choose from suggestions or create your own (e.g., mutual-aid, open-source, governance).
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-ink-700 hover:text-ink-900 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md',
                'bg-brand-600 text-white hover:bg-brand-700',
                'focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              {isSubmitting ? 'Creating...' : 'Create Topic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
