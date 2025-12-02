// packages/ui/src/feed/TrendLines.tsx
// Line chart showing topic sentiment trends over time

'use client';

import { useState, useEffect } from 'react';

export interface SentimentDataPoint {
  date: string; // ISO date string
  consensus_score: number;
  avg_sentiment: number;
  engagement_level: number;
}

export interface TrendLinesProps {
  topic: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  showEngagement?: boolean;
}

export function TrendLines({
  topic,
  timeRange = 'month',
  showEngagement = true,
}: TrendLinesProps) {
  const [data, setData] = useState<SentimentDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/feed/sentiment/${encodeURIComponent(topic)}?range=${timeRange}`
        );
        if (!response.ok) throw new Error('Failed to fetch trend data');
        const trendData = await response.json();
        setData(trendData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [topic, timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading trends...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 text-sm">Error loading trends: {error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
        <p className="text-gray-600">No trend data available for this topic yet.</p>
      </div>
    );
  }

  // Simple SVG line chart
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Scale functions
  const xScale = (index: number) => {
    return padding.left + (index / (data.length - 1)) * plotWidth;
  };

  const yScale = (value: number, min: number, max: number) => {
    const normalized = (value - min) / (max - min || 1);
    return chartHeight - padding.bottom - normalized * plotHeight;
  };

  // Data ranges
  const sentimentMin = -1;
  const sentimentMax = 1;
  const consensusMin = 0;
  const consensusMax = 1;
  const engagementMin = 0;
  const engagementMax = Math.max(...data.map((d) => d.engagement_level));

  // Generate path strings
  const sentimentPath = data
    .map((d, i) => {
      const x = xScale(i);
      const y = yScale(d.avg_sentiment, sentimentMin, sentimentMax);
      return i === 0 ? `M ${x},${y}` : `L ${x},${y}`;
    })
    .join(' ');

  const consensusPath = data
    .map((d, i) => {
      const x = xScale(i);
      const y = yScale(d.consensus_score, consensusMin, consensusMax);
      return i === 0 ? `M ${x},${y}` : `L ${x},${y}`;
    })
    .join(' ');

  const engagementPath = showEngagement
    ? data
        .map((d, i) => {
          const x = xScale(i);
          const y = yScale(d.engagement_level, engagementMin, engagementMax);
          return i === 0 ? `M ${x},${y}` : `L ${x},${y}`;
        })
        .join(' ')
    : '';

  // Format date labels
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Sentiment Trends: {topic}
        </h3>

        {/* Legend */}
        <div className="flex gap-6 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-blue-600"></div>
            <span className="text-gray-700">Sentiment (-1 to +1)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-green-600"></div>
            <span className="text-gray-700">Consensus (0 to 1)</span>
          </div>
          {showEngagement && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-purple-400 opacity-50"></div>
              <span className="text-gray-700">Engagement</span>
            </div>
          )}
        </div>

        {/* Chart */}
        <svg
          width={chartWidth}
          height={chartHeight}
          className="w-full"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          {/* Grid lines */}
          <g className="grid" stroke="#e5e7eb" strokeWidth="1">
            {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
              const y = yScale(tick, 0, 1);
              return (
                <line
                  key={tick}
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  strokeDasharray="2,2"
                />
              );
            })}
          </g>

          {/* Zero line for sentiment */}
          <line
            x1={padding.left}
            y1={yScale(0, sentimentMin, sentimentMax)}
            x2={chartWidth - padding.right}
            y2={yScale(0, sentimentMin, sentimentMax)}
            stroke="#9ca3af"
            strokeWidth="1"
            strokeDasharray="4,4"
          />

          {/* Engagement area (background) */}
          {showEngagement && engagementMax > 0 && (
            <path
              d={`${engagementPath} L ${xScale(data.length - 1)},${chartHeight - padding.bottom} L ${padding.left},${chartHeight - padding.bottom} Z`}
              fill="#a78bfa"
              fillOpacity="0.1"
            />
          )}

          {/* Sentiment line */}
          <path d={sentimentPath} fill="none" stroke="#2563eb" strokeWidth="2" />

          {/* Consensus line */}
          <path d={consensusPath} fill="none" stroke="#16a34a" strokeWidth="2" />

          {/* Data points */}
          {data.map((d, i) => {
            const x = xScale(i);
            const sentY = yScale(d.avg_sentiment, sentimentMin, sentimentMax);
            const consY = yScale(d.consensus_score, consensusMin, consensusMax);

            return (
              <g key={i}>
                <circle cx={x} cy={sentY} r="4" fill="#2563eb" />
                <circle cx={x} cy={consY} r="4" fill="#16a34a" />
              </g>
            );
          })}

          {/* X-axis labels */}
          <g className="x-axis">
            {data.map((d, i) => {
              if (i % Math.ceil(data.length / 6) !== 0 && i !== data.length - 1) return null;
              const x = xScale(i);
              return (
                <text
                  key={i}
                  x={x}
                  y={chartHeight - padding.bottom + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {formatDate(d.date)}
                </text>
              );
            })}
          </g>

          {/* Y-axis labels */}
          <g className="y-axis">
            {[-1, -0.5, 0, 0.5, 1].map((tick) => {
              const y = yScale(tick, sentimentMin, sentimentMax);
              return (
                <text
                  key={tick}
                  x={padding.left - 10}
                  y={y}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                  alignmentBaseline="middle"
                >
                  {tick.toFixed(1)}
                </text>
              );
            })}
          </g>
        </svg>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 rounded p-3">
            <div className="text-blue-600 font-semibold">Current Sentiment</div>
            <div className="text-blue-900 text-lg">
              {data[data.length - 1].avg_sentiment.toFixed(2)}
            </div>
            <div className="text-blue-600 text-xs">
              {data[data.length - 1].avg_sentiment > 0 ? 'Positive' : 'Negative'}
            </div>
          </div>
          <div className="bg-green-50 rounded p-3">
            <div className="text-green-600 font-semibold">Current Consensus</div>
            <div className="text-green-900 text-lg">
              {Math.round(data[data.length - 1].consensus_score * 100)}%
            </div>
            <div className="text-green-600 text-xs">
              {data[data.length - 1].consensus_score > 0.7 ? 'High' : 'Divided'}
            </div>
          </div>
          {showEngagement && (
            <div className="bg-purple-50 rounded p-3">
              <div className="text-purple-600 font-semibold">Current Engagement</div>
              <div className="text-purple-900 text-lg">
                {data[data.length - 1].engagement_level}
              </div>
              <div className="text-purple-600 text-xs">Total interactions</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
