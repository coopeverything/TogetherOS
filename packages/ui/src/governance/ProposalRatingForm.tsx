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
  /** Compact vertical layout for sidebar embedding */
  compact?: boolean
}

export function ProposalRatingForm({
  proposalId,
  currentRating,
  onSubmit,
  disabled = false,
  compact = false,
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

  // Reordered: Importance → Urgency → Clarity → Innovative → Tone
  return (
    <form onSubmit={handleSubmit} className={compact ? 'space-y-3' : 'space-y-2'}>
      {/* Ratings - vertical in compact mode, horizontal otherwise */}
      <div className={compact ? 'space-y-3' : 'flex flex-wrap gap-x-4 gap-y-1.5 items-center text-[11px]'}>
        {/* Importance */}
        <div className={compact ? 'space-y-1' : 'flex items-center gap-1'}>
          <span className={`text-ink-700 ${compact ? 'text-xs font-medium block' : 'text-ink-400 text-[11px]'}`}>
            Importance
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setImportance(v)}
                disabled={disabled || isSubmitting}
                className={`${compact ? 'w-6 h-6 text-xs' : 'w-4 h-4 text-[9px]'} rounded ${
                  importance >= v ? 'bg-info text-bg-1' : 'bg-bg-2 text-ink-400'
                } disabled:opacity-30 transition-colors`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Urgency */}
        <div className={compact ? 'space-y-1' : 'flex items-center gap-1'}>
          <span className={`text-ink-700 ${compact ? 'text-xs font-medium block' : 'text-ink-400 text-[11px]'}`}>
            Urgency
          </span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setUrgency(v)}
                disabled={disabled || isSubmitting}
                className={`${compact ? 'w-6 h-6 text-xs' : 'w-4 h-4 text-[9px]'} rounded ${
                  urgency >= v ? 'bg-joy-600 text-bg-1' : 'bg-bg-2 text-ink-400'
                } disabled:opacity-30 transition-colors`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Clarity */}
        <div className={compact ? 'space-y-1' : 'flex items-center gap-1'}>
          <span className={`text-ink-700 ${compact ? 'text-xs font-medium block' : 'text-ink-400 text-[11px]'}`}>
            Clarity
          </span>
          <div className="flex gap-1">
            {[
              { value: 1 as ClarityRating, label: '?', color: 'bg-warning', title: 'Unclear' },
              { value: 2 as ClarityRating, label: '~', color: 'bg-joy-500', title: 'Mostly clear' },
              { value: 3 as ClarityRating, label: '✓', color: 'bg-success', title: 'Clear' },
            ].map((o) => (
              <button
                key={o.value}
                type="button"
                title={o.title}
                onClick={() => setClarity(o.value)}
                disabled={disabled || isSubmitting}
                className={`${compact ? 'w-7 h-6 text-xs' : 'w-5 h-5 text-[10px]'} rounded text-bg-1 ${o.color} ${
                  clarity === o.value ? 'ring-2 ring-brand-500' : 'opacity-50'
                } disabled:opacity-30 transition-all`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Innovation checkbox */}
        <div className={compact ? '' : 'flex items-center'}>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isInnovative}
              onChange={(e) => setIsInnovative(e.target.checked)}
              disabled={disabled || isSubmitting}
              className={`${compact ? 'w-4 h-4' : 'w-3 h-3'} text-joy-500 rounded disabled:opacity-30`}
            />
            <span className={`text-ink-700 ${compact ? 'text-xs font-medium' : 'text-ink-400 text-[11px]'}`}>
              💡 Innovative
            </span>
          </label>
        </div>

        {/* Tone */}
        <div className={compact ? 'space-y-1' : 'flex items-center gap-1'}>
          <span className={`text-ink-700 ${compact ? 'text-xs font-medium block' : 'text-ink-400 text-[11px]'}`}>
            Tone
          </span>
          <div className="flex gap-1">
            {[
              { value: 1 as ConstructivenessRating, label: '!', color: 'bg-danger', title: 'Problematic' },
              { value: 2 as ConstructivenessRating, label: '~', color: 'bg-warning', title: 'Could be better' },
              { value: 3 as ConstructivenessRating, label: '✓', color: 'bg-success', title: 'Constructive' },
            ].map((o) => (
              <button
                key={o.value}
                type="button"
                title={o.title}
                onClick={() => setConstructiveness(o.value)}
                disabled={disabled || isSubmitting}
                className={`${compact ? 'w-7 h-6 text-xs' : 'w-5 h-5 text-[10px]'} rounded text-bg-1 ${o.color} ${
                  constructiveness === o.value ? 'ring-2 ring-brand-500' : 'opacity-50'
                } disabled:opacity-30 transition-all`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {constructiveness === 1 && (
        <p className="text-[10px] text-danger">⚠️ Flags moderator review</p>
      )}

      {/* Feedback - collapsible, hidden in compact mode */}
      {!compact && (
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
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={disabled || isSubmitting}
        className={`${compact ? 'w-full py-1.5 text-xs' : 'px-2 py-0.5 text-[10px]'} bg-brand-600 text-bg-1 rounded font-medium hover:bg-brand-500 disabled:opacity-30 transition-colors`}
      >
        {isSubmitting ? '...' : currentRating ? 'Update Rating' : 'Rate Proposal'}
      </button>
    </form>
  )
}
