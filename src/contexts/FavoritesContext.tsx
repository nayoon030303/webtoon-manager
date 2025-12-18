/**
 * FavoritesContext
 * Global state management for favorites to sync across all screens
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Favorite } from '../types';
import * as Storage from '../services/storage';

interface FavoritesContextType {
  favorites: Favorite[];
  favoriteIds: Set<string>;
  loading: boolean;
  isFavorite: (webtoonId: string) => boolean;
  toggleFavorite: (webtoonId: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
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
        const newFavorite: Favorite = {
          webtoonId,
          addedAt: new Date().toISOString(),
        };
        setFavorites((prev) => [...prev, newFavorite]);
        setFavoriteIds((prev) => new Set([...prev, webtoonId]));
      } else {
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

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteIds,
        loading,
        isFavorite,
        toggleFavorite,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

// Custom hook to use favorites context
export const useFavoritesContext = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider');
  }
  return context;
};
