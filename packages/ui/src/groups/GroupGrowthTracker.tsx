'use client';

import { useState } from 'react';
import type { Milestone, GroupGrowthData } from '@togetheros/types';

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
 * - Invitation CTA
 * - Collapsible milestone history
 */

export interface GroupGrowthTrackerProps {
  groupId: string;
  currentMemberCount: number;
  recentGrowth?: number;
  location: string;
  achievedMilestoneIds?: string[];
  onInvite?: () => void;
}

// Milestone definitions from gamification spec (lines 300-310)
const MILESTONES: Milestone[] = [
  {
    id: 'community-ready',
    threshold: 5,
    label: 'Community Ready',
    celebration: 'Your group is officially active!',
    unlocks: ['Basic group features', 'Post creation', 'Member discussions'],
  },
  {
    id: 'active-network',
    threshold: 15,
    label: 'Active Network',
    celebration: 'Your community is growing strong!',
    unlocks: ['Federated partnerships', 'Inter-group proposals', 'Resource sharing'],
    actionNudge: {
      text: 'Invite someone in',
      reward: 25,
    },
  },
  {
    id: 'thriving-hub',
    threshold: 25,
    label: 'Thriving Hub',
    celebration: 'You\'re building something special!',
    unlocks: ['Priority visibility', 'Featured group status', 'Cross-group events'],
    actionNudge: {
      text: 'Invite someone in',
      reward: 50,
    },
  },
  {
    id: 'established-community',
    threshold: 50,
    label: 'Established Community',
    celebration: 'Your community is flourishing!',
    unlocks: ['Advanced governance tools', 'Subgroup creation', 'Regional partnerships'],
    actionNudge: {
      text: 'Invite someone in',
      reward: 100,
    },
  },
  {
    id: 'major-hub',
    threshold: 100,
    label: 'Major Hub',
    celebration: 'You\'re a major force for cooperation!',
    unlocks: ['Leadership training', 'Resource distribution', 'Movement building'],
    actionNudge: {
      text: 'Invite someone in',
      reward: 200,
    },
  },
  {
    id: 'regional-powerhouse',
    threshold: 150,
    label: 'Regional Powerhouse',
    celebration: 'Your community is a model for others!',
    unlocks: ['National federation', 'Policy influence', 'Solidarity economy'],
    actionNudge: {
      text: 'Invite someone in',
      reward: 300,
    },
  },
];

export function GroupGrowthTracker({
  groupId,
  currentMemberCount,
  recentGrowth = 0,
  location,
  achievedMilestoneIds = [],
  onInvite,
}: GroupGrowthTrackerProps) {
  const [historyExpanded, setHistoryExpanded] = useState(false);

  // Find current and next milestone
  const achievedMilestones = MILESTONES.filter(m => m.threshold <= currentMemberCount);
  const currentMilestone = achievedMilestones[achievedMilestones.length - 1];
  const nextMilestone = MILESTONES.find(m => m.threshold > currentMemberCount);

  // Calculate progress to next milestone
  const calculateProgress = (): number => {
    if (!nextMilestone) return 100; // Max milestone reached
    if (!currentMilestone) {
      // Before first milestone
      return (currentMemberCount / nextMilestone.threshold) * 100;
    }
    const progress =
      ((currentMemberCount - currentMilestone.threshold) /
        (nextMilestone.threshold - currentMilestone.threshold)) *
      100;
    return Math.min(100, Math.max(0, progress));
  };

  const progress = calculateProgress();
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
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      {/* Location Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📍</span>
        <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">
          YOUR AREA
        </span>
        <span className="text-sm font-semibold text-gray-900">[{location}]</span>
      </div>

      {/* Member Count with Growth Indicator */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">
            {currentMemberCount}
          </span>
          <span className="text-sm text-gray-600">members</span>
          {recentGrowth > 0 && (
            <span className="text-sm font-medium text-green-600">
              (+{recentGrowth} ↗)
            </span>
          )}
        </div>
      </div>

      {/* Section Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Community Growth
      </h3>

      {/* Current Milestone Badge */}
      {currentMilestone && (
        <div className="mb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <span>✓</span>
            <span>{currentMilestone.label}</span>
            <span className="text-xs text-green-600">
              ({currentMilestone.threshold})
            </span>
          </div>
        </div>
      )}

      {/* Next Milestone and Progress */}
      {nextMilestone ? (
        <>
          <div className="mb-2">
            <span className="text-sm font-medium text-gray-700">
              Next: {nextMilestone.label}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 text-xs font-mono text-gray-500">
              {progressBar}
            </div>
          </div>

          {/* Members Remaining */}
          <div className="mb-2 text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{membersToGo}</span>{' '}
            {membersToGo === 1 ? 'member' : 'members'} to go
          </div>

          {/* Unlock Preview */}
          <div className="mb-4 text-sm text-gray-600">
            <span className="font-medium text-gray-700">Unlocks:</span>{' '}
            {nextMilestone.unlocks[0]}
          </div>
        </>
      ) : (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm font-medium text-purple-900">
            🎉 Max milestone reached!
          </p>
          <p className="text-xs text-purple-700 mt-1">
            Your community is a regional powerhouse. Keep growing!
          </p>
        </div>
      )}

      {/* Invitation CTA */}
      {nextMilestone?.actionNudge && (
        <button
          onClick={handleInviteClick}
          className="w-full px-4 py-2.5 bg-orange-600 text-white text-sm font-medium rounded-full hover:bg-orange-700 transition-colors mb-4"
        >
          {nextMilestone.actionNudge.text} {location} (+
          {nextMilestone.actionNudge.reward} RP)
        </button>
      )}

      {/* Milestone History (Collapsible) */}
      <div className="border-t border-gray-200 pt-3">
        <button
          onClick={() => setHistoryExpanded(!historyExpanded)}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <span>Milestone History</span>
          <span className="text-gray-400">{historyExpanded ? '▲' : '▼'}</span>
        </button>

        {historyExpanded && (
          <div className="mt-3 space-y-2">
            {achievedMilestones.length === 0 ? (
              <p className="text-xs text-gray-500 italic">
                No milestones achieved yet. Keep growing!
              </p>
            ) : (
              achievedMilestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-start gap-2 text-xs"
                >
                  <span className="text-green-600 mt-0.5">✓</span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {milestone.label} ({milestone.threshold} members)
                    </p>
                    <p className="text-gray-600">{milestone.celebration}</p>
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
