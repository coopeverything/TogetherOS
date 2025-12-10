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
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Clarity Rating */}
      <div>
        <label className="block text-xs font-medium text-ink-900 mb-1.5">
          Clarity
          <span className="text-ink-400 text-xs ml-1">(How well-written?)</span>
        </label>
        <div className="flex gap-2">
          {[
            { value: 1 as ClarityRating, label: 'Unclear', color: 'bg-warning hover:opacity-90' },
            { value: 2 as ClarityRating, label: 'Okay', color: 'bg-joy-500 hover:opacity-90' },
            { value: 3 as ClarityRating, label: 'Clear', color: 'bg-success hover:opacity-90' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setClarity(option.value)}
              disabled={disabled || isSubmitting}
              className={`flex-1 px-2 py-1 text-xs rounded text-bg-1 font-medium transition-all ${option.color} ${
                clarity === option.value ? 'ring-2 ring-offset-1 ring-brand-500 scale-[1.02]' : ''
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Importance Rating */}
      <div>
        <label className="block text-xs font-medium text-ink-900 mb-1.5">
          Importance
          <span className="text-ink-400 text-xs ml-1">(How critical?)</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setImportance(value)}
              disabled={disabled || isSubmitting}
              className={`flex-1 px-2 py-1 text-xs rounded font-medium transition-all ${
                importance >= value
                  ? 'bg-info text-bg-1 hover:opacity-90'
                  : 'bg-bg-2 text-ink-700 hover:bg-bg-0'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Urgency Rating */}
      <div>
        <label className="block text-xs font-medium text-ink-900 mb-1.5">
          Urgency
          <span className="text-ink-400 text-xs ml-1">(Time-sensitive?)</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setUrgency(value)}
              disabled={disabled || isSubmitting}
              className={`flex-1 px-2 py-1 text-xs rounded font-medium transition-all ${
                urgency >= value
                  ? 'bg-joy-600 text-bg-1 hover:opacity-90'
                  : 'bg-bg-2 text-ink-700 hover:bg-bg-0'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Innovation Indicator */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isInnovative}
            onChange={(e) => setIsInnovative(e.target.checked)}
            disabled={disabled || isSubmitting}
            className="w-4 h-4 text-joy-500 rounded focus:ring-2 focus:ring-joy-500 disabled:opacity-50"
          />
          <span className="text-xs font-medium text-ink-900 flex items-center gap-1">
            <span className="text-xs">💡</span>
            Great New Idea
            <span className="text-ink-400 text-xs">(Innovative)</span>
          </span>
        </label>
      </div>

      {/* Constructiveness Rating */}
      <div>
        <label className="block text-xs font-medium text-ink-900 mb-1.5">
          Constructiveness
          <span className="text-ink-400 text-xs ml-1">(Tone)</span>
        </label>
        <div className="flex gap-2">
          {[
            { value: 1 as ConstructivenessRating, label: 'Flag', color: 'bg-danger hover:opacity-90', desc: 'Personal attacks or extreme wording' },
            { value: 2 as ConstructivenessRating, label: 'Okay', color: 'bg-warning hover:opacity-90', desc: 'Minor tone issues' },
            { value: 3 as ConstructivenessRating, label: 'Good', color: 'bg-success hover:opacity-90', desc: 'Respectful and collaborative' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setConstructiveness(option.value)}
              disabled={disabled || isSubmitting}
              className={`flex-1 px-2 py-1 text-xs rounded text-bg-1 font-medium transition-all ${option.color} ${
                constructiveness === option.value ? 'ring-2 ring-offset-1 ring-brand-500 scale-[1.02]' : ''
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={option.desc}
            >
              {option.label}
            </button>
          ))}
        </div>
        {constructiveness === 1 && (
          <p className="mt-1 text-xs text-danger">
            ⚠️ Red ratings trigger moderator review
          </p>
        )}
      </div>

      {/* Feedback */}
      <div>
        <label className="block text-xs font-medium text-ink-900 mb-1.5">
          Feedback (Optional)
          <span className="text-ink-400 text-xs ml-1">(Explain)</span>
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          disabled={disabled || isSubmitting}
          placeholder="Provide constructive feedback..."
          rows={3}
          maxLength={2000}
          className="w-full px-2 py-1.5 text-sm border border-border bg-bg-1 text-ink-900 rounded focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="mt-0.5 text-xs text-ink-400 text-right">
          {feedback.length}/2000
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={disabled || isSubmitting}
        className="w-full px-3 py-1.5 bg-brand-600 text-bg-1 rounded text-sm font-medium hover:bg-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : currentRating ? 'Update Rating' : 'Submit Rating'}
      </button>
    </form>
  )
}
