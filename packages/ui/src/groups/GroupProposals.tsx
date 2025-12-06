/**
 * GroupProposals Component
 *
 * Displays and manages proposals scoped to a specific group
 */

'use client'

import { useState } from 'react'
import type { Proposal, ProposalStatus } from '@togetheros/types'

/**
 * UI-specific proposal type with additional display fields
 */
export type GroupProposalDisplay = Proposal & {
  /** Author name for display (joined from users table) */
  authorName: string

  /** Vote count (optional, for decided proposals) */
  voteCount?: number
}

export interface GroupProposalsProps {
  /** Group ID */
  groupId: string

  /** List of proposals with display data */
  proposals: GroupProposalDisplay[]

  /** Callback when creating new proposal */
  onCreateProposal?: () => void

  /** Optional CSS class name */
  className?: string
}

function getStatusColor(status: ProposalStatus): string {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    case 'research':
      return 'bg-yellow-100 text-yellow-800'
    case 'deliberation':
      return 'bg-blue-100 text-blue-800'
    case 'voting':
      return 'bg-purple-100 text-purple-800'
    case 'decided':
      return 'bg-green-100 text-green-800'
    case 'delivery':
      return 'bg-indigo-100 text-indigo-800'
    case 'reviewed':
      return 'bg-teal-100 text-teal-800'
    case 'archived':
      return 'bg-slate-100 text-slate-600'
  }
}

export function GroupProposals({
  groupId,
  proposals,
  onCreateProposal,
  className = '',
}: GroupProposalsProps) {
  const [filter, setFilter] = useState<ProposalStatus | 'all'>('all')

  const filteredProposals = filter === 'all'
    ? proposals
    : proposals.filter((p) => p.status === filter)

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Group Proposals</h2>
        {onCreateProposal && (
          <button
            onClick={onCreateProposal}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
          >
            New Proposal
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
            filter === 'all'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({proposals.length})
        </button>
        <button
          onClick={() => setFilter('draft')}
          className={`px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
            filter === 'draft'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Draft ({proposals.filter((p) => p.status === 'draft').length})
        </button>
        <button
          onClick={() => setFilter('research')}
          className={`px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
            filter === 'research'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Research ({proposals.filter((p) => p.status === 'research').length})
        </button>
        <button
          onClick={() => setFilter('deliberation')}
          className={`px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
            filter === 'deliberation'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Deliberation ({proposals.filter((p) => p.status === 'deliberation').length})
        </button>
        <button
          onClick={() => setFilter('voting')}
          className={`px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
            filter === 'voting'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Voting ({proposals.filter((p) => p.status === 'voting').length})
        </button>
        <button
          onClick={() => setFilter('decided')}
          className={`px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
            filter === 'decided'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Decided ({proposals.filter((p) => p.status === 'decided').length})
        </button>
        <button
          onClick={() => setFilter('delivery')}
          className={`px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
            filter === 'delivery'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Delivery ({proposals.filter((p) => p.status === 'delivery').length})
        </button>
        <button
          onClick={() => setFilter('reviewed')}
          className={`px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
            filter === 'reviewed'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Reviewed ({proposals.filter((p) => p.status === 'reviewed').length})
        </button>
        <button
          onClick={() => setFilter('archived')}
          className={`px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${
            filter === 'archived'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Archived ({proposals.filter((p) => p.status === 'archived').length})
        </button>
      </div>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500">No proposals yet</p>
          <p className="text-gray-400 text-sm mt-2">
            {onCreateProposal
              ? 'Create the first proposal for this group'
              : 'Proposals will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {proposal.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    by {proposal.authorName} •{' '}
                    {new Date(proposal.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(proposal.status)}`}
                >
                  {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                </span>
              </div>
              <p className="text-gray-700 mb-4">{proposal.summary}</p>
              {proposal.voteCount !== undefined && (
                <p className="text-sm text-gray-500">{proposal.voteCount} votes</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
