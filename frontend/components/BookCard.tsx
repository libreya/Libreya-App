import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, THEMES } from '../constants/theme';
import { Book, useAppStore } from '../lib/store';

interface BookCardProps {
  book: Book;
  onPress: () => void;
  compact?: boolean;
}

export function BookCard({ book, onPress, compact }: BookCardProps) {
  const theme = useAppStore((s) => s.theme);
  const colors = THEMES[theme];

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, { backgroundColor: colors.surface }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {book.cover_image ? (
          <Image
            source={{ uri: book.cover_image }}
            style={styles.compactCover}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.compactCover, styles.placeholderCover]}>
            <Text style={styles.placeholderTitle} numberOfLines={2}>
              {book.title}
            </Text>
            <Text style={styles.placeholderAuthor} numberOfLines={1}>
              {book.author}
            </Text>
          </View>
        )}
        <Text style={[styles.compactTitle, { color: colors.text }]} numberOfLines={1}>
          {book.title}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {book.cover_image ? (
        <Image
          source={{ uri: book.cover_image }}
          style={styles.cover}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.cover, styles.placeholderCover]}>
          <Text style={styles.placeholderTitle} numberOfLines={3}>
            {book.title}
          </Text>
          <Text style={styles.placeholderAuthor} numberOfLines={2}>
            {book.author}
          </Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={[styles.author, { color: colors.textSecondary }]} numberOfLines={1}>
          {book.author}
        </Text>
        <View style={styles.meta}>
          {book.category && (
            <View style={[styles.badge, { backgroundColor: COLORS.accent }]}>
              <Text style={styles.badgeText}>{book.category}</Text>
            </View>
          )}
          <View style={styles.readCount}>
            <Ionicons name="eye-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.readCountText, { color: colors.textSecondary }]}>
              {book.read_count}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cover: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  placeholderCover: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  placeholderTitle: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  placeholderAuthor: {
    color: COLORS.secondary,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  readCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readCountText: {
    fontSize: 12,
  },
  compactCard: {
    width: 120,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  compactCover: {
    width: 120,
    height: 160,
  },
  compactTitle: {
    fontSize: 12,
    fontWeight: '500',
    padding: 8,
  },
});
