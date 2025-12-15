/**
 * SearchBar component
 * Simple search input for filtering webtoons
 */

import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = '웹툰 검색...',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: COLORS.text,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  clearIcon: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
