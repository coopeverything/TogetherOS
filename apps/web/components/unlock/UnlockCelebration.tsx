'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { UnlockLevelId } from '../../lib/unlock/levels';
import { UNLOCK_LEVELS } from '../../lib/unlock/levels';
import { Button } from '@/components/ui/button';

interface UnlockCelebrationProps {
  /** The level that was just unlocked */
  level: UnlockLevelId;
  /** Whether to show the celebration */
  show: boolean;
  /** Callback when celebration is dismissed */
  onDismiss: () => void;
  /** Callback when user clicks to explore */
  onExplore?: () => void;
}

/**
 * UnlockCelebration Component
 *
 * Full-screen celebration modal when user unlocks a new level.
 * Includes confetti animation and level-up message.
 *
 * @example
 * <UnlockCelebration
 *   level={2}
 *   show={showCelebration}
 *   onDismiss={() => setShowCelebration(false)}
 * />
 */
export function UnlockCelebration({
  level,
  show,
  onDismiss,
  onExplore,
}: UnlockCelebrationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([]);

  const levelInfo = UNLOCK_LEVELS[level];

  // Generate confetti on show
  useEffect(() => {
    if (show) {
      const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
      const newConfetti = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
      setConfetti(newConfetti);
    } else {
      setConfetti([]);
    }
  }, [show]);

  const handleExplore = useCallback(() => {
    if (onExplore) {
      onExplore();
    }
    onDismiss();
  }, [onExplore, onDismiss]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unlock-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onDismiss}
      />

      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map(({ id, left, delay, color }) => (
          <div
            key={id}
            className="absolute w-3 h-3 animate-confetti-fall"
            style={{
              left: `${left}%`,
              backgroundColor: color,
              animationDelay: `${delay}s`,
              borderRadius: Math.random() > 0.5 ? '50%' : '0',
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>

      {/* Celebration card */}
      <div
        className={cn(
          'relative z-10 w-full max-w-md mx-4',
          'bg-white dark:bg-gray-800 rounded-2xl shadow-2xl',
          'animate-bounce-in overflow-hidden'
        )}
      >
        {/* Header with level badge */}
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white dark:bg-gray-800/20 rounded-full mb-4">
            <span className="text-4xl font-bold text-white">
              {level}
            </span>
          </div>
          <h2
            id="unlock-title"
            className="text-3xl font-bold text-white mb-1"
          >
            Level Up!
          </h2>
          <p className="text-brand-100 text-xl">
            {levelInfo.name}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-center text-ink-600 mb-4">
            {levelInfo.description}
          </p>

          {/* What's unlocked */}
          <div className="bg-brand-50 rounded-xl p-4 mb-6">
            <h3 className="text-base font-semibold text-brand-700 uppercase tracking-wide mb-3">
              New Features Unlocked
            </h3>
            <ul className="space-y-2">
              {levelInfo.unlocks.map((unlock, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-base text-ink-700"
                >
                  <svg
                    className="w-5 h-5 text-green-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {unlock}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onDismiss}
            >
              Continue
            </Button>
            {onExplore && (
              <Button
                className="flex-1"
                onClick={handleExplore}
              >
                Explore Now
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-confetti-fall {
          animation: confetti-fall 3s ease-out forwards;
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default UnlockCelebration;
