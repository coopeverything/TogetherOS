'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { UnlockLevelId } from '../../lib/unlock/levels';
import { isFeatureVisible, getUnlockHint } from '../../lib/unlock/levels';

interface MysteryRevealProps {
  /** The feature this reveal represents */
  feature: string;
  /** User's current unlock level */
  userLevel: UnlockLevelId;
  /** The actual value to reveal */
  value: string | number;
  /** Label to show with the value (e.g., "people", "groups") */
  label?: string;
  /** Whether to animate the reveal on hover */
  hoverReveal?: boolean;
  /** Custom className */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * MysteryReveal Component
 *
 * Shows tantalizing numbers or text without full context.
 * When locked: shows blurred or obscured value
 * When unlocked: reveals the full value
 *
 * @example
 * <MysteryReveal
 *   feature="member-count"
 *   userLevel={2}
 *   value={127}
 *   label="people are already here"
 * />
 */
export function MysteryReveal({
  feature,
  userLevel,
  value,
  label,
  hoverReveal = true,
  className,
  size = 'md',
}: MysteryRevealProps) {
  const isUnlocked = isFeatureVisible(feature, userLevel);
  const [isHovered, setIsHovered] = useState(false);
  const [displayValue, setDisplayValue] = useState<string | number>(value);

  // Animate counting up when revealed
  useEffect(() => {
    if (!isUnlocked || typeof value !== 'number') {
      setDisplayValue(value);
      return;
    }

    // Animate counting up
    const duration = 1000; // 1 second
    const steps = 30;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, isUnlocked]);

  const unlockHint = getUnlockHint(feature);

  const sizeClasses = {
    sm: {
      value: 'text-xl',
      label: 'text-xs',
    },
    md: {
      value: 'text-4xl',
      label: 'text-sm',
    },
    lg: {
      value: 'text-6xl',
      label: 'text-base',
    },
  };

  if (isUnlocked) {
    return (
      <div className={cn('text-center', className)}>
        <span className={cn('font-bold text-ink-900', sizeClasses[size].value)}>
          {displayValue}
        </span>
        {label && (
          <span className={cn('block text-ink-600 mt-1', sizeClasses[size].label)}>
            {label}
          </span>
        )}
      </div>
    );
  }

  // Locked state
  return (
    <div
      className={cn('text-center cursor-help group', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={unlockHint}
    >
      <div className="relative inline-block">
        <span
          className={cn(
            'font-bold transition-all duration-300',
            sizeClasses[size].value,
            isHovered && hoverReveal
              ? 'blur-[2px] text-brand-600'
              : 'blur-[6px] text-ink-600',
          )}
        >
          {value}
        </span>

        {/* Mystery overlay */}
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            'font-bold text-brand-600 opacity-0 transition-opacity',
            isHovered && hoverReveal && 'opacity-100',
            sizeClasses[size].value,
          )}
        >
          ???
        </span>
      </div>

      {label && (
        <span className={cn('block text-ink-500 mt-1', sizeClasses[size].label)}>
          {label}
        </span>
      )}

      {/* Unlock hint on hover */}
      {isHovered && unlockHint && (
        <div className="mt-2 px-3 py-1 bg-brand-50 rounded-lg text-xs text-brand-700 animate-fade-in">
          {unlockHint}
        </div>
      )}
    </div>
  );
}

export default MysteryReveal;
