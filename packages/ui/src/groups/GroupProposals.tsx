/**
 * GroupProposals Component
 *
 * Displays and manages proposals scoped to a specific group
 */

'use client'

import { useState } from 'react'

export interface Proposal {
  id: string
  title: string
  summary: string
  status: 'draft' | 'deliberation' | 'voting' | 'decided'
  authorId: string
  authorName: string
  createdAt: Date
  voteCount?: number
}

export interface GroupProposalsProps {
  /** Group ID */
  groupId: string

  /** List of proposals */
  proposals: Proposal[]

  /** Callback when creating new proposal */
  onCreateProposal?: () => void

  /** Optional CSS class name */
  className?: string
}

function getStatusColor(status: Proposal['status']): string {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    case 'deliberation':
      return 'bg-blue-100 text-blue-800'
    case 'voting':
      return 'bg-purple-100 text-purple-800'
    case 'decided':
      return 'bg-green-100 text-green-800'
  }
}

export function GroupProposals({
  groupId,
  proposals,
  onCreateProposal,
  className = '',
}: GroupProposalsProps) {
  const [filter, setFilter] = useState<Proposal['status'] | 'all'>('all')

  const filteredProposals = filter === 'all'
    ? proposals
    : proposals.filter((p) => p.status === filter)

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Group Proposals</h2>
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
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            filter === 'all'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({proposals.length})
        </button>
        <button
          onClick={() => setFilter('deliberation')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            filter === 'deliberation'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Deliberation ({proposals.filter((p) => p.status === 'deliberation').length})
        </button>
        <button
          onClick={() => setFilter('voting')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            filter === 'voting'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Voting ({proposals.filter((p) => p.status === 'voting').length})
        </button>
        <button
          onClick={() => setFilter('decided')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            filter === 'decided'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Decided ({proposals.filter((p) => p.status === 'decided').length})
        </button>
      </div>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
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
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
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
