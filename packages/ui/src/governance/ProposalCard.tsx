/**
 * ProposalCard Component
 *
 * Display card for a single proposal in list views.
 * Shows key info: title, summary, status, author, scope, timestamps.
 */

'use client'

import type { Proposal, ProposalStatus, ProposalRatingAggregate } from '@togetheros/types/governance'
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

  /** Rating aggregate for inline display */
  ratingAggregate?: ProposalRatingAggregate | null

  /** Total SP allocated */
  totalSP?: number
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

/**
 * Mini rating indicator - icon only, colored based on value
 */
function RatingDot({ value, max, color }: { value: number; max: number; color: string }) {
  const filled = value > 0
  const intensity = Math.round((value / max) * 3) // 1-3 intensity levels

  return (
    <div
      className={`w-2.5 h-2.5 rounded-full ${
        filled
          ? `${color} opacity-${Math.min(100, 40 + intensity * 20)}`
          : 'bg-bg-2'
      }`}
      title={`${value.toFixed(1)}/${max}`}
    />
  )
}

export function ProposalCard({
  proposal,
  authorName,
  className = '',
  clickable = true,
  ratingAggregate,
  totalSP = 0,
}: ProposalCardProps) {
  const router = useRouter()

  const handleClick = () => {
    if (clickable) {
      router.push(`/governance/${proposal.id}`)
    }
  }

  const statusBadge = getStatusBadgeStyles(proposal.status)

  // Get clarity color based on average
  const getClarityColor = (avg: number) => {
    if (avg >= 2.5) return 'bg-success'
    if (avg >= 1.5) return 'bg-warning'
    return 'bg-danger'
  }

  // Get tone/constructiveness color based on average
  const getToneColor = (avg: number) => {
    if (avg >= 2.5) return 'bg-success'
    if (avg >= 1.5) return 'bg-warning'
    return 'bg-danger'
  }

  const hasRatings = ratingAggregate && ratingAggregate.totalRatings > 0

  return (
    <div
      onClick={handleClick}
      className={`bg-bg-1 rounded-lg border border-border p-4 transition-shadow ${
        clickable ? 'hover:shadow-md cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex gap-4">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
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

        {/* Inline Ratings Panel - Icon Only */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1.5 p-2 bg-bg-2 rounded-lg min-w-[52px]">
          {/* SP */}
          <div className="text-center" title={`${totalSP} Support Points`}>
            <div className="text-xs font-bold text-brand-600">{totalSP}</div>
            <div className="text-[8px] text-ink-400">SP</div>
          </div>

          {/* Separator */}
          <div className="w-6 border-t border-border" />

          {hasRatings ? (
            <>
              {/* Urgency - orange bar */}
              <div
                className="w-6 h-1.5 bg-bg-3 rounded-full overflow-hidden"
                title={`Urgency: ${ratingAggregate.avgUrgency.toFixed(1)}/5`}
              >
                <div
                  className="h-full bg-joy-600 rounded-full"
                  style={{ width: `${(ratingAggregate.avgUrgency / 5) * 100}%` }}
                />
              </div>

              {/* Importance - blue bar */}
              <div
                className="w-6 h-1.5 bg-bg-3 rounded-full overflow-hidden"
                title={`Importance: ${ratingAggregate.avgImportance.toFixed(1)}/5`}
              >
                <div
                  className="h-full bg-info rounded-full"
                  style={{ width: `${(ratingAggregate.avgImportance / 5) * 100}%` }}
                />
              </div>

              {/* Clarity - colored dot */}
              <div
                className={`w-2.5 h-2.5 rounded-full ${getClarityColor(ratingAggregate.avgClarity)}`}
                title={`Clarity: ${ratingAggregate.avgClarity.toFixed(1)}/3`}
              />

              {/* Innovation - lightbulb if >30% */}
              {ratingAggregate.innovativePercentage > 0.3 && (
                <span className="text-xs" title={`${(ratingAggregate.innovativePercentage * 100).toFixed(0)}% innovative`}>
                  💡
                </span>
              )}

              {/* Tone - colored dot */}
              <div
                className={`w-2.5 h-2.5 rounded-full ${getToneColor(ratingAggregate.avgConstructiveness)}`}
                title={`Tone: ${ratingAggregate.avgConstructiveness.toFixed(1)}/3`}
              />
            </>
          ) : (
            /* Empty state - gray indicators */
            <>
              <div className="w-6 h-1.5 bg-bg-3 rounded-full" title="No urgency ratings" />
              <div className="w-6 h-1.5 bg-bg-3 rounded-full" title="No importance ratings" />
              <div className="w-2.5 h-2.5 bg-bg-3 rounded-full" title="No clarity ratings" />
              <div className="w-2.5 h-2.5 bg-bg-3 rounded-full" title="No tone ratings" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
