'use client';

import { useState, useEffect, useCallback } from 'react';

export interface GamificationStats {
  rpBalance: number;
  spBalance: number;
  streak: number;
  longestStreak: number;
  completedChallenges: number;
  totalRPEarned: number;
  badges: Badge[];
  recentTransactions: RPTransaction[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface RPTransaction {
  id: string;
  amount: number;
  type: string;
  source: string;
  createdAt: Date;
}

interface UseGamificationOptions {
  autoFetch?: boolean;
  refreshInterval?: number;
}

export function useGamification(userId?: string, options: UseGamificationOptions = {}) {
  const { autoFetch = true, refreshInterval } = options;

  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/gamification/stats?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats');
      }

      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && userId) {
      fetchStats();
    }
  }, [autoFetch, userId, fetchStats]);

  // Optional refresh interval
  useEffect(() => {
    if (!refreshInterval || !userId) return;

    const interval = setInterval(fetchStats, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, userId, fetchStats]);

  // Award RP (for client-side tracking)
  const awardRP = useCallback(
    async (eventType: string, amount: number, source: string, metadata?: Record<string, any>) => {
      if (!userId) return null;

      try {
        const response = await fetch('/api/gamification/award-rp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            eventType,
            rpAmount: amount,
            source,
            metadata,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to award RP');
        }

        // Optimistically update local state
        setStats((prev) =>
          prev
            ? {
                ...prev,
                rpBalance: prev.rpBalance + amount,
                totalRPEarned: prev.totalRPEarned + amount,
              }
            : null
        );

        return data;
      } catch (err: any) {
        console.error('Award RP error:', err);
        return null;
      }
    },
    [userId]
  );

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
    awardRP,
    rpBalance: stats?.rpBalance || 0,
    spBalance: stats?.spBalance || 0,
    streak: stats?.streak || 0,
    badges: stats?.badges || [],
  };
}

export default useGamification;
