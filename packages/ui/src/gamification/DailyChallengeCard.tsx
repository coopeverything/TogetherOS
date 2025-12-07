'use client';

import { useState } from 'react';
import type { UserChallenge, ChallengeDefinition } from '@togetheros/types';

interface DailyChallengeCardProps {
  challenge: ChallengeDefinition;
  userChallenge?: UserChallenge;
  onComplete?: (challengeId: string) => Promise<void>;
  isLocked?: boolean;
  unlockDay?: number;
  streak?: number;
  className?: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  social: { bg: 'bg-accent-1-bg', text: 'text-accent-1', border: 'border-accent-1/30' },
  contribution: { bg: 'bg-success-bg', text: 'text-success', border: 'border-success/30' },
  exploration: { bg: 'bg-accent-3-bg', text: 'text-accent-3', border: 'border-accent-3/30' },
  growth: { bg: 'bg-joy-bg', text: 'text-joy-700', border: 'border-joy-300' },
};

const DIFFICULTY_BADGES: Record<string, { bg: string; text: string }> = {
  easy: { bg: 'bg-success-bg', text: 'text-success' },
  medium: { bg: 'bg-warning-bg', text: 'text-warning' },
  hard: { bg: 'bg-danger-bg', text: 'text-danger' },
};

const ICON_MAP: Record<string, string> = {
  wave: '👋',
  compass: '🧭',
  star: '⭐',
  chat: '💬',
  mail: '✉️',
  vote: '🗳️',
  trophy: '🏆',
  pencil: '✏️',
  hand: '🤝',
  book: '📚',
  message: '💭',
  sparkles: '✨',
  scale: '⚖️',
  user: '👤',
  globe: '🌍',
  users: '👥',
  fire: '🔥',
};

export function DailyChallengeCard({
  challenge,
  userChallenge,
  onComplete,
  isLocked = false,
  unlockDay,
  streak = 0,
  className = '',
}: DailyChallengeCardProps) {
  const [completing, setCompleting] = useState(false);

  const status = userChallenge?.status || (isLocked ? 'locked' : 'pending');
  const isCompleted = status === 'completed';
  const categoryStyle = CATEGORY_COLORS[challenge.category] || CATEGORY_COLORS.social;
  const difficultyStyle = DIFFICULTY_BADGES[challenge.difficulty] || DIFFICULTY_BADGES.easy;
  const icon = ICON_MAP[challenge.icon || ''] || '📋';

  // Calculate streak bonus preview
  const streakMultiplier = streak >= 30 ? 2.0 : streak >= 14 ? 1.5 : streak >= 7 ? 1.25 : streak >= 3 ? 1.1 : 1;
  const bonusRP = streakMultiplier > 1 ? Math.round(challenge.rpReward * (streakMultiplier - 1)) : 0;

  const handleComplete = async () => {
    if (!onComplete || isCompleted || isLocked || completing) return;
    setCompleting(true);
    try {
      await onComplete(challenge.id);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div
      className={`
        relative rounded-xl border-2 p-4 transition-all duration-200
        ${isLocked ? 'bg-bg-2 border-border opacity-60' : ''}
        ${isCompleted ? 'bg-success-bg border-success/30' : ''}
        ${!isLocked && !isCompleted ? `${categoryStyle.bg} ${categoryStyle.border}` : ''}
        ${className}
      `}
    >
      {/* Completed checkmark */}
      {isCompleted && (
        <div className="absolute top-2 right-2 text-success text-sm">✓</div>
      )}

      {/* Lock overlay */}
      {isLocked && unlockDay && (
        <div className="absolute top-2 right-2 text-ink-400 text-sm">
          🔒 Day {unlockDay}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-sm">{icon}</span>
        <div className="flex-1">
          <h3 className={`font-semibold ${isLocked ? 'text-ink-400' : 'text-ink-900'}`}>
            {challenge.name}
          </h3>
          <p className={`text-sm mt-1 ${isLocked ? 'text-ink-400' : 'text-ink-700'}`}>
            {challenge.description}
          </p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryStyle.bg} ${categoryStyle.text}`}>
          {challenge.category}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyStyle.bg} ${difficultyStyle.text}`}>
          {challenge.difficulty}
        </span>
      </div>

      {/* Reward */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-brand-600">
            +{challenge.rpReward} RP
          </span>
          {bonusRP > 0 && !isCompleted && (
            <span className="text-sm text-joy-600 flex items-center gap-1">
              <span>🔥</span>
              +{bonusRP} streak
            </span>
          )}
        </div>

        {/* Action button */}
        {!isLocked && !isCompleted && onComplete && (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="px-4 py-2 bg-brand-600 text-bg-1 text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {completing ? 'Completing...' : 'Complete'}
          </button>
        )}

        {isCompleted && userChallenge?.rpAwarded && (
          <span className="text-success font-medium">
            Earned {userChallenge.rpAwarded} RP
          </span>
        )}
      </div>

      {/* Progress bar for multi-step challenges */}
      {userChallenge?.progress?.target && userChallenge.progress.current !== undefined && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-ink-700 mb-1">
            <span>Progress</span>
            <span>{userChallenge.progress.current}/{userChallenge.progress.target}</span>
          </div>
          <div className="h-2 bg-bg-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 transition-all duration-300"
              style={{
                width: `${Math.min(100, (userChallenge.progress.current / userChallenge.progress.target) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default DailyChallengeCard;
