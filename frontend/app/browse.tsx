import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useAppStore, Book } from '../lib/store';
import { BookCard } from '../components/BookCard';
import { Footer } from '../components/Footer';
import { api } from '../lib/api';

export default function BrowseScreen() {
  const router = useRouter();
  const fontsLoaded = useAppStore((s) => s.fontsLoaded);
  const headingFont = fontsLoaded ? FONTS.heading : FONTS.headingFallback;
  const bodyFont = fontsLoaded ? FONTS.body : FONTS.bodyFallback;

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadBooks();
  }, [selectedCategory, searchQuery]);

  const loadData = async () => {
    try {
      const [booksData, catsData] = await Promise.all([
        api.get('/books?limit=200'),
        api.get('/books/categories/list'),
      ]);
      setBooks(booksData);
      setCategories(catsData);
    } catch (e) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async () => {
    try {
      let endpoint = '/books?limit=200';
      if (selectedCategory) endpoint += `&category=${selectedCategory}`;
      if (searchQuery) endpoint += `&search=${searchQuery}`;
      const data = await api.get(endpoint);
      setBooks(data);
    } catch (e) {
      // silent
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, { fontFamily: headingFont }]}>Browse Library</Text>
          <Text style={[styles.heroDesc, { fontFamily: bodyFont }]}>
            Discover timeless classics from the world's greatest authors
          </Text>
          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.gray} />
            <TextInput
              style={[styles.searchInput, { fontFamily: bodyFont }]}
              placeholder="Search by title or author..."
              placeholderTextColor={COLORS.gray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={COLORS.gray} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesBar} contentContainerStyle={styles.categoriesContent}>
          <TouchableOpacity
            style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.categoryText, { fontFamily: bodyFont }, !selectedCategory && styles.categoryTextActive]}>All</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            >
              <Text style={[styles.categoryText, { fontFamily: bodyFont }, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Books Grid */}
        <View style={styles.booksSection}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : books.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={48} color={COLORS.gray} />
              <Text style={[styles.emptyText, { fontFamily: bodyFont }]}>No books found</Text>
            </View>
          ) : (
            <View style={styles.booksGrid}>
              {books.map((book) => (
                <View key={book.id} style={styles.bookItem}>
                  <BookCard
                    book={book}
                    onPress={() => router.push(`/book/${book.id}` as any)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  heroSection: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 48,
    alignItems: 'center',
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    maxWidth: 500,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  categoriesBar: {
    backgroundColor: COLORS.secondary,
    maxHeight: 56,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.text,
  },
  categoryTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  booksSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bookItem: {
    width: '100%',
    maxWidth: 600,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 12,
  },
});
