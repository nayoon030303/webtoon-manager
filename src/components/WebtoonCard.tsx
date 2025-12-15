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
              마지막 읽음: {progress.lastEpisode}화
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
    fontWeight: '500',
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
