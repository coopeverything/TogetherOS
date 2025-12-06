/**
 * Flag Modal Component
 * Modal for flagging inappropriate content in the forum
 */

'use client'

import { useState } from 'react'
import { cn } from '../utils'

export interface FlagModalProps {
  /** Whether modal is open */
  isOpen: boolean

  /** Close callback */
  onClose: () => void

  /** Submit callback */
  onSubmit: (reason: string, details?: string) => void | Promise<void>

  /** Whether form is submitting */
  isSubmitting?: boolean

  /** Type of content being flagged */
  contentType: 'topic' | 'post' | 'reply'
}

const FLAG_REASONS = [
  { value: 'spam', label: 'Spam or advertising' },
  { value: 'harassment', label: 'Harassment or hate speech' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'off-topic', label: 'Off-topic or irrelevant' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'other', label: 'Other (please explain)' },
]

export function FlagModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  contentType,
}: FlagModalProps) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) return

    await onSubmit(reason, details.trim() || undefined)
    setReason('')
    setDetails('')
  }

  const handleCancel = () => {
    setReason('')
    setDetails('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white dark:text-gray-100">
            Flag {contentType}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Help us maintain a respectful community by reporting concerning content.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {/* Reason */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-900 dark:text-white dark:text-gray-100 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-600 bg-white dark:bg-gray-800 dark:bg-gray-900 text-gray-900 dark:text-white dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
              required
            >
              <option value="">Select a reason...</option>
              {FLAG_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Details */}
          <div>
            <label htmlFor="details" className="block text-sm font-medium text-gray-900 dark:text-white dark:text-gray-100 mb-2">
              Additional details (optional)
            </label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any additional context..."
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:border-gray-600 bg-white dark:bg-gray-800 dark:bg-gray-900 text-gray-900 dark:text-white dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              {details.length} / 500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-white dark:hover:text-gray-100 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md',
                'bg-red-600 text-white hover:bg-red-700',
                'focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors'
              )}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Flag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
