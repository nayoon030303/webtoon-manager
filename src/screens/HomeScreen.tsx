/**
 * HomeScreen
 * Main screen displaying list of webtoons with search and filter functionality
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { Webtoon, Platform, RootStackParamList } from '../types';
import { DUMMY_WEBTOONS, COLORS, SPACING } from '../constants';
import { WebtoonCard, SearchBar, PlatformFilter } from '../components';
import { useProgress } from '../hooks';
import { useFavoritesContext } from '../contexts';
import { buildEpisodeUrl } from '../services/episodeParser';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MainTabs'
>;

const SCREEN_WIDTH = Dimensions.get('window').width;
const PLATFORMS: (Platform | null)[] = [null, 'naver', 'kakao', 'lezhin'];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  // Refs
  const scrollViewRef = useRef<ScrollView>(null);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Hooks
  const { refreshProgress, getWebtoonProgress } = useProgress();
  const { isFavorite, toggleFavorite } = useFavoritesContext();

  // Refresh progress when screen comes into focus (e.g., returning from WebView)
  useFocusEffect(
    useCallback(() => {
      refreshProgress();
    }, [refreshProgress])
  );

  // Filter webtoons based on search and platform
  const getFilteredWebtoons = useCallback((platform: Platform | null) => {
    return DUMMY_WEBTOONS.filter((webtoon) => {
      // Platform filter
      if (platform && webtoon.platform !== platform) {
        return false;
      }
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return webtoon.title.toLowerCase().includes(query);
      }
      return true;
    });
  }, [searchQuery]);

  // Get filtered webtoons for each platform
  const allWebtoons = useMemo(() => getFilteredWebtoons(null), [getFilteredWebtoons]);
  const naverWebtoons = useMemo(() => getFilteredWebtoons('naver'), [getFilteredWebtoons]);
  const kakaoWebtoons = useMemo(() => getFilteredWebtoons('kakao'), [getFilteredWebtoons]);
  const lezhinWebtoons = useMemo(() => getFilteredWebtoons('lezhin'), [getFilteredWebtoons]);

  // Handle webtoon press - navigate to WebView
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
    await refreshProgress();
    setRefreshing(false);
  }, [refreshProgress]);

  // Handle platform change (also scrolls to the corresponding page)
  const handlePlatformChange = useCallback((platform: Platform | null) => {
    setSelectedPlatform(platform);
    const pageIndex = PLATFORMS.findIndex(p => p === platform);
    scrollViewRef.current?.scrollTo({
      x: pageIndex * SCREEN_WIDTH,
      animated: true,
    });
  }, []);

  // Handle swipe (updates selected platform based on scroll position)
  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / SCREEN_WIDTH);

    if (pageIndex >= 0 && pageIndex < PLATFORMS.length) {
      const newPlatform = PLATFORMS[pageIndex];
      if (newPlatform !== selectedPlatform) {
        setSelectedPlatform(newPlatform);
      }
    }
  }, [selectedPlatform]);

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
      <Text style={styles.emptyIcon}>📚</Text>
      <Text style={styles.emptyText}>웹툰을 찾을 수 없습니다</Text>
      <Text style={styles.emptySubtext}>
        검색어나 필터를 변경해보세요
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>웹툰 매니저</Text>
      </View>

      {/* Search */}
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      {/* Platform Filter */}
      <PlatformFilter
        selectedPlatform={selectedPlatform}
        onSelect={handlePlatformChange}
      />

      {/* Swipeable Webtoon Lists */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.pagerContainer}
      >
        {/* All Webtoons Page */}
        <View style={styles.page}>
          <FlatList
            data={allWebtoons}
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
        </View>

        {/* Naver Webtoons Page */}
        <View style={styles.page}>
          <FlatList
            data={naverWebtoons}
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
        </View>

        {/* Kakao Webtoons Page */}
        <View style={styles.page}>
          <FlatList
            data={kakaoWebtoons}
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
        </View>

        {/* Lezhin Webtoons Page */}
        <View style={styles.page}>
          <FlatList
            data={lezhinWebtoons}
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
        </View>
      </ScrollView>
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
  pagerContainer: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
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
  },
});
