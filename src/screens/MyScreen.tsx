/**
 * MyScreen
 * Displays user's recent webtoons and favorites with tab filter
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { Webtoon, RootStackParamList } from '../types';
import { DUMMY_WEBTOONS, COLORS, SPACING, RADIUS } from '../constants';
import { WebtoonCard } from '../components';
import { useProgress } from '../hooks';
import { useFavoritesContext } from '../contexts';
import { buildEpisodeUrl } from '../services/episodeParser';

type MyScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MainTabs'
>;

type TabType = 'recent' | 'favorites';

const TABS: { key: TabType; label: string }[] = [
  { key: 'recent', label: '최근 본 웹툰' },
  { key: 'favorites', label: '즐겨찾기' },
];

export const MyScreen: React.FC = () => {
  const navigation = useNavigation<MyScreenNavigationProp>();

  // State
  const [selectedTab, setSelectedTab] = useState<TabType>('recent');
  const [refreshing, setRefreshing] = useState(false);

  // Hooks
  const { progress, getWebtoonProgress, refreshProgress } = useProgress();
  const {
    favorites,
    isFavorite,
    toggleFavorite,
    refreshFavorites,
  } = useFavoritesContext();

  // Refresh data when screen comes into focus (e.g., returning from WebView)
  useFocusEffect(
    useCallback(() => {
      refreshProgress();
      refreshFavorites();
    }, [refreshProgress, refreshFavorites])
  );

  // Get recent webtoons (sorted by lastReadAt)
  const recentWebtoons = useMemo(() => {
    const progressEntries = Object.values(progress);
    if (progressEntries.length === 0) return [];

    // Sort by lastReadAt descending
    const sortedProgress = [...progressEntries].sort(
      (a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime()
    );

    // Get webtoon data for each progress entry
    return sortedProgress
      .map((p) => DUMMY_WEBTOONS.find((w) => w.id === p.webtoonId))
      .filter((w): w is Webtoon => w !== undefined);
  }, [progress]);

  // Get favorite webtoons
  const favoriteWebtoons = useMemo(() => {
    const favoriteIds = new Set(favorites.map((f) => f.webtoonId));
    return DUMMY_WEBTOONS.filter((w) => favoriteIds.has(w.id));
  }, [favorites]);

  // Get current list based on selected tab
  const currentWebtoons = selectedTab === 'recent' ? recentWebtoons : favoriteWebtoons;

  // Handle webtoon press
  // If there's reading progress, navigate to the last read episode
  const handleWebtoonPress = useCallback(
    (webtoon: Webtoon) => {
      const webtoonProgress = getWebtoonProgress(webtoon.id);

      if (webtoonProgress && webtoonProgress.lastEpisode > 0) {
        // Build URL for the last read episode
        const episodeUrl = buildEpisodeUrl(webtoon, webtoonProgress.lastEpisode);
        navigation.navigate('WebView', {
          webtoon: { ...webtoon, url: episodeUrl }
        });
      } else {
        // No progress, go to webtoon's main page
        navigation.navigate('WebView', { webtoon });
      }
    },
    [navigation, getWebtoonProgress]
  );

  // Handle favorite toggle
  const handleFavoritePress = useCallback(
    (webtoonId: string) => {
      toggleFavorite(webtoonId);
    },
    [toggleFavorite]
  );

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refreshProgress(), refreshFavorites()]);
    setRefreshing(false);
  }, [refreshProgress, refreshFavorites]);

  // Render webtoon item
  const renderWebtoonItem = useCallback(
    ({ item }: { item: Webtoon }) => (
      <WebtoonCard
        webtoon={item}
        progress={getWebtoonProgress(item.id)}
        isFavorite={isFavorite(item.id)}
        onPress={handleWebtoonPress}
        onFavoritePress={handleFavoritePress}
      />
    ),
    [getWebtoonProgress, isFavorite, handleWebtoonPress, handleFavoritePress]
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>
        {selectedTab === 'recent' ? '🕐' : '❤️'}
      </Text>
      <Text style={styles.emptyText}>
        {selectedTab === 'recent'
          ? '최근 본 웹툰이 없습니다'
          : '즐겨찾기가 비어있습니다'}
      </Text>
      <Text style={styles.emptySubtext}>
        {selectedTab === 'recent'
          ? '웹툰을 읽으면 여기에 표시됩니다'
          : '웹툰의 하트를 눌러 추가하세요'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My</Text>
      </View>

      {/* Tab Filter */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {TABS.map((tab) => {
            const isSelected = selectedTab === tab.key;
            const count = tab.key === 'recent' ? recentWebtoons.length : favoriteWebtoons.length;

            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipSelected,
                ]}
                onPress={() => setSelectedTab(tab.key)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextSelected,
                  ]}
                >
                  {tab.label}
                </Text>
                <View style={[
                  styles.countBadge,
                  isSelected && styles.countBadgeSelected,
                ]}>
                  <Text style={[
                    styles.countText,
                    isSelected && styles.countTextSelected,
                  ]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Webtoon List */}
      <FlatList
        data={currentWebtoons}
        keyExtractor={(item) => item.id}
        renderItem={renderWebtoonItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  filterContainer: {
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  filterScrollContent: {
    paddingHorizontal: SPACING.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
  },
  filterChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: COLORS.background,
  },
  countBadge: {
    marginLeft: SPACING.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
  },
  countBadgeSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  countTextSelected: {
    color: COLORS.background,
  },
  listContent: {
    paddingVertical: SPACING.sm,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
});
