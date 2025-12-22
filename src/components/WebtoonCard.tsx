/**
 * WebtoonCard component
 * Displays a single webtoon with thumbnail, title, platform badge, and reading progress
 */

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
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

export const WebtoonCard: React.FC<WebtoonCardProps> = ({
  webtoon,
  progress,
  isFavorite = false,
  onPress,
  onFavoritePress,
}) => {
  const platformConfig = PLATFORM_CONFIG[webtoon.platform];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(webtoon)}
      activeOpacity={0.7}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: webtoon.thumbnail }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
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
  },
  thumbnail: {
    width: 80,
    height: 110,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
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
