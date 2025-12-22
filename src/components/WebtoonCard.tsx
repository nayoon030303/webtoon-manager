/**
 * WebtoonCard component
 * Displays a single webtoon with thumbnail, title, platform badge, and reading progress
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Webtoon, ReadingProgress } from '../types';
import { PLATFORM_CONFIG, COLORS, SPACING, RADIUS } from '../constants';

interface WebtoonCardProps {
  webtoon: Webtoon;
  progress?: ReadingProgress | null;
  isFavorite?: boolean;
  onPress: (webtoon: Webtoon) => void;
  onFavoritePress?: (webtoonId: string) => void;
}

// Format relative time (e.g., "3일 전", "방금 전")
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  return `${Math.floor(diffDays / 30)}달 전`;
};

// Generate injected JavaScript to show only thumbnail from webtoon page
const getThumbnailInjectedJS = (): string => {
  return `
    (function() {
      function log(message) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(message);
        }
      }

      function extractAndShowThumbnail() {
        log('[WebtoonCard] extractAndShowThumbnail 실행');
        log('[WebtoonCard] 현재 URL: ' + window.location.href);

        // Hide everything first
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';

        // Find thumbnail image (og:image meta tag or first large image)
        let thumbnailUrl = '';

        // Try og:image first
        const ogImage = document.querySelector('meta[property="og:image"]');
        log('[WebtoonCard] ogImage 태그: ' + (ogImage ? 'found' : 'null'));

        if (ogImage) {
          thumbnailUrl = ogImage.getAttribute('content');
          log('[WebtoonCard] 추출된 thumbnailUrl: ' + thumbnailUrl);
        } else {
          log('[WebtoonCard] og:image 태그를 찾을 수 없음');
        }

        // If found, display only the thumbnail
        if (thumbnailUrl) {
          log('[WebtoonCard] 썸네일 이미지 표시: ' + thumbnailUrl);

          // Create image and log dimensions
          const img = new Image();
          img.onload = function() {
            log('[WebtoonCard] 원본 이미지 크기: ' + img.width + 'x' + img.height);
          };
          img.src = thumbnailUrl;

          document.body.innerHTML = '<img src="' + thumbnailUrl + '" style="width: 100%; height: 100%; object-fit: contain; display: block; background: #F8FAFC;" />';
        } else {
          log('[WebtoonCard] 폴백 표시 (og:image 없음)');
          // Fallback: show placeholder
          document.body.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #E2E8F0; font-size: 32px;">📚</div>';
        }
      }

      if (document.readyState === 'loading') {
        log('[WebtoonCard] DOM 로딩 중...');
        document.addEventListener('DOMContentLoaded', extractAndShowThumbnail);
      } else {
        log('[WebtoonCard] DOM 이미 로드됨, 즉시 실행');
        extractAndShowThumbnail();
      }

      setTimeout(extractAndShowThumbnail, 500);
    })();

    true;
  `;
};

export const WebtoonCard: React.FC<WebtoonCardProps> = ({
  webtoon,
  progress,
  isFavorite = false,
  onPress,
  onFavoritePress,
}) => {
  const platformConfig = PLATFORM_CONFIG[webtoon.platform];
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(webtoon)}
      activeOpacity={0.7}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        <WebView
          source={{ uri: webtoon.url }}
          style={styles.thumbnail}
          injectedJavaScript={getThumbnailInjectedJS()}
          javaScriptEnabled={true}
          scrollEnabled={false}
          bounces={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          pointerEvents="none"
          userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          onError={() => {
            console.log('WebView 로딩 실패:', webtoon.url);
            setImageError(true);
          }}
          onMessage={(event) => {
            console.log('[WebtoonCard WebView]', event.nativeEvent.data);
          }}
        />
        {imageError && (
          <View style={[styles.thumbnail, styles.imageFallback]}>
            <Text style={styles.fallbackText}>📚</Text>
          </View>
        )}
        {/* Platform badge */}
        <View
          style={[
            styles.platformBadge,
            { backgroundColor: platformConfig.color },
          ]}
        >
          <Text style={styles.platformText}>{platformConfig.name}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {webtoon.title}
        </Text>

        {/* Progress indicator */}
        {progress && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {progress.lastEpisode}화
            </Text>
            <Text style={styles.progressDate}>
              {formatRelativeTime(progress.lastReadAt)}
            </Text>
          </View>
        )}

        {/* Favorite button */}
        {onFavoritePress && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => onFavoritePress(webtoon.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.favoriteIcon}>
              {isFavorite ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    padding: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  thumbnailContainer: {
    position: 'relative',
    width: 80,
    height: 110,
  },
  thumbnail: {
    width: 80,
    height: 110,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
  },
  imageFallback: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.border,
  },
  fallbackText: {
    fontSize: 32,
  },
  platformBadge: {
    position: 'absolute',
    top: SPACING.xs,
    left: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  platformText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  progressText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  progressDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  favoriteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  favoriteIcon: {
    fontSize: 20,
  },
});
