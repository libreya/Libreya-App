import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, THEMES } from '../constants/theme';
import { useAppStore } from '../lib/store';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  type?: 'error' | 'offline' | 'empty';
}

export function ErrorMessage({ message, onRetry, type = 'error' }: ErrorMessageProps) {
  const theme = useAppStore((s) => s.theme);
  const colors = THEMES[theme];

  const getIcon = () => {
    switch (type) {
      case 'offline':
        return 'cloud-offline-outline';
      case 'empty':
        return 'book-outline';
      default:
        return 'alert-circle-outline';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Ionicons 
        name={getIcon()} 
        size={48} 
        color={type === 'error' ? COLORS.error : colors.textSecondary} 
      />
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Ionicons name="refresh-outline" size={20} color={COLORS.primary} />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    margin: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(90,31,43,0.1)',
    borderRadius: 8,
    gap: 8,
  },
  retryText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
