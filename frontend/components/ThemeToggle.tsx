import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, THEMES } from '../constants/theme';
import { useAppStore } from '../lib/store';

export function ThemeToggle() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const colors = THEMES[theme];

  const themes = [
    { key: 'light', label: 'Light', icon: 'sunny-outline' },
    { key: 'sepia', label: 'Sepia', icon: 'leaf-outline' },
    { key: 'dark', label: 'Dark', icon: 'moon-outline' },
    { key: 'night', label: 'Night', icon: 'star-outline' },
  ] as const;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {themes.map((t) => (
        <TouchableOpacity
          key={t.key}
          style={[
            styles.option,
            theme === t.key && { backgroundColor: COLORS.primary },
          ]}
          onPress={() => setTheme(t.key)}
        >
          <Ionicons
            name={t.icon as any}
            size={20}
            color={theme === t.key ? COLORS.white : colors.text}
          />
          <Text
            style={[
              styles.label,
              { color: theme === t.key ? COLORS.white : colors.text },
            ]}
          >
            {t.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});
