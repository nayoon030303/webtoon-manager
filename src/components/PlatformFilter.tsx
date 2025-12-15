/**
 * PlatformFilter component
 * Horizontal scrollable filter chips for webtoon platforms
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Platform } from '../types';
import { PLATFORM_CONFIG, COLORS, SPACING, RADIUS } from '../constants';

interface PlatformFilterProps {
  selectedPlatform: Platform | null;
  onSelect: (platform: Platform | null) => void;
}

export const PlatformFilter: React.FC<PlatformFilterProps> = ({
  selectedPlatform,
  onSelect,
}) => {
  const platforms = Object.keys(PLATFORM_CONFIG) as Platform[];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* All filter */}
        <TouchableOpacity
          style={[
            styles.chip,
            selectedPlatform === null && styles.chipSelected,
          ]}
          onPress={() => onSelect(null)}
        >
          <Text
            style={[
              styles.chipText,
              selectedPlatform === null && styles.chipTextSelected,
            ]}
          >
            전체
          </Text>
        </TouchableOpacity>

        {/* Platform filters */}
        {platforms.map((platform) => {
          const config = PLATFORM_CONFIG[platform];
          const isSelected = selectedPlatform === platform;

          return (
            <TouchableOpacity
              key={platform}
              style={[
                styles.chip,
                isSelected && {
                  backgroundColor: config.color,
                  borderColor: config.color,
                },
              ]}
              onPress={() => onSelect(isSelected ? null : platform)}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                ]}
              >
                {config.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: COLORS.background,
  },
});
