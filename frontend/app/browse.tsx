import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../constants/theme';
import { useAppStore, Book } from '../lib/store';
import { BookCard } from '../components/BookCard';
import { Footer } from '../components/Footer';
import { api } from '../lib/api';

export default function BrowseScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const fontsLoaded = useAppStore((s) => s.fontsLoaded);
  const headingFont = fontsLoaded ? FONTS.heading : FONTS.headingFallback;
  const bodyFont = fontsLoaded ? FONTS.body : FONTS.bodyFallback;

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = width < 768;
  const bookWidth = isMobile ? '100%' : '50%';

  useEffect(() => {
    loadInitialData();
  }, []);

  // Debounced search - real-time as user types
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      loadBooks();
    }, 300);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [searchQuery, selectedCategory]);

  const loadInitialData = async () => {
    try {
      const [booksData, catsData] = await Promise.all([
        api.get('/books?limit=200'),
        api.get('/books/categories/list'),
      ]);
      if (Array.isArray(booksData)) setBooks(booksData);
      if (Array.isArray(catsData)) setCategories(catsData);
    } catch (e) {
      // Silent
    } finally {
      setLoading(false);
    }
  };

  const loadBooks = async () => {
    setSearching(true);
    try {
      let endpoint = '/books?limit=200';
      if (selectedCategory) endpoint += `&category=${encodeURIComponent(selectedCategory)}`;
      if (searchQuery.trim()) endpoint += `&search=${encodeURIComponent(searchQuery.trim())}`;
      const data = await api.get(endpoint);
      if (Array.isArray(data)) setBooks(data);
    } catch (e) {
      // Silent - keep existing results
    } finally {
      setSearching(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={true}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={[styles.heroTitle, { fontFamily: headingFont }]}>Browse Library</Text>
          <Text style={[styles.heroDesc, { fontFamily: bodyFont }]}>
            Discover timeless classics from the world's greatest authors
          </Text>

          {/* Search Bar - Clean, no inner border */}
          <View style={[
            styles.searchContainer,
            searchFocused && styles.searchContainerFocused,
          ]}>
            <Ionicons name="search" size={20} color={searchFocused ? COLORS.accent : COLORS.gray} />
            <TextInput
              style={[
                styles.searchInput,
                { fontFamily: bodyFont },
                Platform.OS === 'web' && ({
                  outlineStyle: 'none',
                  outlineWidth: 0,
                } as any),
              ]}
              placeholder="Search by title or author..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              returnKeyType="search"
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={22} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            ) : null}
            {searching && <ActivityIndicator size="small" color={COLORS.accent} />}
          </View>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesBar}
          contentContainerStyle={styles.categoriesContent}
        >
          <TouchableOpacity
            style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(null)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.categoryText,
              { fontFamily: bodyFont },
              !selectedCategory && styles.categoryTextActive,
            ]}>All</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.categoryText,
                { fontFamily: bodyFont },
                selectedCategory === cat && styles.categoryTextActive,
              ]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results count */}
        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsCount, { fontFamily: bodyFont }]}>
            {loading ? 'Loading...' : `${books.length} book${books.length !== 1 ? 's' : ''} found`}
            {searchQuery ? ` for "${searchQuery}"` : ''}
            {selectedCategory ? ` in ${selectedCategory}` : ''}
          </Text>
        </View>

        {/* Books Grid */}
        <View style={styles.booksSection}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : books.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={56} color={COLORS.gray} />
              <Text style={[styles.emptyTitle, { fontFamily: headingFont }]}>No Books Found</Text>
              <Text style={[styles.emptyText, { fontFamily: bodyFont }]}>
                {searchQuery
                  ? `We couldn't find any books matching "${searchQuery}". Try a different search term.`
                  : 'No books available in this category yet.'}
              </Text>
              {(searchQuery || selectedCategory) && (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => { setSearchQuery(''); setSelectedCategory(null); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.clearBtnText, { fontFamily: bodyFont }]}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.booksGrid}>
              {books.map((book) => (
                <View key={book.id} style={[styles.bookItem, { maxWidth: isMobile ? '100%' : 600 }]}>
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: '100%',
    maxWidth: 500,
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  searchContainerFocused: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.white,
    borderWidth: 0,
    padding: 0,
    margin: 0,
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
  resultsHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  resultsCount: {
    fontSize: 14,
    color: COLORS.gray,
  },
  booksSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 22,
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 400,
  },
  clearBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  clearBtnText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '500',
  },
});
