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

// Generate HTML to display thumbnail image
const getThumbnailHTML = (thumbnailUrl: string): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: #F8FAFC;
          }
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }
        </style>
      </head>
      <body>
        <img src="${thumbnailUrl}" alt="Webtoon Thumbnail" />
      </body>
    </html>
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
          source={{ html: getThumbnailHTML(webtoon.thumbnail) }}
          style={styles.thumbnail}
          scrollEnabled={false}
          bounces={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          pointerEvents="none"
          onError={() => {
            console.log('WebView 로딩 실패:', webtoon.thumbnail);
            setImageError(true);
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
