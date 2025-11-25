'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { PendingCelebration } from '@togetheros/types';
import { MilestoneCelebration } from './MilestoneCelebration';

/**
 * CelebrationProvider
 *
 * Context provider for milestone celebrations.
 * Manages a queue of pending celebrations and displays them sequentially.
 * Based on gamification spec (docs/modules/gamification.md lines 356-376, 679-712)
 *
 * Features:
 * - Fetches pending celebrations on mount
 * - Shows max 3 celebrations per session
 * - Sequential playback (one after another)
 * - Marks celebrations as shown via API
 */

interface CelebrationContextType {
  /** Current celebration being shown */
  current: PendingCelebration | null;
  /** Number of celebrations in queue */
  queueLength: number;
  /** Manually trigger celebration fetch */
  refreshCelebrations: () => Promise<void>;
  /** Check if quiet mode is enabled */
  isQuietMode: boolean;
}

const CelebrationContext = createContext<CelebrationContextType | null>(null);

export interface CelebrationProviderProps {
  children: ReactNode;
  /** User ID for fetching celebrations */
  userId?: string;
  /** Max celebrations per session */
  maxPerSession?: number;
  /** Auto-fetch on mount */
  autoFetch?: boolean;
}

export function CelebrationProvider({
  children,
  userId,
  maxPerSession = 3,
  autoFetch = true,
}: CelebrationProviderProps) {
  const [queue, setQueue] = useState<PendingCelebration[]>([]);
  const [current, setCurrent] = useState<PendingCelebration | null>(null);
  const [isQuietMode, setIsQuietMode] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch pending celebrations from API
  const refreshCelebrations = useCallback(async () => {
    if (!userId) return;

    try {
      const params = new URLSearchParams({
        userId,
        limit: String(maxPerSession),
      });

      const response = await fetch(`/api/gamification/celebrations/pending?${params}`);
      const data = await response.json();

      if (data.quietMode) {
        setIsQuietMode(true);
        return;
      }

      if (data.celebrations?.length > 0) {
        setQueue(data.celebrations);
      }
    } catch (error) {
      console.error('Failed to fetch celebrations:', error);
    }
  }, [userId, maxPerSession]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && !hasFetched && userId) {
      setHasFetched(true);
      refreshCelebrations();
    }
  }, [autoFetch, hasFetched, userId, refreshCelebrations]);

  // Show next celebration from queue
  useEffect(() => {
    if (!current && queue.length > 0) {
      const [next, ...rest] = queue;
      setCurrent(next);
      setQueue(rest);
    }
  }, [current, queue]);

  // Handle celebration completion
  const handleComplete = useCallback(
    async (milestoneId: string, actionTaken: boolean) => {
      // Mark celebration as shown via API
      try {
        await fetch(`/api/gamification/celebrations/${milestoneId}/shown`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, actionTaken }),
        });
      } catch (error) {
        console.error('Failed to mark celebration as shown:', error);
      }

      // Clear current to trigger next
      setCurrent(null);
    },
    [userId]
  );

  const contextValue: CelebrationContextType = {
    current,
    queueLength: queue.length,
    refreshCelebrations,
    isQuietMode,
  };

  return (
    <CelebrationContext.Provider value={contextValue}>
      {children}
      {current && !isQuietMode && (
        <MilestoneCelebration
          celebration={current}
          onComplete={handleComplete}
        />
      )}
    </CelebrationContext.Provider>
  );
}

/**
 * Hook to access celebration context
 */
export function useCelebrations(): CelebrationContextType {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebrations must be used within a CelebrationProvider');
  }
  return context;
}

/**
 * Hook to fetch and manage milestone celebrations
 * Can be used independently of CelebrationProvider
 */
export function useMilestoneCelebrations(userId?: string, maxPerSession = 3) {
  const [queue, setQueue] = useState<PendingCelebration[]>([]);
  const [current, setCurrent] = useState<PendingCelebration | null>(null);
  const [isQuietMode, setIsQuietMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch pending celebrations
  const fetchCelebrations = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        userId,
        limit: String(maxPerSession),
      });

      const response = await fetch(`/api/gamification/celebrations/pending?${params}`);
      const data = await response.json();

      if (data.quietMode) {
        setIsQuietMode(true);
        return;
      }

      if (data.celebrations?.length > 0) {
        setQueue(data.celebrations.slice(0, maxPerSession));
      }
    } catch (error) {
      console.error('Failed to fetch celebrations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, maxPerSession]);

  // Show next celebration from queue
  useEffect(() => {
    if (!current && queue.length > 0) {
      const [next, ...rest] = queue;
      setCurrent(next);
      setQueue(rest);
    }
  }, [current, queue]);

  // Mark celebration as complete
  const markComplete = useCallback(
    async (milestoneId: string, actionTaken = false) => {
      try {
        await fetch(`/api/gamification/celebrations/${milestoneId}/shown`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, actionTaken }),
        });
      } catch (error) {
        console.error('Failed to mark celebration as shown:', error);
      }

      setCurrent(null);
    },
    [userId]
  );

  return {
    current,
    queue,
    queueLength: queue.length,
    isQuietMode,
    isLoading,
    fetchCelebrations,
    markComplete,
  };
}

export default CelebrationProvider;
