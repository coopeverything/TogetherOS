/**
 * Reply Composer Component
 * Inline form for creating replies to forum posts
 */

'use client'

import { useState } from 'react'
import { cn } from '../utils'

export interface ReplyComposerProps {
  /** Post ID to reply to */
  postId: string

  /** Submit callback */
  onSubmit: (content: string) => void | Promise<void>

  /** Whether form is submitting */
  isSubmitting?: boolean

  /** Optional CSS class name */
  className?: string

  /** Cancel callback */
  onCancel?: () => void
}

export function ReplyComposer({
  postId,
  onSubmit,
  isSubmitting = false,
  className = '',
  onCancel,
}: ReplyComposerProps) {
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  const validate = (): boolean => {
    if (!content.trim()) {
      setError('Reply cannot be empty')
      return false
    }
    if (content.length < 3) {
      setError('Reply must be at least 3 characters')
      return false
    }
    if (content.length > 2000) {
      setError('Reply cannot exceed 2000 characters')
      return false
    }
    setError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      await onSubmit(content.trim())
      setContent('')
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to submit reply')
    }
  }

  const handleCancel = () => {
    setContent('')
    setError(null)
    onCancel?.()
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-3', className)}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your reply..."
        rows={3}
        className={cn(
          'w-full px-3 py-2 rounded-md border bg-bg-1',
          'text-ink-900 placeholder:text-ink-400',
          'focus:ring-2 focus:ring-brand-500 focus:border-transparent',
          'resize-vertical text-base',
          error ? 'border-danger' : 'border-border'
        )}
        disabled={isSubmitting}
      />

      {error && (
        <p className="text-base text-danger">{error}</p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-400">
          {content.length} / 2000 characters
        </p>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5.5 text-base font-medium text-ink-700 hover:text-ink-900 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className={cn(
              'px-3 py-1.5.5 text-base font-medium rounded-md',
              'bg-brand-600 text-white hover:bg-brand-700',
              'focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            {isSubmitting ? 'Replying...' : 'Reply'}
          </button>
        </div>
      </div>
    </form>
  )
}
