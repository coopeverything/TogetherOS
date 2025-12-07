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
 * Get badge styles for proposal status - 3D effect badges
 * Uses accent colors for vibrancy on minimalistic pages
 */
function getStatusBadgeStyles(status: ProposalStatus): { classes: string; style: React.CSSProperties } {
  // 3D emboss/deboss shadow for all badges
  const baseStyle: React.CSSProperties = {
    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)',
  }

  switch (status) {
    case 'draft':
      return { classes: 'bg-ink-400/20 text-ink-700', style: baseStyle }
    case 'research':
      return { classes: 'bg-accent-3-bg text-accent-3', style: baseStyle }
    case 'deliberation':
      return { classes: 'bg-accent-1-bg text-accent-1', style: baseStyle }
    case 'voting':
      return { classes: 'bg-accent-2-bg text-accent-2', style: baseStyle }
    case 'decided':
      return { classes: 'bg-success-bg text-success', style: baseStyle }
    case 'delivery':
      return { classes: 'bg-accent-4-bg text-accent-4', style: baseStyle }
    case 'reviewed':
      return { classes: 'bg-info-bg text-info', style: baseStyle }
    case 'archived':
      return { classes: 'bg-bg-2 text-ink-400', style: baseStyle }
  }
}

/**
 * Format date for display
 * Handles both Date objects and ISO date strings
 */
function formatDate(date: Date | string): string {
  const now = new Date()
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const diff = now.getTime() - dateObj.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return 'Today'
  } else if (days === 1) {
    return 'Yesterday'
  } else if (days < 7) {
    return `${days} days ago`
  } else {
    return dateObj.toLocaleDateString()
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

  const statusBadge = getStatusBadgeStyles(proposal.status)

  return (
    <div
      onClick={handleClick}
      className={`bg-bg-1 rounded-lg border border-border p-4 transition-shadow ${
        clickable ? 'hover:shadow-md cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-ink-900 mb-1">
            {proposal.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-ink-400">
            <span>
              by {authorName || `User ${proposal.authorId.slice(0, 8)}`}
            </span>
            <span>•</span>
            <span>{formatDate(proposal.createdAt)}</span>
            <span>•</span>
            <span className="capitalize">{proposal.scopeType}</span>
          </div>
        </div>
        {/* 3D status badge */}
        <span
          className={`px-3 py-1 text-sm font-medium rounded-full ${statusBadge.classes}`}
          style={statusBadge.style}
        >
          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
        </span>
      </div>
      <p className="text-ink-700 line-clamp-2">{proposal.summary}</p>

      {(proposal.evidence.length > 0 ||
        proposal.options.length > 0 ||
        proposal.positions.length > 0) && (
        <div className="flex items-center gap-4 mt-4 text-sm text-ink-400">
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
