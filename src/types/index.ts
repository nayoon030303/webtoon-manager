/**
 * Core type definitions for the Webtoon Manager app
 */

// Supported webtoon platforms
export type Platform = 'naver' | 'kakao' | 'lezhin';

// Webtoon data structure
export interface Webtoon {
  id: string;
  title: string;
  platform: Platform;
  thumbnail: string;
  url: string; // Base URL for the webtoon
  // URL pattern for episode extraction (regex pattern)
  // e.g., 'no=(\\d+)' for Naver, 'episode=(\\d+)' for Kakao
  episodePattern: string;
}

// Reading progress for a webtoon
export interface ReadingProgress {
  webtoonId: string;
  lastEpisode: number;
  lastReadAt: string; // ISO date string
}

// User's favorite webtoons
export interface Favorite {
  webtoonId: string;
  addedAt: string; // ISO date string
}

// App settings
export interface AppSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
}

// Navigation types
export type RootStackParamList = {
  MainTabs: undefined;
  WebView: {
    webtoon: Webtoon;
  };
};

export type MainTabParamList = {
  Home: undefined;
  Favorites: undefined;
  Settings: undefined;
};

// Storage keys enum for type safety
export enum StorageKeys {
  PROGRESS = '@webtoon_progress',
  FAVORITES = '@webtoon_favorites',
  SETTINGS = '@webtoon_settings',
}
