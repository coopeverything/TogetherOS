'use client';

import { useState } from 'react';
import {
  MILESTONES,
  getNextMilestone,
  calculateMilestoneProgress,
} from '@togetheros/types';
import type { Milestone, InvitationStats } from '@togetheros/types';

/**
 * GroupGrowthTracker Component
 *
 * Displays group growth progress, milestones, and invitation CTAs.
 * Based on gamification spec (docs/modules/gamification.md lines 268-296, 797-807)
 *
 * Features:
 * - Current member count with growth indicator
 * - Progress bar to next milestone
 * - Achieved milestone badges
 * - Unlock previews
 * - Invitation CTA with stats
 * - Collapsible milestone history
 */

export interface GroupGrowthTrackerProps {
  groupId: string;
  currentMemberCount: number;
  recentGrowth?: number;
  location: string;
  achievedMilestoneIds?: string[];
  invitationStats?: InvitationStats;
  onInvite?: () => void;
}

export function GroupGrowthTracker({
  groupId,
  currentMemberCount,
  recentGrowth = 0,
  location,
  achievedMilestoneIds = [],
  invitationStats,
  onInvite,
}: GroupGrowthTrackerProps) {
  const [historyExpanded, setHistoryExpanded] = useState(false);

  // Find current and next milestone using shared types
  const achievedMilestones = MILESTONES.filter(m => m.threshold <= currentMemberCount);
  const currentMilestone = achievedMilestones[achievedMilestones.length - 1];
  const nextMilestone = getNextMilestone(currentMemberCount);

  // Calculate progress using shared function
  const progress = calculateMilestoneProgress(currentMemberCount);
  const membersToGo = nextMilestone
    ? nextMilestone.threshold - currentMemberCount
    : 0;

  // Progress bar visual (custom characters from spec)
  const progressChars = Math.floor(progress / 5); // 20 chars = 100%
  const progressBar = '█'.repeat(progressChars) + '░'.repeat(20 - progressChars);

  const handleInviteClick = () => {
    if (onInvite) {
      onInvite();
    } else {
      // Placeholder for now
      alert('Invitation flow coming soon!');
    }
  };

  return (
    <div className="bg-bg-1 rounded-lg border border-border p-4 shadow-sm">
      {/* Location Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm">📍</span>
        <span className="text-sm font-medium text-ink-700 uppercase tracking-wide">
          YOUR AREA
        </span>
        <span className="text-sm font-semibold text-ink-900">[{location}]</span>
      </div>

      {/* Member Count with Growth Indicator */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-ink-900">
            {currentMemberCount}
          </span>
          <span className="text-sm text-ink-700">members</span>
          {recentGrowth > 0 && (
            <span className="text-sm font-medium text-success">
              (+{recentGrowth} ↗)
            </span>
          )}
        </div>
      </div>

      {/* Section Title */}
      <h3 className="text-sm font-semibold text-ink-900 mb-3">
        Community Growth
      </h3>

      {/* Current Milestone Badge */}
      {currentMilestone && (
        <div className="mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-success-bg text-success rounded-full text-sm font-medium">
            <span>✓</span>
            <span>{currentMilestone.label}</span>
            <span className="text-xs text-success">
              ({currentMilestone.threshold})
            </span>
          </div>
        </div>
      )}

      {/* Next Milestone and Progress */}
      {nextMilestone ? (
        <>
          <div className="mb-2">
            <span className="text-sm font-medium text-ink-700">
              Next: {nextMilestone.label}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="w-full bg-bg-2 rounded-full h-3 overflow-hidden">
              <div
                className="bg-brand-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 text-xs font-mono text-ink-400">
              {progressBar}
            </div>
          </div>

          {/* Members Remaining */}
          <div className="mb-2 text-sm text-ink-700">
            <span className="font-semibold text-ink-900">{membersToGo}</span>{' '}
            {membersToGo === 1 ? 'member' : 'members'} to go
          </div>

          {/* Unlock Preview */}
          <div className="mb-4 text-sm text-ink-700">
            <span className="font-medium text-ink-700">Unlocks:</span>{' '}
            {nextMilestone.unlocks[0]}
          </div>
        </>
      ) : (
        <div className="mb-4 p-3 bg-accent-1-bg border border-accent-1/30 rounded-lg">
          <p className="text-sm font-medium text-accent-1">
            🎉 Max milestone reached!
          </p>
          <p className="text-xs text-accent-1 mt-1">
            Your community is a regional powerhouse. Keep growing!
          </p>
        </div>
      )}

      {/* Invitation CTA */}
      {nextMilestone?.actionNudge && (
        <div className="mb-4">
          <button
            onClick={handleInviteClick}
            className="w-full px-4 py-2.5 bg-joy-500 text-white text-sm font-medium rounded-full hover:bg-joy-600 transition-colors"
          >
            {nextMilestone.actionNudge.text} {location} (+
            {nextMilestone.actionNudge.reward} RP)
          </button>
          {invitationStats && (
            <div className="mt-2 flex items-center justify-between text-xs text-ink-400">
              <span>
                {invitationStats.sentThisWeek}/{invitationStats.weeklyLimit} invites this week
              </span>
              <span className="text-success">
                {Math.round(invitationStats.qualityScore * 100)}% quality
              </span>
            </div>
          )}
        </div>
      )}

      {/* Milestone History (Collapsible) */}
      <div className="border-t border-border pt-3">
        <button
          onClick={() => setHistoryExpanded(!historyExpanded)}
          className="flex items-center justify-between w-full text-sm font-medium text-ink-700 hover:text-ink-900"
        >
          <span>Milestone History</span>
          <span className="text-ink-400">{historyExpanded ? '▲' : '▼'}</span>
        </button>

        {historyExpanded && (
          <div className="mt-3 space-y-2">
            {achievedMilestones.length === 0 ? (
              <p className="text-xs text-ink-400 italic">
                No milestones achieved yet. Keep growing!
              </p>
            ) : (
              achievedMilestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-start gap-2 text-xs"
                >
                  <span className="text-success mt-0.5">✓</span>
                  <div>
                    <p className="font-medium text-ink-900">
                      {milestone.label} ({milestone.threshold} members)
                    </p>
                    <p className="text-ink-700">{milestone.celebration}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupGrowthTracker;
