'use client';

import { useState, useEffect } from 'react';

interface RPEarnedAnimationProps {
  amount: number;
  label?: string;
  onComplete?: () => void;
  className?: string;
}

/**
 * Animated RP earned notification
 * Shows a floating +RP badge that fades out after a few seconds
 */
export function RPEarnedAnimation({
  amount,
  label,
  onComplete,
  className = '',
}: RPEarnedAnimationProps) {
  const [visible, setVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'visible' | 'exit'>('enter');

  useEffect(() => {
    // Entry animation
    const enterTimer = setTimeout(() => {
      setAnimationPhase('visible');
    }, 100);

    // Start exit animation
    const exitTimer = setTimeout(() => {
      setAnimationPhase('exit');
    }, 2500);

    // Remove from DOM
    const removeTimer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      className={`
        fixed top-20 left-1/2 -translate-x-1/2 z-50
        transition-all duration-500 ease-out
        ${animationPhase === 'enter' ? 'opacity-0 -translate-y-4' : ''}
        ${animationPhase === 'visible' ? 'opacity-100 translate-y-0' : ''}
        ${animationPhase === 'exit' ? 'opacity-0 translate-y-4' : ''}
        ${className}
      `}
    >
      <div className="bg-brand-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
        <span className="text-2xl">🎉</span>
        <div>
          <span className="text-xl font-bold">+{amount} RP</span>
          {label && <span className="ml-2 text-brand-100">{label}</span>}
        </div>
      </div>
    </div>
  );
}
