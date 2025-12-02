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
      color: 'bg-green-600 hover:bg-green-700 text-white',
      description: 'I approve this proposal',
    },
    {
      type: 'concern',
      label: 'Concern',
      color: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      description: 'I have concerns or objections',
    },
    {
      type: 'abstain',
      label: 'Abstain',
      color: 'bg-gray-600 hover:bg-gray-700 text-white',
      description: 'I choose not to vote',
    },
    {
      type: 'block',
      label: 'Block',
      color: 'bg-red-600 hover:bg-red-700 text-white',
      description: 'Strong objection - this prevents approval',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Current Vote Display */}
      {currentVote && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            Your current vote: <span className="font-bold capitalize">{currentVote}</span>
          </p>
          <p className="text-xs text-blue-700 mt-1">You can change your vote at any time</p>
        </div>
      )}

      {/* Vote Tally */}
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-3xl font-bold text-green-700">{tally.consent}</div>
          <div className="text-sm text-green-600">Consent</div>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-3xl font-bold text-yellow-700">{tally.concern}</div>
          <div className="text-sm text-yellow-600">Concern</div>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-3xl font-bold text-gray-700">{tally.abstain}</div>
          <div className="text-sm text-gray-600">Abstain</div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
          <div className="text-3xl font-bold text-red-700">{tally.block}</div>
          <div className="text-sm text-red-600">Block</div>
        </div>
      </div>

      {/* Decision Status */}
      <div className={`p-4 rounded-lg border ${
        tally.hasBlocks
          ? 'bg-red-50 border-red-200'
          : tally.thresholdMet
          ? 'bg-green-50 border-green-200'
          : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
      }`}>
        <p className={`font-medium ${
          tally.hasBlocks
            ? 'text-red-900'
            : tally.thresholdMet
            ? 'text-green-900'
            : 'text-gray-900 dark:text-white'
        }`}>
          {tally.hasBlocks
            ? `❌ Blocked - ${tally.block} block vote(s) prevent approval`
            : tally.thresholdMet
            ? '✅ Threshold met - Proposal can be approved'
            : '⏳ Awaiting more votes - Threshold not yet met'}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Total votes: {tally.total} (excluding {tally.abstain} abstentions)
        </p>
      </div>

      {/* Vote Buttons */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Cast Your Vote</h3>
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
                className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${btn.color} ${
                  currentVote === btn.type ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {btn.label}
              </button>
              <p className="text-xs text-gray-600">{btn.description}</p>

              {/* Reasoning textarea */}
              {showReasoningFor === btn.type && (
                <div className="mt-2 space-y-2">
                  <textarea
                    placeholder={`Optional: Explain your ${btn.type} vote...`}
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    disabled={isVoting}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVote(btn.type)}
                      disabled={isVoting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isVoting ? 'Submitting...' : 'Submit Vote'}
                    </button>
                    <button
                      onClick={() => {
                        setShowReasoningFor(null)
                        setReasoning('')
                      }}
                      disabled={isVoting}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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
