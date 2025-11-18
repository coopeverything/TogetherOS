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
          'w-full px-3 py-2 rounded-md border bg-white dark:bg-gray-900',
          'text-gray-900 dark:text-gray-100 placeholder:text-gray-400',
          'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'resize-vertical text-sm',
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        )}
        disabled={isSubmitting}
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {content.length} / 2000 characters
        </p>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md',
              'bg-blue-600 text-white hover:bg-blue-700',
              'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
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
