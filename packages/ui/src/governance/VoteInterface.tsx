/**
 * Vote Interface Component
 * Displays voting buttons and current vote for a proposal
 */

import React, { useState } from 'react'
import type { VoteType, VoteTally } from '@togetheros/types/governance'

export interface VoteInterfaceProps {
  proposalId: string
  currentVote: VoteType | null
  tally: VoteTally
  onVote: (voteType: VoteType, reasoning?: string) => Promise<void>
  disabled?: boolean
}

export function VoteInterface({
  proposalId,
  currentVote,
  tally,
  onVote,
  disabled = false,
}: VoteInterfaceProps) {
  const [reasoning, setReasoning] = useState('')
  const [isVoting, setIsVoting] = useState(false)
  const [showReasoningFor, setShowReasoningFor] = useState<VoteType | null>(null)

  const handleVote = async (voteType: VoteType) => {
    try {
      setIsVoting(true)
      await onVote(voteType, reasoning || undefined)
      setReasoning('')
      setShowReasoningFor(null)
    } catch (error) {
      console.error('Failed to cast vote:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const voteButtons: { type: VoteType; label: string; color: string; description: string }[] = [
    {
      type: 'consent',
      label: 'Consent',
      color: 'bg-success hover:opacity-90 text-bg-1',
      description: 'I approve this proposal',
    },
    {
      type: 'concern',
      label: 'Concern',
      color: 'bg-warning hover:opacity-90 text-bg-1',
      description: 'I have concerns or objections',
    },
    {
      type: 'abstain',
      label: 'Abstain',
      color: 'bg-ink-400 hover:bg-ink-500 text-bg-1',
      description: 'I choose not to vote',
    },
    {
      type: 'block',
      label: 'Block',
      color: 'bg-danger hover:opacity-90 text-bg-1',
      description: 'Strong objection - this prevents approval',
    },
  ]

  return (
    <div className="space-y-1.5">
      {/* Current Vote - inline */}
      {currentVote && (
        <p className="text-[10px] text-info">
          Your vote: <span className="font-bold capitalize">{currentVote}</span>
          <span className="opacity-70 ml-1">(changeable)</span>
        </p>
      )}

      {/* Vote Tally - ultra compact inline */}
      <div className="flex items-center gap-2 text-[10px]">
        <span className="text-success font-medium">{tally.consent}✓</span>
        <span className="text-warning font-medium">{tally.concern}?</span>
        <span className="text-ink-400">{tally.abstain}−</span>
        <span className="text-danger font-medium">{tally.block}✗</span>
        <span className="text-ink-400 ml-1">
          {tally.hasBlocks ? '❌' : tally.thresholdMet ? '✅' : '⏳'}
        </span>
      </div>

      {/* Vote Buttons - inline */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-[10px] text-ink-400">Vote:</span>
        {voteButtons.map((btn) => (
          <button
            key={btn.type}
            onClick={() => {
              if (showReasoningFor === btn.type) {
                handleVote(btn.type)
              } else {
                setShowReasoningFor(btn.type)
              }
            }}
            disabled={disabled || isVoting}
            className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${btn.color} ${
              currentVote === btn.type ? 'ring-1 ring-brand-500' : ''
            } disabled:opacity-30`}
          >
            {btn.type === 'consent' ? '✓' : btn.type === 'concern' ? '?' : btn.type === 'abstain' ? '−' : '✗'}
          </button>
        ))}
      </div>

      {/* Reasoning - only shows when vote button clicked */}
      {showReasoningFor && (
        <div className="space-y-1 text-[10px]">
          <textarea
            placeholder={`Why ${showReasoningFor}? (optional)`}
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            className="w-full px-1.5 py-1 text-[11px] border border-border rounded resize-none bg-bg-1 text-ink-900"
            rows={2}
            disabled={isVoting}
          />
          <div className="flex gap-1">
            <button
              onClick={() => handleVote(showReasoningFor)}
              disabled={isVoting}
              className="px-1.5 py-0.5 text-[10px] bg-brand-600 text-bg-1 rounded hover:bg-brand-500 disabled:opacity-30"
            >
              {isVoting ? '...' : 'Submit'}
            </button>
            <button
              onClick={() => {
                setShowReasoningFor(null)
                setReasoning('')
              }}
              disabled={isVoting}
              className="px-1.5 py-0.5 text-[10px] bg-bg-2 text-ink-700 rounded hover:bg-bg-0"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
