/**
 * Custom hook for managing webtoon favorites
 */

import { useState, useEffect, useCallback } from 'react';
import { Favorite } from '../types';
import * as Storage from '../services/storage';

interface UseFavoritesReturn {
  favorites: Favorite[];
  favoriteIds: Set<string>;
  loading: boolean;
  isFavorite: (webtoonId: string) => boolean;
  toggleFavorite: (webtoonId: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

export const useFavorites = (): UseFavoritesReturn => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Load all favorites on mount
  const loadFavorites = useCallback(async () => {
    setLoading(true);
    const data = await Storage.getFavorites();
    setFavorites(data);
    setFavoriteIds(new Set(data.map((f) => f.webtoonId)));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Check if a webtoon is favorited (synchronous, uses cached state)
  const isFavorite = useCallback(
    (webtoonId: string): boolean => {
      return favoriteIds.has(webtoonId);
    },
    [favoriteIds]
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    async (webtoonId: string): Promise<void> => {
      const wasAdded = await Storage.toggleFavorite(webtoonId);

      if (wasAdded) {
        // Optimistically add
        const newFavorite: Favorite = {
          webtoonId,
          addedAt: new Date().toISOString(),
        };
        setFavorites((prev) => [...prev, newFavorite]);
        setFavoriteIds((prev) => new Set([...prev, webtoonId]));
      } else {
        // Optimistically remove
        setFavorites((prev) => prev.filter((f) => f.webtoonId !== webtoonId));
        setFavoriteIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(webtoonId);
          return newSet;
        });
      }
    },
    []
  );

  // Manual refresh
  const refreshFavorites = useCallback(async () => {
    await loadFavorites();
  }, [loadFavorites]);

  return {
    favorites,
    favoriteIds,
    loading,
    isFavorite,
    toggleFavorite,
    refreshFavorites,
  };
};
