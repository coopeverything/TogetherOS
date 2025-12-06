/**
 * Proposal Rating Display Component
 * Shows aggregated ratings with visual indicators
 */

import React from 'react'
import type { ProposalRatingAggregate } from '@togetheros/types/governance'

export interface ProposalRatingDisplayProps {
  aggregate: ProposalRatingAggregate
}

export function ProposalRatingDisplay({ aggregate }: ProposalRatingDisplayProps) {
  if (aggregate.totalRatings === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No ratings yet. Be the first to rate this proposal!</p>
      </div>
    )
  }

  const clarityColor =
    aggregate.avgClarity >= 2.5 ? 'text-green-700' :
    aggregate.avgClarity >= 1.5 ? 'text-yellow-600' :
    'text-amber-800'

  const constructivenessColor =
    aggregate.avgConstructiveness >= 2.5 ? 'text-green-700' :
    aggregate.avgConstructiveness >= 1.5 ? 'text-yellow-600' :
    'text-red-700'

  return (
    <div className="space-y-6">
      {/* Total Ratings Header */}
      <div className="text-center pb-4 border-b">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{aggregate.totalRatings}</h3>
        <p className="text-base text-gray-600">Total Ratings</p>
      </div>

      {/* Clarity */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-base font-medium text-gray-900 dark:text-white">Clarity</span>
          <span className={`text-xl font-bold ${clarityColor}`}>
            {aggregate.avgClarity.toFixed(1)}/3
          </span>
        </div>
        <div className="flex gap-2 mb-1">
          <div className="flex-1 text-center">
            <div className="w-4 h-4 bg-amber-700 rounded-full mx-auto mb-1"></div>
            <span className="text-sm text-gray-600">{aggregate.clarityDistribution.brown}</span>
          </div>
          <div className="flex-1 text-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-1"></div>
            <span className="text-sm text-gray-600">{aggregate.clarityDistribution.yellow}</span>
          </div>
          <div className="flex-1 text-center">
            <div className="w-4 h-4 bg-green-600 rounded-full mx-auto mb-1"></div>
            <span className="text-sm text-gray-600">{aggregate.clarityDistribution.green}</span>
          </div>
        </div>
      </div>

      {/* Importance */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-base font-medium text-gray-900 dark:text-white">Importance</span>
          <span className="text-xl font-bold text-blue-700">
            {aggregate.avgImportance.toFixed(1)}/5
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${(aggregate.avgImportance / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Urgency */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-base font-medium text-gray-900 dark:text-white">Urgency</span>
          <span className="text-xl font-bold text-orange-700">
            {aggregate.avgUrgency.toFixed(1)}/5
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-orange-600 h-2 rounded-full transition-all"
            style={{ width: `${(aggregate.avgUrgency / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Innovation */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Innovation
          </span>
          <span className="text-xl font-bold text-yellow-600">
            {(aggregate.innovativePercentage * 100).toFixed(0)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all"
              style={{ width: `${aggregate.innovativePercentage * 100}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600">
            {aggregate.innovativeCount} marked innovative
          </span>
        </div>
      </div>

      {/* Constructiveness */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-base font-medium text-gray-900 dark:text-white">Constructiveness</span>
          <span className={`text-xl font-bold ${constructivenessColor}`}>
            {aggregate.avgConstructiveness.toFixed(1)}/3
          </span>
        </div>
        <div className="flex gap-2 mb-1">
          <div className="flex-1 text-center">
            <div className="w-4 h-4 bg-red-600 rounded-full mx-auto mb-1"></div>
            <span className="text-sm text-gray-600">{aggregate.constructivenessDistribution.red}</span>
          </div>
          <div className="flex-1 text-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-1"></div>
            <span className="text-sm text-gray-600">{aggregate.constructivenessDistribution.yellow}</span>
          </div>
          <div className="flex-1 text-center">
            <div className="w-4 h-4 bg-green-600 rounded-full mx-auto mb-1"></div>
            <span className="text-sm text-gray-600">{aggregate.constructivenessDistribution.green}</span>
          </div>
        </div>
        {aggregate.hasRedFlags && (
          <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-base text-red-800">
              ⚠️ {aggregate.redFlagCount} red flag{aggregate.redFlagCount > 1 ? 's' : ''} -
              This proposal has been flagged for moderator review
            </p>
          </div>
        )}
      </div>

      {/* Bridge AI Rating (if available) */}
      {aggregate.bridgeRating && (
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="text-blue-600">🤖</span>
            Bridge AI Assessment
          </h4>
          <div className="space-y-2 text-base">
            <div className="flex justify-between">
              <span className="text-gray-600">Clarity:</span>
              <span className="font-medium">
                {aggregate.bridgeRating.clarity === 3 ? '✅ Clear' :
                 aggregate.bridgeRating.clarity === 2 ? '⚠️ Somewhat Clear' :
                 '❌ Unclear'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Constructiveness:</span>
              <span className="font-medium">
                {aggregate.bridgeRating.constructiveness === 3 ? '✅ Constructive' :
                 aggregate.bridgeRating.constructiveness === 2 ? '⚠️ Some Issues' :
                 '❌ Needs Review'}
              </span>
            </div>
            {aggregate.bridgeRating.reasoning && (
              <p className="text-sm text-gray-600 italic mt-2">
                "{aggregate.bridgeRating.reasoning}"
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
