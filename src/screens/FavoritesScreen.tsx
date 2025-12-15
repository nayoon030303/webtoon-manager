/**
 * FavoritesScreen
 * Displays user's favorite webtoons
 */

import React, { useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { Webtoon, RootStackParamList } from '../types';
import { DUMMY_WEBTOONS, COLORS, SPACING } from '../constants';
import { WebtoonCard } from '../components';
import { useProgress, useFavorites } from '../hooks';

type FavoritesScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MainTabs'
>;

export const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();

  // Hooks
  const { getWebtoonProgress, refreshProgress } = useProgress();
  const {
    favorites,
    isFavorite,
    toggleFavorite,
    refreshFavorites,
  } = useFavorites();

  const [refreshing, setRefreshing] = React.useState(false);

  // Get favorite webtoons from the dummy data
  const favoriteWebtoons = useMemo(() => {
    const favoriteIds = new Set(favorites.map((f) => f.webtoonId));
    return DUMMY_WEBTOONS.filter((w) => favoriteIds.has(w.id));
  }, [favorites]);

  // Handle webtoon press
  const handleWebtoonPress = useCallback(
    (webtoon: Webtoon) => {
      navigation.navigate('WebView', { webtoon });
    },
    [navigation]
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
      <Text style={styles.emptyIcon}>💝</Text>
      <Text style={styles.emptyText}>즐겨찾기가 비어있습니다</Text>
      <Text style={styles.emptySubtext}>
        웹툰 목록에서 하트를 눌러 추가하세요
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>즐겨찾기</Text>
        <Text style={styles.headerSubtitle}>
          {favoriteWebtoons.length}개의 웹툰
        </Text>
      </View>

      {/* Favorites List */}
      <FlatList
        data={favoriteWebtoons}
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
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
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
