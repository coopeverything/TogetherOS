'use client';

/**
 * Bridge Recommendations Test Page
 * Demonstrates the context-aware recommendation system
 */

import { useState } from 'react';
import type { Recommendation } from '@togetheros/types';

export default function RecommendationsTestPage() {
  const [userId, setUserId] = useState('2214caba-da2c-4a3c-88eb-1cba645ae90d'); // George_R
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateRecommendations = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/bridge/recommendations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, maxRecommendations: 5 }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/bridge/recommendations?userId=${userId}&limit=10`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const takeAction = async (recommendationId: string, action: 'act' | 'dismiss') => {
    try {
      const response = await fetch(`/api/bridge/recommendations/${recommendationId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, action }),
      });

      if (!response.ok) {
        throw new Error('Failed to update recommendation');
      }

      // Refresh recommendations
      await fetchRecommendations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'local_group': return 'Local Group';
      case 'event': return 'Event';
      case 'discussion': return 'Discussion';
      case 'activity': return 'Activity';
      case 'thematic_group': return 'Thematic Group';
      case 'social_share': return 'Social Share';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bridge Recommendations Test</h1>
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
            Test the context-aware recommendation system. Generate personalized recommendations
            based on user context, interests, and city activity.
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="user_test_001"
              />
            </div>
            <button
              onClick={generateRecommendations}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Recommendations'}
            </button>
            <button
              onClick={fetchRecommendations}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Fetching...' : 'Fetch Existing'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">
              Recommendations ({recommendations.length})
            </h2>

            {recommendations.map((rec) => (
              <div key={rec.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        {getTypeLabel(rec.type)}
                      </span>
                      <span className={`text-sm font-medium ${getUrgencyColor(rec.urgency)}`}>
                        {rec.urgency?.toUpperCase() || 'NORMAL'} URGENCY
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                        Score: {rec.relevanceScore}/100
                      </span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded">
                        {rec.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{rec.title}</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{rec.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      {rec.matchedInterests.length > 0 && (
                        <div>
                          <span className="font-medium">Matched Interests:</span>{' '}
                          {rec.matchedInterests.join(', ')}
                        </div>
                      )}
                      {rec.rewardPoints && (
                        <div>
                          <span className="font-medium">Reward:</span> {rec.rewardPoints} RPs
                        </div>
                      )}
                      {rec.cityContext && (
                        <div>
                          <span className="font-medium">Location:</span> {rec.cityContext}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Nudges:</span> {rec.nudgeCount}/{rec.maxNudges}
                      </div>
                    </div>
                  </div>
                </div>

                {rec.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => takeAction(rec.id, 'act')}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Take Action
                    </button>
                    <button
                      onClick={() => takeAction(rec.id, 'dismiss')}
                      className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-50 dark:hover:bg-gray-8000"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {recommendations.length === 0 && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500 dark:text-gray-400 dark:text-gray-500">
            No recommendations yet. Click "Generate Recommendations" to create personalized
            suggestions based on user context.
          </div>
        )}

        {/* Info Panel */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold mb-3">How It Works</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <strong>Generate:</strong> Creates new recommendations based on user context (location, interests, engagement)
              and city context (groups, events, trending topics)
            </li>
            <li>
              <strong>Fetch:</strong> Retrieves existing recommendations from the repository
            </li>
            <li>
              <strong>Take Action:</strong> Marks recommendation as acted on (joins group, attends event, etc.)
            </li>
            <li>
              <strong>Dismiss:</strong> Hides recommendation from future suggestions
            </li>
          </ul>

          <div className="mt-4 pt-4 border-t border-blue-300">
            <p className="text-sm"><strong>Test User ID:</strong> {userId}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Mock data includes: Portland, Oregon location with interests in housing, climate, food systems
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
