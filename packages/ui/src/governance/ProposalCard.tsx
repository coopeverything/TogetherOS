/**
 * ProposalCard Component
 *
 * Display card for a single proposal in list views.
 * Shows key info: title, summary, status, author, scope, timestamps.
 */

'use client'

import type { Proposal, ProposalStatus } from '@togetheros/types/governance'
import { useRouter } from 'next/navigation'

export interface ProposalCardProps {
  /** Proposal data to display */
  proposal: Proposal

  /** Author name for display */
  authorName?: string

  /** Optional CSS class name */
  className?: string

  /** Whether to show as link (default: true) */
  clickable?: boolean
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
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return 'Today'
  } else if (days === 1) {
    return 'Yesterday'
  } else if (days < 7) {
    return `${days} days ago`
  } else {
    return new Date(date).toLocaleDateString()
  }
}

export function ProposalCard({
  proposal,
  authorName,
  className = '',
  clickable = true,
}: ProposalCardProps) {
  const router = useRouter()

  const handleClick = () => {
    if (clickable) {
      router.push(`/governance/${proposal.id}`)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-lg border border-gray-200 p-6 transition-shadow ${
        clickable ? 'hover:shadow-md cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {proposal.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>
              by {authorName || `User ${proposal.authorId.slice(0, 8)}`}
            </span>
            <span>•</span>
            <span>{formatDate(proposal.createdAt)}</span>
            <span>•</span>
            <span className="capitalize">{proposal.scopeType}</span>
          </div>
        </div>
        <span
          className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeColor(
            proposal.status
          )}`}
        >
          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
        </span>
      </div>
      <p className="text-gray-700 line-clamp-2">{proposal.summary}</p>

      {(proposal.evidence.length > 0 ||
        proposal.options.length > 0 ||
        proposal.positions.length > 0) && (
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
          {proposal.evidence.length > 0 && (
            <span>{proposal.evidence.length} evidence</span>
          )}
          {proposal.options.length > 0 && (
            <span>{proposal.options.length} options</span>
          )}
          {proposal.positions.length > 0 && (
            <span>{proposal.positions.length} positions</span>
          )}
        </div>
      )}
    </div>
  )
}
