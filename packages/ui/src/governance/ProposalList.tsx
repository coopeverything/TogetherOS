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

/** Sort button configuration */
const SORT_CONFIG: Record<SortField, { label: string; color: string; tooltip: string }> = {
  sp: { label: 'SP', color: 'brand', tooltip: 'Sort by Support Points' },
  urgency: { label: '⏰', color: 'joy', tooltip: 'Sort by Urgency' },
  importance: { label: '⭐', color: 'info', tooltip: 'Sort by Importance' },
  innovative: { label: '💡', color: 'warning', tooltip: 'Sort by Innovation %' },
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

  // Get button classes based on active state
  const getSortButtonClasses = (field: SortField) => {
    const isActive = sortBy === field
    const config = SORT_CONFIG[field]

    if (isActive) {
      // Active state with color
      switch (config.color) {
        case 'brand':
          return 'bg-brand-100 text-brand-700 ring-1 ring-brand-500/50'
        case 'joy':
          return 'bg-joy-100 text-joy-700 ring-1 ring-joy-500/50'
        case 'info':
          return 'bg-info-bg text-info ring-1 ring-info/50'
        case 'warning':
          return 'bg-warning-bg text-warning ring-1 ring-warning/50'
        default:
          return 'bg-bg-2 text-ink-700'
      }
    }
    // Inactive state
    return 'bg-bg-2 text-ink-400 hover:text-ink-700 hover:bg-bg-3'
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

          {/* Sort Buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs text-ink-400">Sort:</span>
            {(Object.keys(SORT_CONFIG) as SortField[]).map((field) => (
              <button
                key={field}
                onClick={() => setSortBy(field)}
                title={SORT_CONFIG[field].tooltip}
                className={`px-2 py-1 text-xs rounded transition-all ${getSortButtonClasses(field)}`}
              >
                {SORT_CONFIG[field].label}
              </button>
            ))}
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
