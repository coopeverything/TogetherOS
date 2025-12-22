/**
 * Proposal Rating Display Component
 * Shows aggregated ratings with visual indicators
 */

import React from 'react'
import type { ProposalRatingAggregate } from '@togetheros/types/governance'

export interface ProposalRatingDisplayProps {
  aggregate: ProposalRatingAggregate
  /** Total SP allocated to this proposal */
  totalSPAllocated?: number
}

export function ProposalRatingDisplay({ aggregate, totalSPAllocated }: ProposalRatingDisplayProps) {
  if (aggregate.totalRatings === 0 && !totalSPAllocated) {
    return (
      <div className="text-center py-3 text-ink-400">
        <p className="text-xs">No ratings yet. Be the first to rate!</p>
      </div>
    )
  }

  const clarityColor =
    aggregate.avgClarity >= 2.5 ? 'text-success' :
    aggregate.avgClarity >= 1.5 ? 'text-warning' :
    'text-danger'

  const constructivenessColor =
    aggregate.avgConstructiveness >= 2.5 ? 'text-success' :
    aggregate.avgConstructiveness >= 1.5 ? 'text-warning' :
    'text-danger'

  // Reordered: SP → Urgency → Importance → Clarity → Innovation → Constructiveness
  return (
    <div className="space-y-3">
      {/* Header Row: SP Allocated + Total Ratings */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        {/* SP Allocated - Primary metric */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">SP</span>
          </div>
          <div>
            <p className="text-lg font-bold text-brand-600">{totalSPAllocated ?? 0}</p>
            <p className="text-[10px] text-ink-400">Support Points</p>
          </div>
        </div>
        {/* Total Ratings */}
        <div className="text-right">
          <p className="text-sm font-bold text-ink-900">{aggregate.totalRatings}</p>
          <p className="text-[10px] text-ink-400">Ratings</p>
        </div>
      </div>

      {/* Urgency - Now first after header */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-ink-900">Urgency</span>
          <span className="text-xs font-bold text-joy-600">
            {aggregate.avgUrgency.toFixed(1)}/5
          </span>
        </div>
        <div className="w-full bg-bg-2 rounded-full h-1.5">
          <div
            className="bg-joy-600 h-1.5 rounded-full transition-all"
            style={{ width: `${(aggregate.avgUrgency / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Importance */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-ink-900">Importance</span>
          <span className="text-xs font-bold text-info">
            {aggregate.avgImportance.toFixed(1)}/5
          </span>
        </div>
        <div className="w-full bg-bg-2 rounded-full h-1.5">
          <div
            className="bg-info h-1.5 rounded-full transition-all"
            style={{ width: `${(aggregate.avgImportance / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Clarity */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-ink-900">Clarity</span>
          <span className={`text-xs font-bold ${clarityColor}`}>
            {aggregate.avgClarity.toFixed(1)}/3
          </span>
        </div>
        <div className="flex gap-1.5 mb-1">
          <div className="flex-1 text-center">
            <div className="w-3 h-3 bg-warning rounded-full mx-auto mb-0.5"></div>
            <span className="text-xs text-ink-400">{aggregate.clarityDistribution.brown}</span>
          </div>
          <div className="flex-1 text-center">
            <div className="w-3 h-3 bg-joy-500 rounded-full mx-auto mb-0.5"></div>
            <span className="text-xs text-ink-400">{aggregate.clarityDistribution.yellow}</span>
          </div>
          <div className="flex-1 text-center">
            <div className="w-3 h-3 bg-success rounded-full mx-auto mb-0.5"></div>
            <span className="text-xs text-ink-400">{aggregate.clarityDistribution.green}</span>
          </div>
        </div>
      </div>

      {/* Innovation */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-ink-900 flex items-center gap-1">
            <span className="text-xs">💡</span>
            Innovation
          </span>
          <span className="text-xs font-bold text-joy-500">
            {(aggregate.innovativePercentage * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex-1 bg-bg-2 rounded-full h-1.5">
            <div
              className="bg-joy-500 h-1.5 rounded-full transition-all"
              style={{ width: `${aggregate.innovativePercentage * 100}%` }}
            ></div>
          </div>
          <span className="text-xs text-ink-400 whitespace-nowrap">
            {aggregate.innovativeCount} marked
          </span>
        </div>
      </div>

      {/* Constructiveness (Tone) */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-ink-900">Tone</span>
          <span className={`text-xs font-bold ${constructivenessColor}`}>
            {aggregate.avgConstructiveness.toFixed(1)}/3
          </span>
        </div>
        <div className="flex gap-1.5 mb-1">
          <div className="flex-1 text-center">
            <div className="w-3 h-3 bg-danger rounded-full mx-auto mb-0.5"></div>
            <span className="text-xs text-ink-400">{aggregate.constructivenessDistribution.red}</span>
          </div>
          <div className="flex-1 text-center">
            <div className="w-3 h-3 bg-warning rounded-full mx-auto mb-0.5"></div>
            <span className="text-xs text-ink-400">{aggregate.constructivenessDistribution.yellow}</span>
          </div>
          <div className="flex-1 text-center">
            <div className="w-3 h-3 bg-success rounded-full mx-auto mb-0.5"></div>
            <span className="text-xs text-ink-400">{aggregate.constructivenessDistribution.green}</span>
          </div>
        </div>
        {aggregate.hasRedFlags && (
          <div className="mt-1.5 px-2 py-1.5 bg-danger-bg border border-danger/30 rounded">
            <p className="text-xs text-danger">
              ⚠️ {aggregate.redFlagCount} flag{aggregate.redFlagCount > 1 ? 's' : ''} - moderator review
            </p>
          </div>
        )}
      </div>

      {/* Bridge AI Rating (if available) */}
      {aggregate.bridgeRating && (
        <div className="mt-4 pt-3 border-t border-border">
          <h4 className="text-xs font-medium text-ink-900 mb-2 flex items-center gap-1">
            <span className="text-info">🤖</span>
            Bridge AI
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-ink-400">Clarity:</span>
              <span className="font-medium text-ink-700">
                {aggregate.bridgeRating.clarity === 3 ? '✅ Clear' :
                 aggregate.bridgeRating.clarity === 2 ? '⚠️ Okay' :
                 '❌ Unclear'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-400">Tone:</span>
              <span className="font-medium text-ink-700">
                {aggregate.bridgeRating.constructiveness === 3 ? '✅ Good' :
                 aggregate.bridgeRating.constructiveness === 2 ? '⚠️ Issues' :
                 '❌ Review'}
              </span>
            </div>
            {aggregate.bridgeRating.reasoning && (
              <p className="text-xs text-ink-400 italic mt-1">
                "{aggregate.bridgeRating.reasoning}"
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
