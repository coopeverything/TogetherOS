// packages/ui/src/feed/ActionRecommendations.tsx
// Personalized action recommendations based on user interests and community needs

'use client';

import { useState, useEffect } from 'react';

export interface ActionRecommendation {
  id: string;
  type: 'post' | 'deliberation' | 'proposal' | 'mutual_aid' | 'event';
  title: string;
  description: string;
  topic: string;
  match_score: number; // 0-1 (how well it matches user interests)
  urgency: 'low' | 'medium' | 'high';
  action_url: string;
  metadata?: {
    deadline?: string;
    participants_needed?: number;
    current_participants?: number;
    [key: string]: any;
  };
}

export interface ActionRecommendationsProps {
  limit?: number;
  topics?: string[];
  onActionClick?: (action: ActionRecommendation) => void;
}

export function ActionRecommendations({
  limit = 5,
  topics,
  onActionClick,
}: ActionRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<ActionRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (limit) params.set('limit', limit.toString());
        if (topics?.length) params.set('topics', topics.join(','));

        const response = await fetch(`/api/feed/recommendations?${params}`);
        if (!response.ok) throw new Error('Failed to fetch recommendations');
        const data = await response.json();
        setRecommendations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [limit, topics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Finding relevant actions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 text-sm">Error loading recommendations: {error}</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
        <p className="text-gray-600 mb-2">No recommendations available right now.</p>
        <p className="text-gray-500 text-sm">
          Keep engaging with topics you care about to get personalized suggestions.
        </p>
      </div>
    );
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post':
        return '💬';
      case 'deliberation':
        return '🗣️';
      case 'proposal':
        return '📋';
      case 'mutual_aid':
        return '🤝';
      case 'event':
        return '📅';
      default:
        return '•';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'post':
        return 'Join Discussion';
      case 'deliberation':
        return 'Deliberate';
      case 'proposal':
        return 'Review Proposal';
      case 'mutual_aid':
        return 'Offer Help';
      case 'event':
        return 'Attend Event';
      default:
        return 'Take Action';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recommended Actions</h3>
        <span className="text-sm text-gray-500">{recommendations.length} suggestions</span>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            onClick={() => onActionClick?.(rec)}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="text-sm flex-shrink-0">{getTypeIcon(rec.type)}</div>

              {/* Content */}
              <div className="flex-grow min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white leading-tight">{rec.title}</h4>
                  <span
                    className={`text-xs px-2 py-1 rounded border flex-shrink-0 ${getUrgencyColor(rec.urgency)}`}
                  >
                    {rec.urgency}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-2">{rec.description}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    {rec.topic}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-blue-600">
                      {Math.round(rec.match_score * 100)}%
                    </span>
                    match
                  </span>
                  {rec.metadata?.deadline && (
                    <span>Due: {new Date(rec.metadata.deadline).toLocaleDateString()}</span>
                  )}
                  {rec.metadata?.participants_needed && (
                    <span>
                      {rec.metadata.current_participants || 0}/{rec.metadata.participants_needed}{' '}
                      people
                    </span>
                  )}
                </div>
              </div>

              {/* Action button */}
              <div className="flex-shrink-0">
                <a
                  href={rec.action_url}
                  className="inline-block bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {getTypeLabel(rec.type)}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Privacy notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
        <span className="font-semibold">Privacy:</span> Recommendations are based on your public
        activity (posts, reactions, ratings). Your interest profile is stored locally and never
        shared.
      </div>
    </div>
  );
}
