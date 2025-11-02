'use client';

import { CommunityPrioritiesMap } from '@togetheros/ui/feed';

export default function CommunityMapPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Community Priorities Map</h1>
        <p className="text-gray-600 dark:text-gray-400">
          See what topics matter most to the community. All data is anonymized and aggregated.
        </p>
      </div>

      <CommunityPrioritiesMap />

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <h2 className="font-semibold mb-2 text-green-900 dark:text-green-100">Privacy Protected</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Individual priorities are never shared. We only show anonymous statistics when
            enough people (20+) have prioritized a topic.
          </p>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <h2 className="font-semibold mb-2 text-purple-900 dark:text-purple-100">How It Works</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Percentages show how many community members have this topic in their
            top priorities. Arrows show week-over-week trends.
          </p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <a
          href="/feed/priorities"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Set Your Priorities
        </a>
      </div>
    </div>
  );
}
