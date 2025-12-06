// packages/ui/src/feed/InterestProfile.tsx
// User's private interest dashboard showing topics and engagement patterns

'use client';

import { useState, useEffect } from 'react';

export interface TopicInterest {
  topic: string;
  engagement_count: number;
  last_engaged: string;
  interest_score: number; // 0-1
  trend: 'rising' | 'stable' | 'declining';
}

export interface InterestProfileProps {
  userId?: string;
  showControls?: boolean;
}

export function InterestProfile({ userId, showControls = true }: InterestProfileProps) {
  const [interests, setInterests] = useState<TopicInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        setLoading(true);
        const url = userId ? `/api/feed/interests/${userId}` : '/api/feed/interests';
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch interests');
        const data = await response.json();
        setInterests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();
  }, [userId]);

  const handleClearHistory = async () => {
    if (!confirm('Clear all interest tracking data? This cannot be undone.')) return;

    try {
      const response = await fetch('/api/feed/interests', {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to clear interests');
      setInterests([]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to clear interests');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading your interests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 text-sm">Error loading interests: {error}</p>
      </div>
    );
  }

  if (interests.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
        <p className="text-gray-600 mb-2">No interest data yet.</p>
        <p className="text-gray-500 text-sm">
          As you engage with posts (reactions, ratings, comments), we'll track your interests here.
        </p>
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return '📈';
      case 'declining':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return '•';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const topInterests = [...interests].sort((a, b) => b.interest_score - a.interest_score).slice(0, 5);
  const risingInterests = interests.filter((i) => i.trend === 'rising').slice(0, 3);

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Your Interest Profile</h3>
          <p className="text-sm text-gray-600">
            Topics you've engaged with, sorted by interest level
          </p>
        </div>
        {showControls && (
          <button
            onClick={handleClearHistory}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Top interests */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Interests</h4>
        <div className="space-y-2">
          {topInterests.map((interest) => (
            <div
              key={interest.topic}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center gap-3"
            >
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">{interest.topic}</span>
                  <span className={`text-sm ${getTrendColor(interest.trend)}`}>
                    {getTrendIcon(interest.trend)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{interest.engagement_count} interactions</span>
                  <span>
                    Last: {new Date(interest.last_engaged).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="w-16 h-16 relative">
                  <svg className="transform -rotate-90" viewBox="0 0 36 36">
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeDasharray={`${interest.interest_score * 100}, 100`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
                    {Math.round(interest.interest_score * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rising interests */}
      {risingInterests.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Rising Interests 📈</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {risingInterests.map((interest) => (
              <div
                key={interest.topic}
                className="bg-green-50 border border-green-200 rounded-lg p-3 text-center"
              >
                <div className="font-medium text-green-900">{interest.topic}</div>
                <div className="text-xs text-green-700 mt-1">
                  {interest.engagement_count} recent interactions
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All interests list */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">All Topics ({interests.length})</h4>
        <div className="max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          <div className="space-y-1">
            {interests.map((interest) => (
              <div
                key={interest.topic}
                className="flex items-center justify-between text-sm py-1 px-2 hover:bg-white dark:bg-gray-800 rounded"
              >
                <span className="text-gray-700">{interest.topic}</span>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{interest.engagement_count}×</span>
                  <span className={getTrendColor(interest.trend)}>
                    {getTrendIcon(interest.trend)}
                  </span>
                  <span className="font-medium text-blue-600">
                    {Math.round(interest.interest_score * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Privacy notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <h4 className="font-semibold text-blue-900 mb-1">Privacy</h4>
        <p className="text-blue-800">
          Your interest profile is calculated from your public activity (posts, reactions, ratings).
          This data is stored locally and used only to provide personalized recommendations. It is
          never shared with other users or third parties. You can clear your history at any time.
        </p>
      </div>
    </div>
  );
}
