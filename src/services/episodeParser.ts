/**
 * Episode parsing service
 * Extracts episode numbers from URLs based on platform-specific patterns
 */

import { Webtoon } from '../types';

/**
 * Extract episode number from a URL using the webtoon's episode pattern
 * @param url - The current URL in the WebView
 * @param webtoon - The webtoon object containing the pattern
 * @returns The episode number or null if not found
 */
export const extractEpisodeFromUrl = (
  url: string,
  webtoon: Webtoon
): number | null => {
  try {
    const regex = new RegExp(webtoon.episodePattern);
    const match = url.match(regex);

    if (match && match[1]) {
      const episodeNumber = parseInt(match[1], 10);
      if (!isNaN(episodeNumber) && episodeNumber > 0) {
        return episodeNumber;
      }
    }
    return null;
  } catch (error) {
    console.error('Error parsing episode from URL:', error);
    return null;
  }
};

/**
 * Check if the URL belongs to the same webtoon domain
 * Prevents tracking unrelated pages
 */
export const isValidWebtoonUrl = (url: string, webtoon: Webtoon): boolean => {
  try {
    const currentUrl = new URL(url);
    const baseUrl = new URL(webtoon.url);
    return currentUrl.hostname === baseUrl.hostname;
  } catch {
    return false;
  }
};

/**
 * Build episode URL from base URL and episode number (for future use)
 */
export const buildEpisodeUrl = (webtoon: Webtoon, episode: number): string => {
  // This is a simplified version - each platform may have different URL structures
  const { url, episodePattern } = webtoon;

  // Extract the parameter name from the pattern
  const paramMatch = episodePattern.match(/(\w+)=\(\\d\+\)/);
  if (paramMatch) {
    const paramName = paramMatch[1];
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${paramName}=${episode}`;
  }

  // For path-based patterns like 'episode/(\\d+)'
  const pathMatch = episodePattern.match(/(\w+)\/\(\\d\+\)/);
  if (pathMatch) {
    return `${url}/${pathMatch[1]}/${episode}`;
  }

  return url;
};
