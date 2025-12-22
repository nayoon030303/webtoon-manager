/**
 * App constants and configuration
 */

import { Platform, Webtoon } from '../types';

// Platform display names and colors
export const PLATFORM_CONFIG: Record<Platform, { name: string; color: string }> = {
  naver: { name: 'Naver', color: '#00C73C' },
  kakao: { name: 'Kakao', color: '#FFCD00' },
  lezhin: { name: 'Lezhin', color: '#FF5B5B' },
};

// Dummy webtoon data for demonstration
export const DUMMY_WEBTOONS: Webtoon[] = [
  {
    id: "1",
    title: "여신강림",
    platform: "naver",
    thumbnail:
      "https://shared-comic.pstatic.net/thumb/webtoon/703846/thumbnail/thumbnail_IMAG21_7636374537658391400.jpg",
    url: "https://comic.naver.com/webtoon/list?titleId=703846&tab=finish",
    episodePattern: "no=(\\d+)",
  },
  {
    id: "2",
    title: "이태원 클라쓰",
    platform: "kakao",
    thumbnail:
      "https://dn-img-page.kakao.com/download/resource?kid=bxPu93/hzLYM4pKVu/S0TkKDaLBZI0UKSUKkhOxK",
    url: "https://page.kakao.com/content/49994566",
    episodePattern: "episodeId=(\\d+)",
  },
  {
    id: "3",
    title: "레진코믹스 샘플",
    platform: "lezhin",
    thumbnail:
      "https://ccdn.lezhin.com/v2/comics/5953018944438272/images/thumbnail.webp",
    url: "https://www.lezhin.com/ko/comic/sample",
    episodePattern: "episode/(\\d+)",
  },
];

// Theme colors
export const COLORS = {
  primary: '#6366F1',
  secondary: '#8B5CF6',
  background: '#FFFFFF',
  surface: '#F8FAFC',
  text: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  shadow: 'rgba(0, 0, 0, 0.05)',
  error: '#EF4444',
  success: '#22C55E',
};

// Spacing constants
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Border radius
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
};
