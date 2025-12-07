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
    <div className="space-y-2">
      {/* Current Vote Display */}
      {currentVote && (
        <div className="p-4 bg-info-bg border border-info/30 rounded-lg">
          <p className="text-sm font-medium text-info">
            Your current vote: <span className="font-bold capitalize">{currentVote}</span>
          </p>
          <p className="text-xs text-info mt-1">You can change your vote at any time</p>
        </div>
      )}

      {/* Vote Tally */}
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center p-4 bg-success-bg rounded-lg border border-success/30">
          <div className="text-sm font-bold text-success">{tally.consent}</div>
          <div className="text-sm text-success">Consent</div>
        </div>
        <div className="text-center p-4 bg-warning-bg rounded-lg border border-warning/30">
          <div className="text-sm font-bold text-warning">{tally.concern}</div>
          <div className="text-sm text-warning">Concern</div>
        </div>
        <div className="text-center p-4 bg-bg-2 rounded-lg border border-border">
          <div className="text-sm font-bold text-ink-700">{tally.abstain}</div>
          <div className="text-sm text-ink-700">Abstain</div>
        </div>
        <div className="text-center p-4 bg-danger-bg rounded-lg border border-danger/30">
          <div className="text-sm font-bold text-danger">{tally.block}</div>
          <div className="text-sm text-danger">Block</div>
        </div>
      </div>

      {/* Decision Status */}
      <div className={`p-4 rounded-lg border ${
        tally.hasBlocks
          ? 'bg-danger-bg border-danger/30'
          : tally.thresholdMet
          ? 'bg-success-bg border-success/30'
          : 'bg-bg-2 border-border'
      }`}>
        <p className={`font-medium ${
          tally.hasBlocks
            ? 'text-danger'
            : tally.thresholdMet
            ? 'text-success'
            : 'text-ink-900'
        }`}>
          {tally.hasBlocks
            ? `❌ Blocked - ${tally.block} block vote(s) prevent approval`
            : tally.thresholdMet
            ? '✅ Threshold met - Proposal can be approved'
            : '⏳ Awaiting more votes - Threshold not yet met'}
        </p>
        <p className="text-sm text-ink-700 mt-1">
          Total votes: {tally.total} (excluding {tally.abstain} abstentions)
        </p>
      </div>

      {/* Vote Buttons */}
      <div className="space-y-2">
        <h3 className="font-semibold text-ink-900">Cast Your Vote</h3>
        <div className="grid grid-cols-2 gap-4">
          {voteButtons.map((btn) => (
            <div key={btn.type} className="space-y-2">
              <button
                onClick={() => {
                  if (showReasoningFor === btn.type) {
                    handleVote(btn.type)
                  } else {
                    setShowReasoningFor(btn.type)
                  }
                }}
                disabled={disabled || isVoting}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${btn.color} ${
                  currentVote === btn.type ? 'ring-2 ring-offset-2 ring-brand-500' : ''
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {btn.label}
              </button>
              <p className="text-xs text-ink-700">{btn.description}</p>

              {/* Reasoning textarea */}
              {showReasoningFor === btn.type && (
                <div className="mt-2 space-y-2">
                  <textarea
                    placeholder={`Optional: Explain your ${btn.type} vote...`}
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none bg-bg-1 text-ink-900"
                    rows={3}
                    disabled={isVoting}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVote(btn.type)}
                      disabled={isVoting}
                      className="px-4 py-2 bg-brand-600 text-bg-1 rounded-lg hover:bg-brand-500 disabled:opacity-50"
                    >
                      {isVoting ? 'Submitting...' : 'Submit Vote'}
                    </button>
                    <button
                      onClick={() => {
                        setShowReasoningFor(null)
                        setReasoning('')
                      }}
                      disabled={isVoting}
                      className="px-4 py-2 bg-bg-2 text-ink-700 rounded-lg hover:bg-bg-0"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
