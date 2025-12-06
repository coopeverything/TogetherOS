'use client';

import type { InvitationStats } from '@togetheros/types';
import { INVITATION_QUALITY_THRESHOLDS } from '@togetheros/types';

export interface InviteStatsProps {
  stats: InvitationStats;
  className?: string;
}

export function InviteStats({ stats, className = '' }: InviteStatsProps) {
  const qualityPercent = Math.round(stats.qualityScore * 100);
  const acceptanceRate = stats.totalSent > 0
    ? Math.round((stats.totalAccepted / stats.totalSent) * 100)
    : 0;

  const getQualityColor = () => {
    if (stats.qualityScore >= INVITATION_QUALITY_THRESHOLDS.GOOD) return 'text-green-600';
    if (stats.qualityScore >= INVITATION_QUALITY_THRESHOLDS.WARNING) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityLabel = () => {
    if (stats.qualityScore >= INVITATION_QUALITY_THRESHOLDS.GOOD) return 'Excellent';
    if (stats.qualityScore >= INVITATION_QUALITY_THRESHOLDS.WARNING) return 'Good';
    if (stats.qualityScore >= INVITATION_QUALITY_THRESHOLDS.SUSPENSION) return 'Needs Improvement';
    return 'At Risk';
  };

  const remainingThisWeek = stats.weeklyLimit - stats.sentThisWeek;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Your Invitation Stats</h3>

      {/* Quality Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">Quality Score</span>
          <span className={`text-sm font-bold ${getQualityColor()}`}>
            {qualityPercent}% - {getQualityLabel()}
          </span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              stats.qualityScore >= INVITATION_QUALITY_THRESHOLDS.GOOD
                ? 'bg-green-500'
                : stats.qualityScore >= INVITATION_QUALITY_THRESHOLDS.WARNING
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, qualityPercent)}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Based on invitees who become active members
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 text-center">
          <div className="text-sm font-bold text-gray-900 dark:text-white">{stats.totalSent}</div>
          <div className="text-xs text-gray-500">Sent</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 text-center">
          <div className="text-sm font-bold text-green-600">{stats.totalAccepted}</div>
          <div className="text-xs text-gray-500">Accepted</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 text-center">
          <div className="text-sm font-bold text-brand-600">{stats.totalContributed}</div>
          <div className="text-xs text-gray-500">Active</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 text-center">
          <div className="text-sm font-bold text-gray-900 dark:text-white">{acceptanceRate}%</div>
          <div className="text-xs text-gray-500">Accept Rate</div>
        </div>
      </div>

      {/* Weekly Limit */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Remaining this week</span>
          <span className={`text-sm font-medium ${remainingThisWeek > 0 ? 'text-gray-900 dark:text-white' : 'text-red-600'}`}>
            {remainingThisWeek} / {stats.weeklyLimit}
          </span>
        </div>
        {remainingThisWeek === 0 && (
          <p className="text-xs text-red-500 mt-1">
            Weekly limit reached. Resets Monday.
          </p>
        )}
      </div>
    </div>
  );
}

export default InviteStats;
