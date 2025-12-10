/**
 * PositionForm Component
 *
 * Form for recording a member's position on a proposal
 * with stance selection and reasoning input
 */

'use client'

import { useState } from 'react'
import type { Position, PositionStance } from '@togetheros/types/governance'

export interface PositionFormProps {
  /** Proposal ID this position is for */
  proposalId: string

  /** Existing position to edit (if any) */
  existingPosition?: Position | null

  /** Callback when position is saved */
  onSave: (position: { stance: PositionStance; reasoning: string }) => Promise<void>

  /** Callback when form is cancelled */
  onCancel?: () => void

  /** Whether the form is in loading state */
  isLoading?: boolean

  /** Optional CSS class name */
  className?: string
}

const STANCE_OPTIONS: { value: PositionStance; label: string; description: string; color: string }[] = [
  {
    value: 'support',
    label: 'Support',
    description: 'I support this proposal and its implementation',
    color: 'bg-success-bg text-success border-success',
  },
  {
    value: 'oppose',
    label: 'Oppose',
    description: 'I disagree with this proposal and recommend rejection',
    color: 'bg-danger-bg text-danger border-danger',
  },
  {
    value: 'abstain',
    label: 'Abstain',
    description: 'I choose not to take a position on this proposal',
    color: 'bg-bg-2 text-ink-700 border-border',
  },
  {
    value: 'block',
    label: 'Block',
    description: 'I have strong objections that must be addressed before proceeding',
    color: 'bg-danger text-bg-1 border-danger',
  },
]

export function PositionForm({
  proposalId,
  existingPosition,
  onSave,
  onCancel,
  isLoading = false,
  className = '',
}: PositionFormProps) {
  const [stance, setStance] = useState<PositionStance | null>(
    existingPosition?.stance || null
  )
  const [reasoning, setReasoning] = useState(existingPosition?.reasoning || '')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!stance) {
      setError('Please select your position')
      return
    }

    if (reasoning.trim().length < 10) {
      setError('Please provide at least 10 characters of reasoning')
      return
    }

    try {
      await onSave({ stance, reasoning: reasoning.trim() })
    } catch (err: any) {
      setError(err.message || 'Failed to save position')
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-semibold text-ink-900 mb-3">
          Your Position
        </label>
        <div className="grid grid-cols-2 gap-2">
          {STANCE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setStance(option.value)}
              disabled={isLoading}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                stance === option.value
                  ? option.color
                  : 'bg-bg-1 border-border hover:border-ink-400'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className="block font-semibold text-sm">{option.label}</span>
              <span className="block text-xs mt-1 opacity-80">{option.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="reasoning"
          className="block text-sm font-semibold text-ink-900 mb-2"
        >
          Reasoning
          <span className="font-normal text-ink-400 ml-1">(required)</span>
        </label>
        <textarea
          id="reasoning"
          value={reasoning}
          onChange={(e) => setReasoning(e.target.value)}
          disabled={isLoading}
          placeholder="Explain your position and reasoning..."
          rows={4}
          className="w-full px-3 py-2 border border-border rounded-md bg-bg-1 text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
        />
        <p className="text-xs text-ink-400 mt-1">
          {reasoning.length}/10 characters minimum
        </p>
      </div>

      {error && (
        <div className="p-3 bg-danger-bg border border-danger/30 rounded-md text-danger text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading || !stance}
          className="flex-1 px-4 py-2 bg-brand-600 text-bg-1 rounded-md font-medium hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : existingPosition ? 'Update Position' : 'Submit Position'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-border rounded-md text-ink-700 hover:bg-bg-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {stance === 'block' && (
        <div className="p-3 bg-warning-bg border border-warning/30 rounded-md text-sm">
          <strong className="text-ink-900">Note:</strong>{' '}
          <span className="text-ink-700">
            A blocking position will be recorded in the minority report if the
            proposal is approved. Please ensure your objections are clearly stated.
          </span>
        </div>
      )}
    </form>
  )
}
