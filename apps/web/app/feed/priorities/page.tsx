'use client';

import { useState, useEffect } from 'react';
import { PriorityList } from '@togetheros/ui/feed';
import type { Priority } from '@togetheros/types';

export default function PrioritiesPage() {
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch priorities on mount
  useEffect(() => {
    async function fetchPriorities() {
      try {
        const response = await fetch('/api/feed/priorities');
        if (response.status === 401) {
          setError('Please log in to view your priorities');
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch priorities');
        }
        const data = await response.json();
        // Map database fields to Priority type
        const mapped = data.map((p: any) => ({
          id: p.id,
          userId: p.user_id,
          topic: p.topic,
          rank: p.rank,
          weight: p.care_weight || p.weight || 5,
          updatedAt: new Date(p.updated_at),
        }));
        setPriorities(mapped);
      } catch (err: any) {
        setError(err.message || 'Failed to load priorities');
      } finally {
        setLoading(false);
      }
    }
    fetchPriorities();
  }, []);

  const handleUpdatePriority = async (topic: string, rank: number, weight: number) => {
    try {
      const response = await fetch('/api/feed/priorities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, rank, care_weight: weight }),
      });
      if (!response.ok) {
        throw new Error('Failed to update priority');
      }
      setPriorities(prev =>
        prev.map(p => (p.topic === topic ? { ...p, rank, weight } : p))
      );
    } catch (err: any) {
      console.error('Error updating priority:', err);
    }
  };

  const handleRemovePriority = (topic: string) => {
    // Note: No DELETE endpoint for single priority - just remove from local state
    setPriorities(prev => prev.filter(p => p.topic !== topic));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-4 bg-bg-2 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-bg-2 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="p-4 bg-danger-bg text-danger-700 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

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
