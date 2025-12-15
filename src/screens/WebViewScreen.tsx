/**
 * WebViewScreen
 * Displays webtoon content in WebView and tracks reading progress
 * Detects episode number from URL navigation
 */

import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types';
import { COLORS, SPACING, RADIUS } from '../constants';
import { extractEpisodeFromUrl, isValidWebtoonUrl } from '../services/episodeParser';
import { useProgress } from '../hooks';

type WebViewScreenProps = NativeStackScreenProps<RootStackParamList, 'WebView'>;

export const WebViewScreen: React.FC<WebViewScreenProps> = ({
  route,
  navigation,
}) => {
  const { webtoon } = route.params;
  const webViewRef = useRef<WebView>(null);

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(webtoon.url);
  const [detectedEpisode, setDetectedEpisode] = useState<number | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  // Progress hook
  const { updateWebtoonProgress, getWebtoonProgress } = useProgress();
  const savedProgress = getWebtoonProgress(webtoon.id);

  /**
   * Handle navigation state changes in WebView
   * Extracts episode number from URL and updates progress
   */
  const handleNavigationStateChange = useCallback(
    (navState: WebViewNavigation) => {
      const { url, canGoBack: navCanGoBack } = navState;

      setCurrentUrl(url);
      setCanGoBack(navCanGoBack);

      // Only process if URL belongs to the webtoon's domain
      if (!isValidWebtoonUrl(url, webtoon)) {
        return;
      }

      // Extract episode number from URL
      const episode = extractEpisodeFromUrl(url, webtoon);

      if (episode !== null) {
        setDetectedEpisode(episode);

        // Update progress in storage (only if higher than current)
        updateWebtoonProgress(webtoon.id, episode);

        console.log(`[WebView] Detected episode ${episode} for ${webtoon.title}`);
      }
    },
    [webtoon, updateWebtoonProgress]
  );

  // Go back in WebView history
  const handleGoBack = useCallback(() => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    }
  }, [canGoBack]);

  // Close WebView and return to list
  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Refresh WebView
  const handleRefresh = useCallback(() => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Custom Header */}
      <View style={styles.header}>
        {/* Back/Close button */}
        <TouchableOpacity
          style={styles.headerButton}
          onPress={canGoBack ? handleGoBack : handleClose}
        >
          <Text style={styles.headerButtonText}>
            {canGoBack ? '←' : '✕'}
          </Text>
        </TouchableOpacity>

        {/* Title and episode info */}
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {webtoon.title}
          </Text>
          {detectedEpisode && (
            <Text style={styles.episodeIndicator}>
              {detectedEpisode}화 읽는 중
            </Text>
          )}
        </View>

        {/* Refresh button */}
        <TouchableOpacity style={styles.headerButton} onPress={handleRefresh}>
          <Text style={styles.headerButtonText}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Progress indicator bar */}
      {savedProgress && (
        <View style={styles.progressBar}>
          <Text style={styles.progressBarText}>
            📖 마지막 읽음: {savedProgress.lastEpisode}화
          </Text>
        </View>
      )}

      {/* WebView */}
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: webtoon.url }}
          style={styles.webView}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          // Allow JavaScript for interactive webtoon pages
          javaScriptEnabled={true}
          // Allow media playback
          mediaPlaybackRequiresUserAction={false}
          // Enable DOM storage
          domStorageEnabled={true}
          // Allow mixed content (some webtoon sites use mixed http/https)
          mixedContentMode="compatibility"
          // User agent for better compatibility
          userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
          // Pull to refresh on iOS
          pullToRefreshEnabled={true}
          // Handle errors gracefully
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error:', nativeEvent);
          }}
        />

        {/* Loading overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>로딩 중...</Text>
          </View>
        )}
      </View>

      {/* Bottom info bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.urlText} numberOfLines={1}>
          {currentUrl}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  headerButtonText: {
    fontSize: 24,
    color: COLORS.text,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  episodeIndicator: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  progressBar: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  progressBarText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  bottomBar: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  urlText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
