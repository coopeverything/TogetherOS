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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Clarity Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Clarity
          <span className="text-gray-600 text-xs ml-2">(How well-written and understandable?)</span>
        </label>
        <div className="flex gap-4">
          {[
            { value: 1 as ClarityRating, label: 'Unclear', color: 'bg-amber-700 hover:bg-amber-800' },
            { value: 2 as ClarityRating, label: 'Somewhat Clear', color: 'bg-yellow-500 hover:bg-yellow-600' },
            { value: 3 as ClarityRating, label: 'Very Clear', color: 'bg-green-600 hover:bg-green-700' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setClarity(option.value)}
              disabled={disabled || isSubmitting}
              className={`flex-1 px-4 py-3 rounded-lg text-white font-medium transition-all ${option.color} ${
                clarity === option.value ? 'ring-2 ring-offset-2 ring-blue-500 scale-105' : ''
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Importance Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Importance
          <span className="text-gray-600 text-xs ml-2">(How critical/impactful?)</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setImportance(value)}
              disabled={disabled || isSubmitting}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                importance >= value
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Urgency Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Urgency
          <span className="text-gray-600 text-xs ml-2">(How time-sensitive?)</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setUrgency(value)}
              disabled={disabled || isSubmitting}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                urgency >= value
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Innovation Indicator */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isInnovative}
            onChange={(e) => setIsInnovative(e.target.checked)}
            disabled={disabled || isSubmitting}
            className="w-5 h-5 text-yellow-500 rounded focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
          />
          <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Great New Idea
            <span className="text-gray-600 text-xs">(Mark innovative/creative proposals)</span>
          </span>
        </label>
      </div>

      {/* Constructiveness Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Constructiveness
          <span className="text-gray-600 text-xs ml-2">(Tone and respectfulness)</span>
        </label>
        <div className="flex gap-4">
          {[
            { value: 1 as ConstructivenessRating, label: 'Needs Moderation', color: 'bg-red-600 hover:bg-red-700', desc: 'Personal attacks or extreme wording' },
            { value: 2 as ConstructivenessRating, label: 'Somewhat Problematic', color: 'bg-yellow-500 hover:bg-yellow-600', desc: 'Minor tone issues' },
            { value: 3 as ConstructivenessRating, label: 'Constructive', color: 'bg-green-600 hover:bg-green-700', desc: 'Respectful and collaborative' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setConstructiveness(option.value)}
              disabled={disabled || isSubmitting}
              className={`flex-1 px-4 py-3 rounded-lg text-white font-medium transition-all ${option.color} ${
                constructiveness === option.value ? 'ring-2 ring-offset-2 ring-blue-500 scale-105' : ''
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={option.desc}
            >
              {option.label}
            </button>
          ))}
        </div>
        {constructiveness === 1 && (
          <p className="mt-2 text-sm text-red-600">
            ⚠️ Red ratings trigger human moderator review
          </p>
        )}
      </div>

      {/* Feedback */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Feedback (Optional)
          <span className="text-gray-600 text-xs ml-2">(Explain your ratings)</span>
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          disabled={disabled || isSubmitting}
          placeholder="Provide constructive feedback to help improve this proposal..."
          rows={4}
          maxLength={2000}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500 text-right">
          {feedback.length}/2000 characters
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={disabled || isSubmitting}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : currentRating ? 'Update Rating' : 'Submit Rating'}
      </button>
    </form>
  )
}
