/**
 * Recommendation Card Component
 * Displays a single recommendation with action buttons
 */

import * as React from 'react';
import type { Recommendation } from '@togetheros/types';

export interface RecommendationCardProps {
  recommendation: Recommendation;
  onTakeAction?: (id: string) => void | Promise<void>;
  onDismiss?: (id: string) => void | Promise<void>;
  loading?: boolean;
}

export function RecommendationCard({
  recommendation,
  onTakeAction,
  onDismiss,
  loading = false,
}: RecommendationCardProps) {
  const urgencyColors = {
    low: 'bg-green-50 border-green-200 text-green-700',
    medium: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    high: 'bg-red-50 border-red-200 text-red-700',
  };

  const urgencyColor = urgencyColors[recommendation.urgency || 'medium'];

  const typeLabels: Record<string, string> = {
    local_group: 'Local Group',
    event: 'Event',
    discussion: 'Discussion',
    activity: 'Activity',
    thematic_group: 'Thematic Group',
    social_share: 'Social Share',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {typeLabels[recommendation.type] || recommendation.type}
          </span>

          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${urgencyColor}`}>
            {recommendation.urgency?.toUpperCase() || 'NORMAL'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-medium">{recommendation.relevanceScore}</span>
          <span className="text-gray-400">/ 100</span>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {recommendation.title}
      </h3>
      <p className="text-gray-700 mb-4">{recommendation.description}</p>

      {/* Metadata */}
      <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
        {recommendation.matchedInterests.length > 0 && (
          <div>
            <span className="font-medium">Matches:</span>{' '}
            {recommendation.matchedInterests.slice(0, 3).join(', ')}
            {recommendation.matchedInterests.length > 3 && ` +${recommendation.matchedInterests.length - 3} more`}
          </div>
        )}

        {recommendation.rewardPoints && (
          <div className="flex items-center gap-1">
            <span className="font-medium">Reward:</span>
            <span className="text-green-600 font-semibold">{recommendation.rewardPoints} RPs</span>
          </div>
        )}

        {recommendation.cityContext && (
          <div>
            <span className="font-medium">Location:</span> {recommendation.cityContext}
          </div>
        )}
      </div>

      {/* Actions */}
      {recommendation.status === 'pending' && (onTakeAction || onDismiss) && (
        <div className="flex gap-3">
          {onTakeAction && (
            <button
              onClick={() => onTakeAction(recommendation.id)}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Loading...' : 'Take Action'}
            </button>
          )}

          {onDismiss && (
            <button
              onClick={() => onDismiss(recommendation.id)}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Status indicator for non-pending recommendations */}
      {recommendation.status !== 'pending' && (
        <div className="pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-500">
            Status: <span className="font-medium capitalize">{recommendation.status.replace('_', ' ')}</span>
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Recommendation List Component
 */
export interface RecommendationListProps {
  recommendations: Recommendation[];
  onTakeAction?: (id: string) => void | Promise<void>;
  onDismiss?: (id: string) => void | Promise<void>;
  loading?: boolean;
  emptyMessage?: string;
}

export function RecommendationList({
  recommendations,
  onTakeAction,
  onDismiss,
  loading = false,
  emptyMessage = 'No recommendations available',
}: RecommendationListProps) {
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((rec) => (
        <RecommendationCard
          key={rec.id}
          recommendation={rec}
          onTakeAction={onTakeAction}
          onDismiss={onDismiss}
          loading={loading}
        />
      ))}
    </div>
  );
}
