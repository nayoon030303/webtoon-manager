/**
 * Custom hook for managing webtoon reading progress
 */

import { useState, useEffect, useCallback } from 'react';
import { ReadingProgress } from '../types';
import * as Storage from '../services/storage';

interface UseProgressReturn {
  progress: Record<string, ReadingProgress>;
  loading: boolean;
  getWebtoonProgress: (webtoonId: string) => ReadingProgress | null;
  updateWebtoonProgress: (webtoonId: string, episode: number) => Promise<void>;
  refreshProgress: () => Promise<void>;
}

export const useProgress = (): UseProgressReturn => {
  const [progress, setProgress] = useState<Record<string, ReadingProgress>>({});
  const [loading, setLoading] = useState(true);

  // Load all progress on mount
  const loadProgress = useCallback(async () => {
    setLoading(true);
    const data = await Storage.getAllProgress();
    setProgress(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Get progress for a specific webtoon
  const getWebtoonProgress = useCallback(
    (webtoonId: string): ReadingProgress | null => {
      return progress[webtoonId] || null;
    },
    [progress]
  );

  // Update progress and refresh state
  const updateWebtoonProgress = useCallback(
    async (webtoonId: string, episode: number): Promise<void> => {
      await Storage.updateProgress(webtoonId, episode);
      // Optimistic update
      setProgress((prev) => ({
        ...prev,
        [webtoonId]: {
          webtoonId,
          lastEpisode: Math.max(episode, prev[webtoonId]?.lastEpisode || 0),
          lastReadAt: new Date().toISOString(),
        },
      }));
    },
    []
  );

  // Manual refresh
  const refreshProgress = useCallback(async () => {
    await loadProgress();
  }, [loadProgress]);

  return {
    progress,
    loading,
    getWebtoonProgress,
    updateWebtoonProgress,
    refreshProgress,
  };
};
