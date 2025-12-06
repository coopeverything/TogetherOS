/**
 * Reaction Picker Component
 * Empathy-focused reactions for forum posts and replies
 */

'use client'

import { useState } from 'react'
import type { ReactionType } from '@togetheros/types/forum'
import { cn } from '../utils'

export interface ReactionPickerProps {
  /** Current user's reaction (if any) */
  userReaction?: ReactionType | null

  /** Reaction counts by type */
  reactionCounts?: Record<ReactionType, number>

  /** Callback when reaction is added/removed */
  onReact: (type: ReactionType | null) => void | Promise<void>

  /** Whether reactions are being submitted */
  isSubmitting?: boolean

  /** Optional CSS class name */
  className?: string
}

const REACTIONS: { type: ReactionType; emoji: string; label: string }[] = [
  { type: 'agree', emoji: '👍', label: 'Agree' },
  { type: 'disagree', emoji: '🤔', label: 'Disagree (thoughtfully)' },
  { type: 'insightful', emoji: '💡', label: 'Insightful' },
  { type: 'empathy', emoji: '🙏', label: 'Empathy' },
  { type: 'question', emoji: '❓', label: 'Question' },
  { type: 'concern', emoji: '⚠️', label: 'Concern' },
]

export function ReactionPicker({
  userReaction,
  reactionCounts = {} as Record<ReactionType, number>,
  onReact,
  isSubmitting = false,
  className = '',
}: ReactionPickerProps) {
  const [showPicker, setShowPicker] = useState(false)

  const handleReact = async (type: ReactionType) => {
    // Toggle off if clicking same reaction
    const newReaction = userReaction === type ? null : type
    await onReact(newReaction)
    setShowPicker(false)
  }

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Reaction Button */}
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker)}
        disabled={isSubmitting}
        className={cn(
          'px-3 py-1.5.5 text-base rounded-md transition-colors',
          'border border-gray-300 dark:border-gray-600 dark:border-gray-600',
          userReaction
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-500'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {userReaction ? (
          <span>
            {REACTIONS.find((r) => r.type === userReaction)?.emoji} {userReaction}
          </span>
        ) : (
          <span>+ React</span>
        )}
      </button>

      {/* Reaction Picker Dropdown */}
      {showPicker && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowPicker(false)}
          />

          {/* Picker */}
          <div className="absolute left-0 mt-2 z-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg p-2 min-w-[200px]">
            {REACTIONS.map(({ type, emoji, label }) => {
              const count = reactionCounts[type] || 0
              const isSelected = userReaction === type

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleReact(type)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 rounded-md text-base transition-colors',
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700 text-gray-900 dark:text-white dark:text-gray-100'
                  )}
                >
                  <span>
                    <span className="mr-2">{emoji}</span>
                    {label}
                  </span>
                  {count > 0 && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
