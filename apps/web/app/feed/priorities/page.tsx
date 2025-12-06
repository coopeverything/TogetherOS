'use client';

import { useState } from 'react';
import { PriorityList } from '@togetheros/ui/feed';
import type { Priority } from '@togetheros/types';

export default function PrioritiesPage() {
  // Mock data for now - TODO: Replace with API call
  const [priorities, setPriorities] = useState<Priority[]>([]);

  const handleUpdatePriority = (topic: string, rank: number, weight: number) => {
    setPriorities(prev =>
      prev.map(p => (p.topic === topic ? { ...p, rank, weight } : p))
    );
  };

  const handleRemovePriority = (topic: string) => {
    setPriorities(prev => prev.filter(p => p.topic !== topic));
  };

  return (
    <div className="container mx-auto px-4 py-4 max-w-4xl">
      <div className="mb-4">
        <h1 className="text-sm font-bold mb-2">Your Priorities</h1>
        <p className="text-ink-700">
          Tell us what matters most to you. Drag topics to reorder by importance.
        </p>
      </div>

      <PriorityList
        priorities={priorities}
        onUpdatePriority={handleUpdatePriority}
        onRemovePriority={handleRemovePriority}
      />

      <div className="mt-4 p-4 bg-blue-50/20 rounded-lg">
        <h2 className="font-semibold mb-2">How priorities work</h2>
        <ul className="space-y-2 text-sm text-ink-700">
          <li>• Your priorities are <strong>private</strong> - only you can see them</li>
          <li>• They help personalize your feed ("For You" mode)</li>
          <li>• Anonymous aggregates show community trends in the <a href="/map" className="text-blue-600 underline">Community Map</a></li>
          <li>• Change them anytime - your interests evolve!</li>
        </ul>
      </div>
    </div>
  );
}
