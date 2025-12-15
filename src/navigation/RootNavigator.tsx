/**
 * RootNavigator
 * Main stack navigator combining tabs and modal screens
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types';
import { MainTabs } from './MainTabs';
import { WebViewScreen } from '../screens';
import { COLORS } from '../constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      {/* Main tabs (Home, Favorites, Settings) */}
      <Stack.Screen name="MainTabs" component={MainTabs} />

      {/* WebView screen - slides up as a modal */}
      <Stack.Screen
        name="WebView"
        component={WebViewScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
};
