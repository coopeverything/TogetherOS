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
 * Get badge color for proposal status
 */
function getStatusBadgeColor(status: ProposalStatus): string {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800'
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
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {proposal.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-500">
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
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors font-medium"
              >
                Edit Proposal
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Summary</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{proposal.summary}</p>
      </div>

      {/* Evidence */}
      {proposal.evidence.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Evidence ({proposal.evidence.length})
          </h2>
          <div className="space-y-4">
            {proposal.evidence.map((evidence, index) => (
              <div
                key={evidence.id || index}
                className="border-l-4 border-blue-500 pl-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{evidence.title}</h3>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {evidence.type}
                  </span>
                </div>
                <p className="text-gray-700 text-sm mb-2">{evidence.summary}</p>
                {evidence.url && (
                  <a
                    href={evidence.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-orange-600 hover:text-orange-700 underline"
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
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Options ({proposal.options.length})
          </h2>
          <div className="space-y-4">
            {proposal.options.map((option, index) => (
              <div
                key={option.id || index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{option.title}</h3>
                <p className="text-gray-700 text-sm mb-3">{option.description}</p>
                {(option.estimatedCost || option.estimatedTime) && (
                  <div className="flex gap-4 text-sm text-gray-600">
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
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Member Positions ({proposal.positions.length})
          </h2>
          <div className="space-y-4">
            {proposal.positions.map((position, index) => (
              <div
                key={position.id || index}
                className="border-l-4 border-purple-500 pl-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">
                    User {position.memberId.slice(0, 8)}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      position.stance === 'support'
                        ? 'bg-green-100 text-green-800'
                        : position.stance === 'oppose'
                          ? 'bg-red-100 text-red-800'
                          : position.stance === 'block'
                            ? 'bg-red-200 text-red-900'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {position.stance}
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{position.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Minority Report */}
      {proposal.minorityReport && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Minority Report
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {proposal.minorityReport}
          </p>
        </div>
      )}

      {/* Decision Info */}
      {proposal.decidedAt && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            Decision
          </h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Decided:</span>{' '}
              <span className="text-gray-600">{formatDate(proposal.decidedAt)}</span>
            </div>
            {proposal.decisionOutcome && (
              <div>
                <span className="font-medium text-gray-700">Outcome:</span>{' '}
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    proposal.decisionOutcome === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : proposal.decisionOutcome === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
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
