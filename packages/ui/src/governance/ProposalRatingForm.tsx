/**
 * Proposal Rating Form Component
 * Multi-dimensional quality rating interface
 */

import React, { useState, useEffect } from 'react'
import type {
  ProposalRating,
  ClarityRating,
  ConstructivenessRating,
} from '@togetheros/types/governance'

export interface ProposalRatingFormProps {
  proposalId: string
  currentRating: ProposalRating | null
  onSubmit: (rating: {
    clarity: ClarityRating
    importance: number
    urgency: number
    isInnovative: boolean
    constructiveness: ConstructivenessRating
    feedback?: string
  }) => Promise<void>
  disabled?: boolean
}

export function ProposalRatingForm({
  proposalId,
  currentRating,
  onSubmit,
  disabled = false,
}: ProposalRatingFormProps) {
  const [clarity, setClarity] = useState<ClarityRating>(currentRating?.clarity || 2)
  const [importance, setImportance] = useState(currentRating?.importance || 3)
  const [urgency, setUrgency] = useState(currentRating?.urgency || 3)
  const [isInnovative, setIsInnovative] = useState(currentRating?.isInnovative || false)
  const [constructiveness, setConstructiveness] = useState<ConstructivenessRating>(
    currentRating?.constructiveness || 3
  )
  const [feedback, setFeedback] = useState(currentRating?.feedback || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form when current rating changes
  useEffect(() => {
    if (currentRating) {
      setClarity(currentRating.clarity)
      setImportance(currentRating.importance)
      setUrgency(currentRating.urgency)
      setIsInnovative(currentRating.isInnovative)
      setConstructiveness(currentRating.constructiveness)
      setFeedback(currentRating.feedback || '')
    }
  }, [currentRating])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      await onSubmit({
        clarity,
        importance,
        urgency,
        isInnovative,
        constructiveness,
        feedback: feedback.trim() || undefined,
      })
    } catch (error) {
      console.error('Failed to submit rating:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <h4 className="text-xs font-medium text-ink-700">Rate this proposal</h4>

      {/* Compact inline ratings row */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 items-center text-[11px]">
        {/* Clarity */}
        <div className="flex items-center gap-1">
          <span className="text-ink-400">Clarity:</span>
          {[
            { value: 1 as ClarityRating, label: '?', color: 'bg-warning' },
            { value: 2 as ClarityRating, label: '~', color: 'bg-joy-500' },
            { value: 3 as ClarityRating, label: '✓', color: 'bg-success' },
          ].map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setClarity(o.value)}
              disabled={disabled || isSubmitting}
              className={`w-5 h-5 text-[10px] rounded text-bg-1 ${o.color} ${
                clarity === o.value ? 'ring-1 ring-brand-500' : 'opacity-60'
              } disabled:opacity-30`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Importance */}
        <div className="flex items-center gap-1">
          <span className="text-ink-400">Importance:</span>
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setImportance(v)}
              disabled={disabled || isSubmitting}
              className={`w-4 h-4 text-[9px] rounded ${
                importance >= v ? 'bg-info text-bg-1' : 'bg-bg-2 text-ink-400'
              } disabled:opacity-30`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Urgency */}
        <div className="flex items-center gap-1">
          <span className="text-ink-400">Urgency:</span>
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setUrgency(v)}
              disabled={disabled || isSubmitting}
              className={`w-4 h-4 text-[9px] rounded ${
                urgency >= v ? 'bg-joy-600 text-bg-1' : 'bg-bg-2 text-ink-400'
              } disabled:opacity-30`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Tone */}
        <div className="flex items-center gap-1">
          <span className="text-ink-400">Tone:</span>
          {[
            { value: 1 as ConstructivenessRating, label: '!', color: 'bg-danger' },
            { value: 2 as ConstructivenessRating, label: '~', color: 'bg-warning' },
            { value: 3 as ConstructivenessRating, label: '✓', color: 'bg-success' },
          ].map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setConstructiveness(o.value)}
              disabled={disabled || isSubmitting}
              className={`w-5 h-5 text-[10px] rounded text-bg-1 ${o.color} ${
                constructiveness === o.value ? 'ring-1 ring-brand-500' : 'opacity-60'
              } disabled:opacity-30`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Innovation checkbox */}
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={isInnovative}
            onChange={(e) => setIsInnovative(e.target.checked)}
            disabled={disabled || isSubmitting}
            className="w-3 h-3 text-joy-500 rounded disabled:opacity-30"
          />
          <span className="text-ink-400">💡 Innovative</span>
        </label>
      </div>

      {constructiveness === 1 && (
        <p className="text-[10px] text-danger">⚠️ Flags moderator review</p>
      )}

      {/* Feedback - collapsible */}
      <details className="text-[10px]">
        <summary className="text-ink-400 cursor-pointer hover:text-ink-700">+ Add feedback</summary>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          disabled={disabled || isSubmitting}
          placeholder="Feedback..."
          rows={2}
          maxLength={2000}
          className="mt-1 w-full px-1.5 py-1 text-[11px] border border-border bg-bg-1 text-ink-900 rounded resize-none disabled:opacity-30"
        />
      </details>

      {/* Submit */}
      <button
        type="submit"
        disabled={disabled || isSubmitting}
        className="px-2 py-0.5 bg-brand-600 text-bg-1 rounded text-[10px] font-medium hover:bg-brand-500 disabled:opacity-30"
      >
        {isSubmitting ? '...' : currentRating ? 'Update' : 'Rate'}
      </button>
    </form>
  )
}
