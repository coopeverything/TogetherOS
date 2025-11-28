'use client';

import { cn } from '@/lib/utils';
import type { UnlockLevelId } from '../../lib/unlock/levels';
import { isFeatureVisible, getFeatureTeaser, getUnlockHint, UNLOCK_LEVELS } from '../../lib/unlock/levels';

interface LockedSectionProps {
  /** The feature this section represents */
  feature: string;
  /** User's current unlock level */
  userLevel: UnlockLevelId;
  /** Override teaser text */
  teaser?: string;
  /** Override unlock hint */
  unlockHint?: string;
  /** Content to show when unlocked */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Style variant */
  variant?: 'card' | 'inline' | 'full';
}

/**
 * LockedSection Component
 *
 * Wraps content that should only be visible once user reaches
 * a certain unlock level. Shows a mysterious teaser when locked.
 *
 * @example
 * <LockedSection feature="feed-preview" userLevel={user.unlockLevel}>
 *   <Feed />
 * </LockedSection>
 */
export function LockedSection({
  feature,
  userLevel,
  teaser,
  unlockHint,
  children,
  className,
  variant = 'card',
}: LockedSectionProps) {
  const isUnlocked = isFeatureVisible(feature, userLevel);

  // If unlocked, show the content
  if (isUnlocked) {
    return <>{children}</>;
  }

  // Get teaser and hint (use overrides if provided)
  const displayTeaser = teaser || getFeatureTeaser(feature) || 'Something awaits...';
  const displayHint = unlockHint || getUnlockHint(feature) || 'Keep exploring to unlock';

  // Find the minimum level needed
  const nextMilestone = Object.values(UNLOCK_LEVELS).find(
    (level) => level.id > userLevel
  );

  if (variant === 'inline') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-1 rounded bg-bg-3 text-ink-500',
          className
        )}
        title={displayHint}
      >
        <span className="text-lg">?</span>
        <span className="text-sm">{displayTeaser}</span>
      </span>
    );
  }

  if (variant === 'full') {
    return (
      <div
        className={cn(
          'min-h-[50vh] flex flex-col items-center justify-center p-8',
          'bg-gradient-to-b from-bg-2 to-bg-1',
          className
        )}
      >
        <div className="text-6xl mb-6 opacity-50">?</div>
        <h2 className="text-2xl font-semibold text-ink-700 mb-2">
          {displayTeaser}
        </h2>
        <p className="text-ink-500 text-center max-w-md mb-6">
          {displayHint}
        </p>
        {nextMilestone && (
          <div className="px-4 py-2 bg-brand-50 rounded-lg text-sm text-brand-700">
            Next unlock: <strong>{nextMilestone.name}</strong>
          </div>
        )}
      </div>
    );
  }

  // Default: card variant
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border',
        'bg-gradient-to-br from-bg-2 via-bg-1 to-bg-2',
        'p-6',
        className
      )}
    >
      {/* Mysterious blur overlay */}
      <div className="absolute inset-0 backdrop-blur-sm bg-bg-1/30" />

      {/* Lock icon and content */}
      <div className="relative z-10 flex flex-col items-center justify-center py-8">
        <div className="w-16 h-16 rounded-full bg-bg-3 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-ink-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <p className="text-lg text-ink-600 font-medium mb-2 text-center">
          {displayTeaser}
        </p>

        <p className="text-sm text-ink-500 text-center max-w-xs">
          {displayHint}
        </p>

        {nextMilestone && (
          <div className="mt-4 px-3 py-1.5 bg-brand-50 rounded-full text-xs text-brand-700">
            Level {nextMilestone.id}: {nextMilestone.name}
          </div>
        )}
      </div>

      {/* Teaser glimpse of content (highly blurred) */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}

export default LockedSection;
