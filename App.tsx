/**
 * Webtoon Manager App
 *
 * A cross-platform mobile app for tracking webtoons from multiple platforms.
 * Features:
 * - View webtoons from Naver, Kakao, Lezhin
 * - Open webtoons in WebView
 * - Auto-detect episode from URL navigation
 * - Track reading progress locally
 * - Manage favorites
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
