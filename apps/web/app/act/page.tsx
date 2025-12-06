// apps/web/app/act/page.tsx
// Action recommendations page - personalized suggestions for user engagement

'use client';

import { useState } from 'react';
import { ActionRecommendations, InterestProfile } from '@togetheros/ui/feed';

export default function ActionPage() {
  const [showInterests, setShowInterests] = useState(false);

  return (
    <div className="container mx-auto px-4 py-4 max-w-4xl">
      <div className="mb-4">
        <h1 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Take Action</h1>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
          Personalized recommendations based on your interests and community needs.
        </p>
      </div>

      {/* Toggle between recommendations and interests */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setShowInterests(false)}
          className={`px-4 py-2 rounded font-medium ${
            !showInterests
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Recommended Actions
        </button>
        <button
          onClick={() => setShowInterests(true)}
          className={`px-4 py-2 rounded font-medium ${
            showInterests
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Your Interests
        </button>
      </div>

      {/* Content */}
      {showInterests ? (
        <InterestProfile showControls />
      ) : (
        <>
          <ActionRecommendations limit={10} />

          <div className="mt-4 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">How Recommendations Work</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>We analyze your engagement patterns (posts, reactions, ratings)</li>
              <li>We identify topics you care about and community needs that match</li>
              <li>Recommendations are updated daily based on new activity</li>
              <li>You can view and manage your interest profile anytime</li>
              <li>All calculations happen locally - your profile is never shared</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
