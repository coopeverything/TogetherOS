'use client';

import { useState, useEffect } from 'react';
import type { UserChallenge } from '@togetheros/types';
import { DailyChallengeCard } from './DailyChallengeCard';

interface DailyChallengeListProps {
  userId: string;
  onChallengeComplete?: (challengeId: string, result: any) => void;
  className?: string;
}

export function DailyChallengeList({
  userId,
  onChallengeComplete,
  className = '',
}: DailyChallengeListProps) {
  const [challenges, setChallenges] = useState<UserChallenge[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChallenges();
  }, [userId]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/challenges/daily?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch challenges');
      }

      setChallenges(data.challenges || []);
      setStreak(data.streak || 0);

      // If no challenges assigned today, get some
      if (data.challenges?.length === 0) {
        const assignResponse = await fetch('/api/challenges/daily', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, count: 3 }),
        });
        const assignData = await assignResponse.json();
        if (assignResponse.ok) {
          fetchChallenges(); // Refetch after assigning
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
      fetchChallenges(); // Refresh data
    } catch (err: any) {
      console.error('Complete challenge error:', err);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-xl p-4 ${className}`}>
        <p className="text-red-700">Error: {error}</p>
        <button
          onClick={fetchChallenges}
          className="mt-2 text-red-600 underline text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  const completedCount = challenges.filter((c) => c.status === 'completed').length;
  const totalRP = challenges.reduce((sum, c) => sum + (c.rpAwarded || 0), 0);

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Daily Challenges</h2>
          <p className="text-sm text-gray-600">
            {completedCount}/{challenges.length} completed today
          </p>
        </div>
        <div className="flex items-center gap-4">
          {streak > 0 && (
            <div className="flex items-center gap-1 text-orange-600">
              <span className="text-xl">🔥</span>
              <span className="font-bold">{streak}</span>
              <span className="text-sm">day streak</span>
            </div>
          )}
          {totalRP > 0 && (
            <span className="text-lg font-bold text-brand-600">
              +{totalRP} RP today
            </span>
          )}
        </div>
      </div>

      {/* All completed message */}
      {completedCount === challenges.length && challenges.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 text-center">
          <span className="text-3xl mb-2 block">🎉</span>
          <p className="text-green-800 font-medium">
            All challenges completed for today!
          </p>
          <p className="text-green-700 text-sm">
            Come back tomorrow for new challenges
          </p>
        </div>
      )}

      {/* Challenge cards */}
      <div className="space-y-4">
        {challenges.map((userChallenge) => (
          <DailyChallengeCard
            key={userChallenge.id}
            challenge={userChallenge.challenge!}
            userChallenge={userChallenge}
            onComplete={
              userChallenge.status !== 'completed'
                ? handleCompleteChallenge
                : undefined
            }
            streak={streak}
          />
        ))}
      </div>

      {/* Empty state */}
      {challenges.length === 0 && (
        <div className="text-center py-8">
          <span className="text-4xl mb-3 block">📋</span>
          <p className="text-gray-600">No challenges available today</p>
        </div>
      )}
    </div>
  );
}

export default DailyChallengeList;
