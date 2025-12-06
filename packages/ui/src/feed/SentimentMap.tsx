// packages/ui/src/feed/SentimentMap.tsx
// Bubble chart visualization of topic sentiment

'use client';

import { useState, useEffect } from 'react';

export interface TopicSentiment {
  topic: string;
  consensus_score: number; // 0-1 (0 = highly divided, 1 = unanimous)
  engagement_level: number; // Total reactions/ratings
  action_readiness: number; // 0-1 (readiness to move to deliberation)
  avg_sentiment: number; // -1 to 1 (-1 = negative, 0 = neutral, 1 = positive)
  x_position?: number; // For visualization
  y_position?: number; // For visualization
}

export interface SentimentMapProps {
  topics?: TopicSentiment[];
  onTopicClick?: (topic: string) => void;
  showLabels?: boolean;
}

export function SentimentMap({
  topics: providedTopics,
  onTopicClick,
  showLabels = true,
}: SentimentMapProps) {
  const [topics, setTopics] = useState<TopicSentiment[]>(providedTopics || []);
  const [loading, setLoading] = useState(!providedTopics);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (providedTopics) return;

    const fetchSentiment = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/feed/sentiment');
        if (!response.ok) throw new Error('Failed to fetch sentiment data');
        const data = await response.json();
        setTopics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSentiment();
  }, [providedTopics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sentiment map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading sentiment data: {error}</p>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center">
        <p className="text-gray-600 text-sm">No sentiment data available yet.</p>
        <p className="text-gray-500 text-sm mt-2">
          Topics will appear here once enough community members have engaged.
        </p>
      </div>
    );
  }

  // Calculate bubble positions and sizes
  const maxEngagement = Math.max(...topics.map((t) => t.engagement_level));
  const minEngagement = Math.min(...topics.map((t) => t.engagement_level));

  const getBubbleSize = (engagement: number) => {
    // Scale bubble size between 40px and 160px
    const normalized = (engagement - minEngagement) / (maxEngagement - minEngagement || 1);
    return 40 + normalized * 120;
  };

  const getBubbleColor = (consensus: number, sentiment: number) => {
    // High consensus = saturated color
    // Low consensus = gray
    const saturation = Math.round(consensus * 100);

    if (sentiment > 0.3) {
      return `hsl(142, ${saturation}%, 45%)`; // Green for positive
    } else if (sentiment < -0.3) {
      return `hsl(0, ${saturation}%, 45%)`; // Red for negative
    } else {
      return `hsl(210, ${saturation}%, 45%)`; // Blue for neutral
    }
  };

  const getPositionStyle = (topic: TopicSentiment, index: number) => {
    // Use provided positions or calculate grid layout
    if (topic.x_position !== undefined && topic.y_position !== undefined) {
      return {
        left: `${topic.x_position}%`,
        top: `${topic.y_position}%`,
      };
    }

    // Simple grid fallback
    const cols = Math.ceil(Math.sqrt(topics.length));
    const row = Math.floor(index / cols);
    const col = index % cols;
    return {
      left: `${(col + 0.5) * (100 / cols)}%`,
      top: `${(row + 0.5) * (100 / Math.ceil(topics.length / cols))}%`,
    };
  };

  return (
    <div className="space-y-2">
      {/* Legend */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Bubble Size</h4>
          <p className="text-gray-600">Larger = more engagement (reactions, ratings, evidence)</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Color Intensity</h4>
          <p className="text-gray-600">Saturated = high consensus, Gray = divided opinions</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Color Hue</h4>
          <p className="text-gray-600">
            <span className="text-green-600">Green</span> = positive sentiment,{' '}
            <span className="text-red-600">Red</span> = negative,{' '}
            <span className="text-blue-600">Blue</span> = neutral
          </p>
        </div>
      </div>

      {/* Bubble chart */}
      <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg" style={{ height: '600px' }}>
        {topics.map((topic, index) => {
          const size = getBubbleSize(topic.engagement_level);
          const color = getBubbleColor(topic.consensus_score, topic.avg_sentiment);
          const position = getPositionStyle(topic, index);

          return (
            <div
              key={topic.topic}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110"
              style={{
                ...position,
                width: `${size}px`,
                height: `${size}px`,
              }}
              onClick={() => onTopicClick?.(topic.topic)}
              title={`${topic.topic}\nConsensus: ${Math.round(topic.consensus_score * 100)}%\nEngagement: ${topic.engagement_level}\nReadiness: ${Math.round(topic.action_readiness * 100)}%`}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: color }}
              >
                {showLabels && size > 80 && (
                  <span className="text-white font-semibold text-center px-2 text-sm">
                    {topic.topic}
                  </span>
                )}
              </div>

              {/* Action readiness indicator */}
              {topic.action_readiness > 0.7 && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-white">
                  !
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* High action readiness topics callout */}
      {topics.filter((t) => t.action_readiness > 0.7).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">Ready for Deliberation</h4>
          <p className="text-yellow-800 text-sm mb-2">
            These topics show high engagement and consensus, and may be ready to move to structured
            deliberation:
          </p>
          <ul className="list-disc list-inside text-yellow-800 text-sm">
            {topics
              .filter((t) => t.action_readiness > 0.7)
              .map((t) => (
                <li key={t.topic}>
                  <button
                    onClick={() => onTopicClick?.(t.topic)}
                    className="text-yellow-900 font-semibold hover:underline"
                  >
                    {t.topic}
                  </button>{' '}
                  ({Math.round(t.action_readiness * 100)}% ready)
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
