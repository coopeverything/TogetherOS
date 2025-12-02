/**
 * ProposalList Component
 *
 * Displays a filterable list of proposals
 */

'use client'

import { useState } from 'react'
import type { Proposal, ProposalStatus, ProposalScopeType } from '@togetheros/types/governance'
import { ProposalCard } from './ProposalCard'

export interface ProposalListProps {
  /** List of proposals to display */
  proposals: Proposal[]

  /** Author names mapped by user ID */
  authorNames?: Record<string, string>

  /** Show create button */
  showCreateButton?: boolean

  /** Callback when create button clicked */
  onCreateProposal?: () => void

  /** Optional CSS class name */
  className?: string
}

export function ProposalList({
  proposals,
  authorNames = {},
  showCreateButton = true,
  onCreateProposal,
  className = '',
}: ProposalListProps) {
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'all'>('all')
  const [scopeFilter, setScopeFilter] = useState<ProposalScopeType | 'all'>('all')

  const filteredProposals = proposals.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) {
      return false
    }
    if (scopeFilter !== 'all' && p.scopeType !== scopeFilter) {
      return false
    }
    return true
  })

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Proposals</h1>
        {showCreateButton && onCreateProposal && (
          <button
            onClick={onCreateProposal}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
          >
            New Proposal
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Status Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProposalStatus | 'all')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="research">Research</option>
              <option value="deliberation">Deliberation</option>
              <option value="voting">Voting</option>
              <option value="decided">Decided</option>
              <option value="delivery">Delivery</option>
              <option value="reviewed">Reviewed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Scope Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scope
            </label>
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value as ProposalScopeType | 'all')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Types</option>
              <option value="individual">Individual</option>
              <option value="group">Group</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredProposals.length} of {proposals.length} proposals
        </div>
      </div>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 text-lg mb-2">No proposals found</p>
          <p className="text-gray-400 text-sm">
            {proposals.length === 0
              ? 'Be the first to create a proposal'
              : 'Try adjusting your filters'}
          </p>
          {showCreateButton && onCreateProposal && proposals.length === 0 && (
            <button
              onClick={onCreateProposal}
              className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
            >
              Create First Proposal
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              authorName={authorNames[proposal.authorId]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
