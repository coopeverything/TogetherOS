'use client';

import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { FirstWeekJourney, DailyChallengeList } from '@togetheros/ui/gamification';

interface NewUserJourneyProps {
  userId: string;
  className?: string;
}

interface JourneyState {
  isNewUser: boolean;
  firstWeekActive: boolean;
  rpBalance: number;
  streak: number;
  loading: boolean;
}

export function NewUserJourney({ userId, className = '' }: NewUserJourneyProps) {
  const [state, setState] = useState<JourneyState>({
    isNewUser: true,
    firstWeekActive: true,
    rpBalance: 0,
    streak: 0,
    loading: true,
  });
  const [activeTab, setActiveTab] = useState<'first-week' | 'daily'>('first-week');
  const [showChallenges, setShowChallenges] = useState(true);

  useEffect(() => {
    fetchJourneyState();
  }, [userId]);

  const fetchJourneyState = async () => {
    try {
      // Check if first-week journey is active
      const firstWeekRes = await fetch(`/api/challenges/first-week?userId=${userId}`);
      const firstWeekData = await firstWeekRes.json();

      // Get gamification stats
      const statsRes = await fetch(`/api/gamification/stats?userId=${userId}`);
      const statsData = await statsRes.json();

      setState({
        isNewUser: firstWeekData.initialized && !firstWeekData.progress?.isComplete,
        firstWeekActive: firstWeekData.initialized && !firstWeekData.progress?.isComplete,
        rpBalance: statsData.rpBalance || 0,
        streak: statsData.streak || 0,
        loading: false,
      });

      // Auto-switch to daily tab if first week complete
      if (firstWeekData.progress?.isComplete) {
        setActiveTab('daily');
      }
    } catch (err) {
      console.error('Failed to fetch journey state:', err);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleChallengeComplete = (challengeId: string, result: any) => {
    // Refresh state after completion
    fetchJourneyState();
  };

  if (state.loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!showChallenges) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-ink-900">Daily Challenges</h3>
            <p className="text-sm text-ink-600">
              {state.streak > 0 ? `${state.streak} day streak` : 'Start your streak today!'}
            </p>
          </div>
          <Button variant="secondary" onClick={() => setShowChallenges(true)}>
            Show Challenges
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-0 overflow-hidden ${className}`}>
      {/* Header with RP and minimize */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Your Journey</h2>
            <p className="text-brand-100 text-sm">
              {state.firstWeekActive ? 'First Week Journey' : 'Daily Challenges'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold">{state.rpBalance} RP</p>
              {state.streak > 0 && (
                <p className="text-brand-100 text-sm flex items-center gap-1">
                  <span>🔥</span> {state.streak} day streak
                </p>
              )}
            </div>
            <button
              onClick={() => setShowChallenges(false)}
              className="text-brand-200 hover:text-white p-1"
              aria-label="Minimize"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs (only show if first week is active) */}
      {state.firstWeekActive && (
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('first-week')}
            className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-colors ${
              activeTab === 'first-week'
                ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            First Week Journey
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-colors ${
              activeTab === 'daily'
                ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Daily Challenges
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {activeTab === 'first-week' && state.firstWeekActive ? (
          <FirstWeekJourney userId={userId} onChallengeComplete={handleChallengeComplete} />
        ) : (
          <DailyChallengeList userId={userId} onChallengeComplete={handleChallengeComplete} />
        )}
      </div>
    </Card>
  );
}

export default NewUserJourney;
