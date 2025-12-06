'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Milestone, PendingCelebration } from '@togetheros/types';

/**
 * MilestoneCelebration Component
 *
 * Animated celebration modal for milestone achievements.
 * Based on gamification spec (docs/modules/gamification.md lines 313-505)
 *
 * Features:
 * - Four-state animation machine: entering → active → actionPrompt → exiting
 * - Respects prefers-reduced-motion
 * - Always skippable (button, ESC key, click outside)
 * - Screen reader accessible
 * - Action nudge with RP reward display
 */

type AnimationState = 'idle' | 'entering' | 'active' | 'actionPrompt' | 'exiting';

export interface MilestoneCelebrationProps {
  celebration: PendingCelebration;
  onComplete: (milestoneId: string, actionTaken: boolean) => void;
  onSkip?: () => void;
}

/**
 * Hook to detect prefers-reduced-motion
 */
function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

export function MilestoneCelebration({
  celebration,
  onComplete,
  onSkip,
}: MilestoneCelebrationProps) {
  const [state, setState] = useState<AnimationState>('entering');
  const prefersReducedMotion = usePrefersReducedMotion();

  const milestone = celebration.milestone;

  // Handle ESC key to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // State timing machine
  useEffect(() => {
    if (prefersReducedMotion) {
      setState('actionPrompt');
      return;
    }

    const timings: Partial<Record<AnimationState, number>> = {
      entering: 800,
      active: 2000,
    };

    const currentTiming = timings[state];
    if (!currentTiming) return;

    const timer = setTimeout(() => {
      if (state === 'entering') setState('active');
      else if (state === 'active') setState('actionPrompt');
    }, currentTiming);

    return () => clearTimeout(timer);
  }, [state, prefersReducedMotion]);

  const handleSkip = useCallback(() => {
    setState('exiting');
    setTimeout(() => {
      onComplete(celebration.milestoneId, false);
      onSkip?.();
    }, prefersReducedMotion ? 0 : 500);
  }, [celebration.milestoneId, onComplete, onSkip, prefersReducedMotion]);

  const handleAction = useCallback(() => {
    setState('exiting');
    setTimeout(() => {
      onComplete(celebration.milestoneId, true);
    }, prefersReducedMotion ? 0 : 500);
  }, [celebration.milestoneId, onComplete, prefersReducedMotion]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleSkip();
    }
  };

  if (state === 'idle' || !milestone) return null;

  // Animation classes based on state
  const backdropClass = prefersReducedMotion
    ? 'opacity-100'
    : state === 'exiting'
    ? 'opacity-0 transition-opacity duration-500'
    : 'opacity-100 transition-opacity duration-300';

  const modalClass = prefersReducedMotion
    ? ''
    : state === 'entering'
    ? 'scale-90 opacity-0 animate-bounce'
    : state === 'exiting'
    ? 'scale-90 opacity-0 transition-all duration-500'
    : 'scale-100 opacity-100 transition-all duration-300';

  const emojiClass = prefersReducedMotion
    ? ''
    : state === 'active'
    ? 'animate-pulse'
    : '';

  return (
    <>
      {/* Screen reader announcement */}
      <div role="status" aria-live="polite" className="sr-only">
        Milestone achieved: {milestone.label}. {milestone.celebration}
      </div>

      {/* Modal backdrop */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${backdropClass}`}
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebration-title"
      >
        {/* Modal content */}
        <div
          className={`bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 shadow-2xl ${modalClass}`}
        >
          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            aria-label="Skip celebration"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Celebration emoji */}
          <div className={`text-6xl mb-4 text-center ${emojiClass}`}>
            🎉
          </div>

          {/* Group name */}
          <p className="text-base text-gray-500 text-center mb-1">
            {celebration.groupName}
          </p>

          {/* Milestone label */}
          <h2
            id="celebration-title"
            className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2"
          >
            {milestone.label}
          </h2>

          {/* Member count badge */}
          <div className="flex justify-center mb-4">
            <span className="px-3 py-1.5 bg-green-100 text-green-800 text-base font-medium rounded-full">
              {celebration.memberCount} members
            </span>
          </div>

          {/* Celebration message */}
          <p className="text-center text-gray-700 mb-6">
            {milestone.celebration}
          </p>

          {/* Unlocks preview */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
            <p className="text-base font-medium text-gray-700 mb-2">🔓 Now unlocked:</p>
            <ul className="space-y-1">
              {milestone.unlocks.map((unlock, i) => (
                <li key={i} className="text-base text-gray-600 flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {unlock}
                </li>
              ))}
            </ul>
          </div>

          {/* Action nudge */}
          {(state === 'actionPrompt' || prefersReducedMotion) && milestone.actionNudge && (
            <div
              className={`bg-orange-50 border border-orange-200 rounded-lg p-4 ${
                prefersReducedMotion ? '' : 'animate-fade-in'
              }`}
            >
              <p className="text-base font-medium text-gray-900 dark:text-white mb-3">
                {milestone.actionNudge.text}
              </p>
              <button
                onClick={handleAction}
                className="w-full bg-orange-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-700 transition-colors"
              >
                Yes, I'll do it! (+{milestone.actionNudge.reward} RP)
              </button>
            </div>
          )}

          {/* Continue button (if no action nudge or after waiting) */}
          {(state === 'actionPrompt' || prefersReducedMotion) && !milestone.actionNudge && (
            <button
              onClick={handleSkip}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Continue
            </button>
          )}

          {/* Skip link for action nudge */}
          {(state === 'actionPrompt' || prefersReducedMotion) && milestone.actionNudge && (
            <button
              onClick={handleSkip}
              className="w-full mt-2 text-base text-gray-500 hover:text-gray-700"
            >
              Maybe later
            </button>
          )}
        </div>
      </div>

    </>
  );
}

export default MilestoneCelebration;
