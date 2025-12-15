/**
 * AsyncStorage service for managing local data persistence
 * Handles reading progress, favorites, and app settings
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ReadingProgress,
  Favorite,
  AppSettings,
  StorageKeys,
} from '../types';

// ============================================
// Reading Progress Management
// ============================================

/**
 * Get all reading progress records
 */
export const getAllProgress = async (): Promise<Record<string, ReadingProgress>> => {
  try {
    const data = await AsyncStorage.getItem(StorageKeys.PROGRESS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error reading progress:', error);
    return {};
  }
};

/**
 * Get reading progress for a specific webtoon
 */
export const getProgress = async (webtoonId: string): Promise<ReadingProgress | null> => {
  try {
    const allProgress = await getAllProgress();
    return allProgress[webtoonId] || null;
  } catch (error) {
    console.error('Error getting progress:', error);
    return null;
  }
};

/**
 * Update reading progress for a webtoon
 * Only updates if the new episode is greater than the stored one
 */
export const updateProgress = async (
  webtoonId: string,
  episode: number
): Promise<void> => {
  try {
    const allProgress = await getAllProgress();
    const currentProgress = allProgress[webtoonId];

    // Only update if new episode is higher or no progress exists
    if (!currentProgress || episode > currentProgress.lastEpisode) {
      allProgress[webtoonId] = {
        webtoonId,
        lastEpisode: episode,
        lastReadAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(
        StorageKeys.PROGRESS,
        JSON.stringify(allProgress)
      );
    }
  } catch (error) {
    console.error('Error updating progress:', error);
  }
};

/**
 * Clear progress for a specific webtoon
 */
export const clearProgress = async (webtoonId: string): Promise<void> => {
  try {
    const allProgress = await getAllProgress();
    delete allProgress[webtoonId];
    await AsyncStorage.setItem(
      StorageKeys.PROGRESS,
      JSON.stringify(allProgress)
    );
  } catch (error) {
    console.error('Error clearing progress:', error);
  }
};

// ============================================
// Favorites Management
// ============================================

/**
 * Get all favorite webtoon IDs
 */
export const getFavorites = async (): Promise<Favorite[]> => {
  try {
    const data = await AsyncStorage.getItem(StorageKeys.FAVORITES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading favorites:', error);
    return [];
  }
};

/**
 * Check if a webtoon is favorited
 */
export const isFavorite = async (webtoonId: string): Promise<boolean> => {
  const favorites = await getFavorites();
  return favorites.some((f) => f.webtoonId === webtoonId);
};

/**
 * Add a webtoon to favorites
 */
export const addFavorite = async (webtoonId: string): Promise<void> => {
  try {
    const favorites = await getFavorites();
    if (!favorites.some((f) => f.webtoonId === webtoonId)) {
      favorites.push({
        webtoonId,
        addedAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem(
        StorageKeys.FAVORITES,
        JSON.stringify(favorites)
      );
    }
  } catch (error) {
    console.error('Error adding favorite:', error);
  }
};

/**
 * Remove a webtoon from favorites
 */
export const removeFavorite = async (webtoonId: string): Promise<void> => {
  try {
    const favorites = await getFavorites();
    const filtered = favorites.filter((f) => f.webtoonId !== webtoonId);
    await AsyncStorage.setItem(
      StorageKeys.FAVORITES,
      JSON.stringify(filtered)
    );
  } catch (error) {
    console.error('Error removing favorite:', error);
  }
};

/**
 * Toggle favorite status
 */
export const toggleFavorite = async (webtoonId: string): Promise<boolean> => {
  const isCurrentlyFavorite = await isFavorite(webtoonId);
  if (isCurrentlyFavorite) {
    await removeFavorite(webtoonId);
    return false;
  } else {
    await addFavorite(webtoonId);
    return true;
  }
};

// ============================================
// Settings Management
// ============================================

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  notifications: true,
};

/**
 * Get app settings
 */
export const getSettings = async (): Promise<AppSettings> => {
  try {
    const data = await AsyncStorage.getItem(StorageKeys.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error reading settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Update app settings
 */
export const updateSettings = async (
  settings: Partial<AppSettings>
): Promise<void> => {
  try {
    const currentSettings = await getSettings();
    const newSettings = { ...currentSettings, ...settings };
    await AsyncStorage.setItem(
      StorageKeys.SETTINGS,
      JSON.stringify(newSettings)
    );
  } catch (error) {
    console.error('Error updating settings:', error);
  }
};

// ============================================
// Utility Functions
// ============================================

/**
 * Clear all app data (for reset functionality)
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      StorageKeys.PROGRESS,
      StorageKeys.FAVORITES,
      StorageKeys.SETTINGS,
    ]);
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
};
