'use client';

import { useState, useEffect } from 'react';
import type { FirstWeekSummary, FirstWeekDay, ChallengeDefinition } from '@togetheros/types';
import { DailyChallengeCard } from './DailyChallengeCard';

interface FirstWeekJourneyProps {
  userId: string;
  onChallengeComplete?: (challengeId: string, result: any) => void;
  className?: string;
}

const DAY_LABELS = [
  'Welcome',
  'Explore',
  'Share',
  'Connect',
  'Invite',
  'Engage',
  'Complete',
];

export function FirstWeekJourney({
  userId,
  onChallengeComplete,
  className = '',
}: FirstWeekJourneyProps) {
  const [summary, setSummary] = useState<FirstWeekSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  useEffect(() => {
    fetchProgress();
  }, [userId]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/challenges/first-week?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch progress');
      }

      if (data.initialized) {
        setSummary(data.progress);
        // Auto-expand current day
        setExpandedDay(data.progress.currentDay);
      } else {
        // Initialize first-week journey
        const initResponse = await fetch('/api/challenges/first-week', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        const initData = await initResponse.json();
        if (initResponse.ok) {
          fetchProgress(); // Refetch after init
        } else {
          throw new Error(initData.error || 'Failed to initialize journey');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    try {
      const response = await fetch(`/api/challenges/${challengeId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to complete challenge');
      }

      onChallengeComplete?.(challengeId, result);
      fetchProgress(); // Refresh data
    } catch (err: any) {
      console.error('Complete challenge error:', err);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-bg-2 rounded w-48 mb-4"></div>
        <div className="flex gap-2 mb-3">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="w-10 h-10 bg-bg-2 rounded-full"></div>
          ))}
        </div>
        <div className="h-32 bg-bg-2 rounded-xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-danger-bg border border-danger/30 rounded-xl p-4 ${className}`}>
        <p className="text-danger">Error: {error}</p>
        <button
          onClick={fetchProgress}
          className="mt-2 text-danger underline text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!summary) return null;

  const completedCount = summary.days.filter((d) => d.status === 'completed').length;
  const progressPercent = (completedCount / 7) * 100;

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-ink-900">First Week Journey</h2>
          <p className="text-sm text-ink-700">
            Complete daily challenges to earn RP and unlock bonuses
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-brand-600">
            {summary.totalRPEarned} RP
          </span>
          {summary.streakBonusRP > 0 && (
            <p className="text-xs text-joy-600">
              +{summary.streakBonusRP} bonus
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-ink-700 mb-2">
          <span>{completedCount}/7 days completed</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-3 bg-bg-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Day indicators */}
      <div className="flex justify-between mb-3">
        {summary.days.map((day, index) => {
          const isActive = day.dayNumber === expandedDay;
          const isCompleted = day.status === 'completed';
          const isAvailable = day.status === 'available';
          const isLocked = day.status === 'locked';

          return (
            <button
              key={day.dayNumber}
              onClick={() => !isLocked && setExpandedDay(day.dayNumber)}
              disabled={isLocked}
              className={`
                flex flex-col items-center gap-1 transition-all
                ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm
                  transition-all duration-200
                  ${isCompleted ? 'bg-success text-bg-1' : ''}
                  ${isAvailable && !isActive ? 'bg-brand-bg text-brand-600 ring-2 ring-brand-300' : ''}
                  ${isActive && !isCompleted ? 'bg-brand-600 text-bg-1 ring-2 ring-brand-300' : ''}
                  ${isLocked ? 'bg-bg-2 text-ink-400' : ''}
                `}
              >
                {isCompleted ? '✓' : day.dayNumber}
              </div>
              <span className={`text-xs ${isActive ? 'text-brand-600 font-medium' : 'text-ink-400'}`}>
                {DAY_LABELS[index]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Completion celebration */}
      {summary.isComplete && (
        <div className="bg-success-bg border border-success/30 rounded-xl p-4 mb-3 text-center">
          <span className="text-sm mb-3 block">🎉</span>
          <h3 className="text-sm font-bold text-success mb-2">
            First Week Complete!
          </h3>
          <p className="text-success">
            You earned <strong>{summary.totalRPEarned} RP</strong> including a{' '}
            <strong>100 RP</strong> completion bonus!
          </p>
        </div>
      )}

      {/* Expanded day challenge */}
      {expandedDay && !summary.isComplete && (
        <div className="transition-all duration-300">
          {summary.days
            .filter((d) => d.dayNumber === expandedDay)
            .map((day) => (
              <DailyChallengeCard
                key={day.dayNumber}
                challenge={day.challenge}
                isLocked={day.status === 'locked'}
                unlockDay={day.dayNumber}
                onComplete={
                  day.status === 'available' ? handleCompleteChallenge : undefined
                }
                userChallenge={
                  day.status === 'completed'
                    ? {
                        id: '',
                        userId,
                        challengeId: day.challenge.id,
                        assignedDate: new Date(),
                        status: 'completed',
                        completedAt: day.completedAt,
                        progress: {},
                        rpAwarded: day.rpEarned,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                      }
                    : undefined
                }
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default FirstWeekJourney;
