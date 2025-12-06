// apps/web/app/map/sentiment/page.tsx
// Sentiment visualization page with bubble chart and trend selector

'use client';

import { useState } from 'react';
import { SentimentMap, TrendLines } from '@togetheros/ui/feed';

export default function SentimentMapPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  return (
    <div className="container mx-auto px-4 py-4 max-w-7xl">
      <div className="mb-4">
        <h1 className="text-sm font-bold text-ink-900 mb-2">Community Sentiment Map</h1>
        <p className="text-ink-700">
          Visualize how the community feels about different topics. Bubble size shows engagement
          level, color intensity shows consensus, and hue shows sentiment (positive/negative).
        </p>
      </div>

      {/* Privacy notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
        <h3 className="font-semibold text-blue-900 mb-1">Privacy Protection</h3>
        <p className="text-blue-800 text-sm">
          Sentiment data is only shown when at least 20 members have engaged with a topic. Individual
          contributions are never shown.
        </p>
      </div>

      {/* Sentiment map */}
      <div className="mb-4">
        <SentimentMap onTopicClick={setSelectedTopic} />
      </div>

      {/* Topic trends (shown when topic selected) */}
      {selectedTopic && (
        <div className="border-t border-border pt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-ink-900">Topic Trends</h2>
            <div className="flex gap-2">
              {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    timeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-bg-2 text-ink-700 hover:bg-bg-2'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <TrendLines topic={selectedTopic} timeRange={timeRange} showEngagement />

          <button
            onClick={() => setSelectedTopic(null)}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            ← Back to sentiment map
          </button>
        </div>
      )}

      {/* Help text */}
      <div className="mt-4 bg-bg-0 rounded-lg p-4 text-sm text-ink-700">
        <h3 className="font-semibold text-ink-900 mb-2">How to Use This Map</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Click any bubble to see sentiment trends over time</li>
          <li>
            Topics marked with <span className="text-yellow-600 font-bold">!</span> are ready for
            structured deliberation
          </li>
          <li>Larger bubbles indicate more community engagement</li>
          <li>Saturated colors indicate high consensus, gray indicates divided opinions</li>
          <li>Green = positive sentiment, Red = negative, Blue = neutral</li>
        </ul>
      </div>
    </div>
  );
}
