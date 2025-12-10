/**
 * EvidenceValidationBadge Component
 *
 * Shows the validation status of evidence with vote counts
 * and allows members to verify or dispute
 */

'use client'

import { useState } from 'react'
import type { EvidenceValidation, EvidenceValidationStatus } from '@togetheros/types/governance'

export interface EvidenceValidationBadgeProps {
  /** Validation data for the evidence */
  validation: EvidenceValidation | null

  /** Whether current user can vote */
  canVote: boolean

  /** Reason why user cannot vote */
  canVoteReason?: string

  /** Callback to submit a verification */
  onVerify?: () => Promise<void>

  /** Callback to submit a dispute */
  onDispute?: (category: string, explanation: string) => Promise<void>

  /** Whether an action is in progress */
  isLoading?: boolean

  /** Optional CSS class name */
  className?: string
}

const STATUS_STYLES: Record<EvidenceValidationStatus | 'none', { bg: string; text: string; label: string }> = {
  none: { bg: 'bg-bg-2', text: 'text-ink-400', label: 'Unvalidated' },
  pending: { bg: 'bg-info-bg', text: 'text-info', label: 'Pending Validation' },
  verified: { bg: 'bg-success-bg', text: 'text-success', label: 'Verified' },
  disputed: { bg: 'bg-warning-bg', text: 'text-warning', label: 'Disputed' },
  rejected: { bg: 'bg-danger-bg', text: 'text-danger', label: 'Rejected' },
}

const DISPUTE_CATEGORIES = [
  { value: 'inaccurate', label: 'Inaccurate', description: 'Contains factual errors' },
  { value: 'outdated', label: 'Outdated', description: 'Information is no longer current' },
  { value: 'misleading', label: 'Misleading', description: 'Presents information deceptively' },
  { value: 'irrelevant', label: 'Irrelevant', description: 'Not relevant to the proposal' },
  { value: 'fabricated', label: 'Fabricated', description: 'Evidence appears to be made up' },
]

export function EvidenceValidationBadge({
  validation,
  canVote,
  canVoteReason,
  onVerify,
  onDispute,
  isLoading = false,
  className = '',
}: EvidenceValidationBadgeProps) {
  const [showActions, setShowActions] = useState(false)
  const [showDisputeForm, setShowDisputeForm] = useState(false)
  const [disputeCategory, setDisputeCategory] = useState('')
  const [disputeExplanation, setDisputeExplanation] = useState('')
  const [error, setError] = useState<string | null>(null)

  const status = validation?.status || 'none'
  const style = STATUS_STYLES[status]

  const handleVerify = async () => {
    if (!onVerify) return
    setError(null)

    try {
      await onVerify()
      setShowActions(false)
    } catch (err: any) {
      setError(err.message || 'Failed to verify')
    }
  }

  const handleDispute = async () => {
    if (!onDispute) return
    setError(null)

    if (!disputeCategory) {
      setError('Please select a category')
      return
    }

    if (disputeExplanation.trim().length < 20) {
      setError('Please provide at least 20 characters of explanation')
      return
    }

    try {
      await onDispute(disputeCategory, disputeExplanation.trim())
      setShowActions(false)
      setShowDisputeForm(false)
      setDisputeCategory('')
      setDisputeExplanation('')
    } catch (err: any) {
      setError(err.message || 'Failed to dispute')
    }
  }

  return (
    <div className={`inline-block relative ${className}`}>
      {/* Status Badge */}
      <button
        onClick={() => setShowActions(!showActions)}
        disabled={!canVote && !validation}
        className={`px-2 py-1 text-xs rounded-full ${style.bg} ${style.text} font-medium disabled:cursor-default flex items-center gap-1`}
      >
        {status === 'verified' && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {status === 'disputed' && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {style.label}
        {validation && (
          <span className="opacity-70">
            ({validation.verifyCount}/{validation.verifyThreshold})
          </span>
        )}
      </button>

      {/* Actions Dropdown */}
      {showActions && canVote && (
        <div className="absolute top-full left-0 mt-1 z-10 bg-bg-1 border border-border rounded-lg shadow-lg p-3 min-w-[250px]">
          {error && (
            <div className="p-2 bg-danger-bg border border-danger/30 rounded text-danger text-xs mb-3">
              {error}
            </div>
          )}

          {!showDisputeForm ? (
            <div className="space-y-2">
              <p className="text-xs text-ink-400 mb-2">
                Help validate this evidence by verifying or disputing it.
              </p>
              <button
                onClick={handleVerify}
                disabled={isLoading}
                className="w-full px-3 py-2 bg-success-bg text-success rounded-md text-sm font-medium hover:bg-success/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Processing...' : 'Verify Evidence'}
              </button>
              <button
                onClick={() => setShowDisputeForm(true)}
                disabled={isLoading}
                className="w-full px-3 py-2 bg-warning-bg text-warning rounded-md text-sm font-medium hover:bg-warning/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Dispute Evidence
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-ink-900">Why are you disputing?</p>
              <select
                value={disputeCategory}
                onChange={(e) => setDisputeCategory(e.target.value)}
                disabled={isLoading}
                className="w-full px-2 py-1 border border-border rounded text-sm bg-bg-1 text-ink-900"
              >
                <option value="">Select category...</option>
                {DISPUTE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label} - {cat.description}
                  </option>
                ))}
              </select>
              <textarea
                value={disputeExplanation}
                onChange={(e) => setDisputeExplanation(e.target.value)}
                placeholder="Explain your concerns..."
                rows={3}
                disabled={isLoading}
                className="w-full px-2 py-1 border border-border rounded text-sm bg-bg-1 text-ink-900 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleDispute}
                  disabled={isLoading}
                  className="flex-1 px-3 py-1 bg-warning text-bg-1 rounded text-sm font-medium hover:bg-warning/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Submitting...' : 'Submit Dispute'}
                </button>
                <button
                  onClick={() => setShowDisputeForm(false)}
                  disabled={isLoading}
                  className="px-3 py-1 border border-border rounded text-sm text-ink-700 hover:bg-bg-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cannot vote reason */}
      {showActions && !canVote && canVoteReason && (
        <div className="absolute top-full left-0 mt-1 z-10 bg-bg-1 border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
          <p className="text-xs text-ink-400">{canVoteReason}</p>
        </div>
      )}
    </div>
  )
}
