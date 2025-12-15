/**
 * SettingsScreen
 * App settings and data management
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SPACING, RADIUS } from '../constants';
import { clearAllData, getSettings, updateSettings } from '../services/storage';
import { AppSettings } from '../types';

// Settings row component
interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isDestructive?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  label,
  value,
  onPress,
  rightElement,
  isDestructive = false,
}) => (
  <TouchableOpacity
    style={styles.settingsRow}
    onPress={onPress}
    disabled={!onPress && !rightElement}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <Text
      style={[styles.settingsLabel, isDestructive && styles.destructiveText]}
    >
      {label}
    </Text>
    {rightElement || (
      <Text style={styles.settingsValue}>{value}</Text>
    )}
  </TouchableOpacity>
);

// Settings section component
interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

export const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    notifications: true,
  });

  // Load settings on mount
  React.useEffect(() => {
    const loadSettings = async () => {
      const savedSettings = await getSettings();
      setSettings(savedSettings);
    };
    loadSettings();
  }, []);

  // Toggle notifications
  const handleNotificationToggle = useCallback(async (value: boolean) => {
    setSettings((prev) => ({ ...prev, notifications: value }));
    await updateSettings({ notifications: value });
  }, []);

  // Clear all data
  const handleClearData = useCallback(() => {
    Alert.alert(
      '데이터 초기화',
      '모든 읽기 기록과 즐겨찾기가 삭제됩니다. 계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '초기화',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('완료', '모든 데이터가 초기화되었습니다.');
          },
        },
      ]
    );
  }, []);

  // Show app info
  const handleShowAbout = useCallback(() => {
    Alert.alert(
      '웹툰 매니저',
      '버전 1.0.0\n\n여러 플랫폼의 웹툰을 한 곳에서 관리하고\n읽기 진행상황을 추적하세요.\n\n© 2024 Webtoon Manager',
      [{ text: '확인' }]
    );
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>설정</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* General Settings */}
        <SettingsSection title="일반">
          <SettingsRow
            label="알림"
            rightElement={
              <Switch
                value={settings.notifications}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.background}
              />
            }
          />
          <SettingsRow
            label="테마"
            value={settings.theme === 'light' ? '라이트' : '다크'}
            onPress={() => {
              Alert.alert('준비 중', '테마 변경 기능은 준비 중입니다.');
            }}
          />
        </SettingsSection>

        {/* Data Management */}
        <SettingsSection title="데이터 관리">
          <SettingsRow
            label="읽기 기록 내보내기"
            value="→"
            onPress={() => {
              Alert.alert('준비 중', '내보내기 기능은 준비 중입니다.');
            }}
          />
          <SettingsRow
            label="데이터 초기화"
            isDestructive
            onPress={handleClearData}
          />
        </SettingsSection>

        {/* About */}
        <SettingsSection title="정보">
          <SettingsRow
            label="앱 정보"
            value="1.0.0"
            onPress={handleShowAbout}
          />
          <SettingsRow
            label="이용약관"
            value="→"
            onPress={() => {
              Alert.alert('이용약관', '이 앱은 개인 학습 및 웹툰 관리 목적으로만 사용해주세요.\n\n각 웹툰 플랫폼의 이용약관을 준수해야 합니다.');
            }}
          />
          <SettingsRow
            label="개인정보 처리방침"
            value="→"
            onPress={() => {
              Alert.alert('개인정보 처리방침', '이 앱은 사용자의 읽기 기록을 기기 내에만 저장합니다.\n\n어떤 데이터도 외부 서버로 전송되지 않습니다.');
            }}
          />
        </SettingsSection>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            웹툰 매니저 v1.0.0
          </Text>
          <Text style={styles.footerSubtext}>
            Made with ❤️ for webtoon lovers
          </Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionContent: {
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  settingsLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  settingsValue: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  destructiveText: {
    color: COLORS.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  footerSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});
