/**
 * ProposalView Component
 *
 * Full detail view of a single proposal
 */

'use client'

import type { Proposal, ProposalStatus } from '@togetheros/types/governance'

export interface ProposalViewProps {
  /** Proposal data to display */
  proposal: Proposal

  /** Author name for display */
  authorName?: string

  /** Whether current user is the author */
  isAuthor?: boolean

  /** Callback when edit button clicked */
  onEdit?: () => void

  /** Callback when delete button clicked */
  onDelete?: () => void

  /** Optional CSS class name */
  className?: string
}

/**
 * Get badge color for proposal status - uses theme-aware accent colors
 */
function getStatusBadgeColor(status: ProposalStatus): string {
  switch (status) {
    case 'draft':
      return 'bg-ink-400/20 text-ink-700'
    case 'research':
      return 'bg-accent-3-bg text-accent-3'
    case 'deliberation':
      return 'bg-accent-1-bg text-accent-1'
    case 'voting':
      return 'bg-accent-2-bg text-accent-2'
    case 'decided':
      return 'bg-success-bg text-success'
    case 'delivery':
      return 'bg-accent-4-bg text-accent-4'
    case 'reviewed':
      return 'bg-info-bg text-info'
    case 'archived':
      return 'bg-bg-2 text-ink-400'
  }
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ProposalView({
  proposal,
  authorName,
  isAuthor = false,
  onEdit,
  onDelete,
  className = '',
}: ProposalViewProps) {
  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-sm font-bold text-ink-900 mb-2">
              {proposal.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-ink-400">
              <span>
                by {authorName || `User ${proposal.authorId.slice(0, 8)}`}
              </span>
              <span>•</span>
              <span className="capitalize">{proposal.scopeType} proposal</span>
              <span>•</span>
              <span>{formatDate(proposal.createdAt)}</span>
            </div>
          </div>
          <span
            className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusBadgeColor(
              proposal.status
            )}`}
          >
            {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
          </span>
        </div>

        {/* Action Buttons */}
        {isAuthor && (
          <div className="flex gap-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-brand-600 text-bg-1 rounded-md hover:bg-brand-500 transition-colors font-medium"
              >
                Edit Proposal
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="px-4 py-2 bg-danger text-bg-1 rounded-md hover:opacity-90 transition-colors font-medium"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-bg-1 rounded-lg border border-border p-4 mb-3">
        <h2 className="text-sm font-semibold text-ink-900 mb-3">Summary</h2>
        <p className="text-ink-700 whitespace-pre-wrap">{proposal.summary}</p>
      </div>

      {/* Evidence */}
      {proposal.evidence.length > 0 && (
        <div className="bg-bg-1 rounded-lg border border-border p-4 mb-3">
          <h2 className="text-sm font-semibold text-ink-900 mb-4">
            Evidence ({proposal.evidence.length})
          </h2>
          <div className="space-y-2">
            {proposal.evidence.map((evidence, index) => (
              <div
                key={evidence.id || index}
                className="border-l-4 border-accent-1 pl-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-ink-900">{evidence.title}</h3>
                  <span className="px-2 py-1 text-xs bg-accent-1-bg text-accent-1 rounded">
                    {evidence.type}
                  </span>
                </div>
                <p className="text-ink-700 text-sm mb-2">{evidence.summary}</p>
                {evidence.url && (
                  <a
                    href={evidence.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-600 hover:text-brand-500 underline"
                  >
                    View source →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Options */}
      {proposal.options.length > 0 && (
        <div className="bg-bg-1 rounded-lg border border-border p-4 mb-3">
          <h2 className="text-sm font-semibold text-ink-900 mb-4">
            Options ({proposal.options.length})
          </h2>
          <div className="space-y-2">
            {proposal.options.map((option, index) => (
              <div
                key={option.id || index}
                className="border border-border rounded-lg p-4"
              >
                <h3 className="font-semibold text-ink-900 mb-2">{option.title}</h3>
                <p className="text-ink-700 text-sm mb-3">{option.description}</p>
                {(option.estimatedCost || option.estimatedTime) && (
                  <div className="flex gap-4 text-sm text-ink-700">
                    {option.estimatedCost && (
                      <span>Cost: ${option.estimatedCost.toLocaleString()}</span>
                    )}
                    {option.estimatedTime && (
                      <span>Time: {option.estimatedTime}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Positions */}
      {proposal.positions.length > 0 && (
        <div className="bg-bg-1 rounded-lg border border-border p-4 mb-3">
          <h2 className="text-sm font-semibold text-ink-900 mb-4">
            Member Positions ({proposal.positions.length})
          </h2>
          <div className="space-y-2">
            {proposal.positions.map((position, index) => (
              <div
                key={position.id || index}
                className="border-l-4 border-accent-2 pl-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-ink-900">
                    User {position.memberId.slice(0, 8)}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      position.stance === 'support'
                        ? 'bg-success-bg text-success'
                        : position.stance === 'oppose'
                          ? 'bg-danger-bg text-danger'
                          : position.stance === 'block'
                            ? 'bg-danger text-bg-1'
                            : 'bg-bg-2 text-ink-700'
                    }`}
                  >
                    {position.stance}
                  </span>
                </div>
                <p className="text-ink-700 text-sm">{position.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Minority Report */}
      {proposal.minorityReport && (
        <div className="bg-warning-bg border border-warning/30 rounded-lg p-4 mb-3">
          <h2 className="text-sm font-semibold text-ink-900 mb-3">
            Minority Report
          </h2>
          <p className="text-ink-700 whitespace-pre-wrap">
            {proposal.minorityReport}
          </p>
        </div>
      )}

      {/* Decision Info */}
      {proposal.decidedAt && (
        <div className="bg-bg-1 rounded-lg border border-border p-4">
          <h2 className="text-sm font-semibold text-ink-900 mb-3">
            Decision
          </h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-ink-700">Decided:</span>{' '}
              <span className="text-ink-700">{formatDate(proposal.decidedAt)}</span>
            </div>
            {proposal.decisionOutcome && (
              <div>
                <span className="font-medium text-ink-700">Outcome:</span>{' '}
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    proposal.decisionOutcome === 'approved'
                      ? 'bg-success-bg text-success'
                      : proposal.decisionOutcome === 'rejected'
                        ? 'bg-danger-bg text-danger'
                        : 'bg-info-bg text-info'
                  }`}
                >
                  {proposal.decisionOutcome}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
