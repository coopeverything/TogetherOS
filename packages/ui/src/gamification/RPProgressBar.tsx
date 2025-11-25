'use client';

import { useState, useEffect } from 'react';

interface RPProgressBarProps {
  current: number;
  max: number;
  showLabels?: boolean;
  animate?: boolean;
  className?: string;
}

/**
 * Progress bar showing RP earned during onboarding
 * Animates as user completes steps
 */
export function RPProgressBar({
  current,
  max,
  showLabels = true,
  animate = true,
  className = '',
}: RPProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(animate ? 0 : (current / max) * 100);

  useEffect(() => {
    if (animate) {
      const targetProgress = (current / max) * 100;
      const duration = 500;
      const steps = 20;
      const increment = (targetProgress - displayProgress) / steps;
      let currentProgress = displayProgress;

      const timer = setInterval(() => {
        currentProgress += increment;
        if (
          (increment > 0 && currentProgress >= targetProgress) ||
          (increment < 0 && currentProgress <= targetProgress)
        ) {
          setDisplayProgress(targetProgress);
          clearInterval(timer);
        } else {
          setDisplayProgress(currentProgress);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayProgress((current / max) * 100);
    }
  }, [current, max, animate]);

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabels && (
        <div className="flex justify-between text-sm">
          <span className="text-ink-600">RP Earned</span>
          <span className="font-medium text-brand-700">
            {current} / {max} RP
          </span>
        </div>
      )}
      <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, displayProgress)}%` }}
        />
      </div>
    </div>
  );
}
