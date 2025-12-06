'use client';

import { CommunityPrioritiesMap } from '@togetheros/ui/feed';
import type { CommunityPriorityStats } from '@togetheros/ui/feed';

export default function CommunityMapPage() {
  // Mock data for now - TODO: Replace with API call
  const mockStats: CommunityPriorityStats[] = [];
  const mockTotalUsers = 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Community Priorities Map</h1>
        <p className="text-ink-700">
          See what topics matter most to the community. All data is anonymized and aggregated.
        </p>
      </div>

      <CommunityPrioritiesMap stats={mockStats} totalUsers={mockTotalUsers} />

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="p-4 bg-green-50/20 rounded-lg">
          <h2 className="font-semibold mb-2 text-green-900">Privacy Protected</h2>
          <p className="text-sm text-ink-700">
            Individual priorities are never shared. We only show anonymous statistics when
            enough people (20+) have prioritized a topic.
          </p>
        </div>

        <div className="p-4 bg-purple-50/20 rounded-lg">
          <h2 className="font-semibold mb-2 text-purple-900">How It Works</h2>
          <p className="text-sm text-ink-700">
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
