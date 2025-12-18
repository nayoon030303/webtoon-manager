/**
 * MainTabs
 * Bottom tab navigation for Home, Favorites, and Settings
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { MainTabParamList } from '../types';
import { HomeScreen, MyScreen, SettingsScreen } from '../screens';
import { COLORS } from '../constants';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab bar icon component
interface TabIconProps {
  focused: boolean;
  icon: string;
  activeIcon: string;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, icon, activeIcon }) => (
  <Text style={styles.tabIcon}>{focused ? activeIcon : icon}</Text>
);

export const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🏠" activeIcon="🏠" />
          ),
        }}
      />
      <Tab.Screen
        name="My"
        component={MyScreen}
        options={{
          tabBarLabel: 'My',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="👤" activeIcon="👤" />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: '설정',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="⚙️" activeIcon="⚙️" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 84,
    paddingTop: 8,
    paddingBottom: 24,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabIcon: {
    fontSize: 24,
  },
});
