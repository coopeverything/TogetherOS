/**
 * ProposalList Component
 *
 * Displays a filterable, sortable list of proposals
 */

'use client'

import { useState } from 'react'
import type { Proposal, ProposalStatus, ProposalScopeType, ProposalRatingAggregate } from '@togetheros/types/governance'
import { ProposalCard } from './ProposalCard'

/** Sort field options */
type SortField = 'sp' | 'urgency' | 'importance' | 'innovative'

/** Sort button configuration - color blocks with name on hover */
const SORT_CONFIG: Record<SortField, { color: string; name: string }> = {
  sp: { color: 'brand', name: 'Support Points' },
  urgency: { color: 'joy', name: 'Urgency' },
  importance: { color: 'info', name: 'Importance' },
  innovative: { color: 'warning', name: 'Innovative' },
}

export interface ProposalListProps {
  /** List of proposals to display */
  proposals: Proposal[]

  /** Author names mapped by user ID */
  authorNames?: Record<string, string>

  /** Rating aggregates mapped by proposal ID */
  ratingAggregates?: Record<string, ProposalRatingAggregate>

  /** SP totals mapped by proposal ID */
  spTotals?: Record<string, number>

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
  ratingAggregates = {},
  spTotals = {},
  showCreateButton = true,
  onCreateProposal,
  className = '',
}: ProposalListProps) {
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'all'>('all')
  const [scopeFilter, setScopeFilter] = useState<ProposalScopeType | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortField>('sp')

  // Filter proposals
  const filteredProposals = proposals.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) {
      return false
    }
    if (scopeFilter !== 'all' && p.scopeType !== scopeFilter) {
      return false
    }
    return true
  })

  // Sort proposals (descending - highest first)
  const sortedProposals = [...filteredProposals].sort((a, b) => {
    const aggA = ratingAggregates[a.id]
    const aggB = ratingAggregates[b.id]

    switch (sortBy) {
      case 'sp':
        return (spTotals[b.id] || 0) - (spTotals[a.id] || 0)
      case 'urgency':
        return (aggB?.avgUrgency || 0) - (aggA?.avgUrgency || 0)
      case 'importance':
        return (aggB?.avgImportance || 0) - (aggA?.avgImportance || 0)
      case 'innovative':
        return (aggB?.innovativePercentage || 0) - (aggA?.innovativePercentage || 0)
      default:
        return 0
    }
  })

  // Hardcoded colors for sort buttons (don't change with theme)
  const SORT_COLORS: Record<SortField, string> = {
    sp: '#10b981',        // Green (Support Points)
    urgency: '#f97316',   // Orange (Urgency)
    importance: '#3b82f6', // Blue (Importance)
    innovative: '#eab308', // Yellow (Innovative)
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-sm font-bold text-ink-900">Proposals</h1>
        {showCreateButton && onCreateProposal && (
          <button
            onClick={onCreateProposal}
            className="px-4 py-2 bg-brand-600 text-bg-1 rounded-md hover:bg-brand-500 transition-colors font-medium"
          >
            New Proposal
          </button>
        )}
      </div>

      {/* Filters & Sort */}
      <div className="mb-3 space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          {/* Compact Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-ink-400">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProposalStatus | 'all')}
              className="px-2 py-1 text-sm border border-border rounded bg-bg-1 text-ink-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All</option>
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

          {/* Compact Scope Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-ink-400">Scope</span>
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value as ProposalScopeType | 'all')}
              className="px-2 py-1 text-sm border border-border rounded bg-bg-1 text-ink-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="all">All</option>
              <option value="individual">Individual</option>
              <option value="group">Group</option>
            </select>
          </div>

          {/* Sort Buttons - hardcoded color blocks */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-xs text-ink-400 mr-1">Sort:</span>
            {(Object.keys(SORT_CONFIG) as SortField[]).map((field) => {
              const isActive = sortBy === field
              return (
                <button
                  key={field}
                  onClick={() => setSortBy(field)}
                  title={SORT_CONFIG[field].name}
                  className="w-5 h-5 rounded transition-all cursor-pointer"
                  style={{
                    backgroundColor: SORT_COLORS[field],
                    opacity: isActive ? 1 : 0.4,
                    boxShadow: isActive ? `0 0 0 2px ${SORT_COLORS[field]}40` : 'none',
                  }}
                  aria-label={`Sort by ${SORT_CONFIG[field].name}`}
                />
              )
            })}
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-ink-400">
          Showing {sortedProposals.length} of {proposals.length} proposals
        </div>
      </div>

      {/* Proposals List */}
      {sortedProposals.length === 0 ? (
        <div className="text-center py-6 bg-bg-2 rounded-lg border border-border">
          <p className="text-ink-400 text-sm mb-2">No proposals found</p>
          <p className="text-ink-400 text-sm">
            {proposals.length === 0
              ? 'Be the first to create a proposal'
              : 'Try adjusting your filters'}
          </p>
          {showCreateButton && onCreateProposal && proposals.length === 0 && (
            <button
              onClick={onCreateProposal}
              className="mt-4 px-4 py-2 bg-brand-600 text-bg-1 rounded-md hover:bg-brand-500 transition-colors font-medium"
            >
              Create First Proposal
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              authorName={authorNames[proposal.authorId]}
              ratingAggregate={ratingAggregates[proposal.id]}
              totalSP={spTotals[proposal.id] || 0}
            />
          ))}
        </div>
      )}
    </div>
  )
}
