import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, THEMES } from '../../constants/theme';
import { useAppStore, Book } from '../../lib/store';
import { BookCard } from '../../components/BookCard';
import { AdBanner, AdSpacer } from '../../components/AdBanner';
import { api } from '../../lib/api';

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppStore((s) => s.theme);
  const fontsLoaded = useAppStore((s) => s.fontsLoaded);
  const headingFont = fontsLoaded ? FONTS.heading : FONTS.headingFallback;
  const bodyFont = fontsLoaded ? FONTS.body : FONTS.bodyFallback;
  const colors = THEMES[theme];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
    handleSearch();
  }, []);

  // Debounced real-time search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [searchQuery, selectedCategory]);

  const loadCategories = async () => {
    try {
      const cats = await api.get('/books/categories/list');
      if (Array.isArray(cats)) setCategories(cats);
    } catch (e) {
      // silent
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      let endpoint = '/books?limit=100';
      if (searchQuery.trim()) {
        endpoint += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }
      if (selectedCategory && selectedCategory !== 'All') {
        endpoint += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      const data = await api.get(endpoint);
      if (Array.isArray(data)) setResults(data);
    } catch (error) {
      // Keep existing results
    } finally {
      setLoading(false);
    }
  };

  const handleBookPress = (book: Book) => {
    router.push(`/book/${book.id}` as any);
  };

  const allCategories = ['All', ...categories];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      {/* Search Bar - Clean, no inner border */}
      <View style={[
        styles.searchContainer,
        { backgroundColor: colors.surface },
        searchFocused && styles.searchContainerFocused,
      ]}>
        <Ionicons name="search" size={20} color={searchFocused ? COLORS.accent : colors.textSecondary} />
        <TextInput
          style={[
            styles.searchInput,
            { color: colors.text, fontFamily: bodyFont },
            Platform.OS === 'web' && ({
              outlineStyle: 'none',
              outlineWidth: 0,
            } as any),
          ]}
          placeholder="Search books, authors..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        {loading && searchQuery.length > 0 && (
          <ActivityIndicator size="small" color={COLORS.accent} />
        )}
      </View>

      {/* Categories */}
      <FlatList
        horizontal
        data={allCategories}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        style={styles.categoryList}
        contentContainerStyle={styles.categoryContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              {
                backgroundColor:
                  selectedCategory === item ? COLORS.primary : colors.surface,
                borderColor: selectedCategory === item ? COLORS.primary : colors.border,
              },
            ]}
            onPress={() => setSelectedCategory(item)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryText,
                { color: selectedCategory === item ? COLORS.white : colors.text, fontFamily: bodyFont },
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.resultItem}>
            <BookCard book={item} onPress={() => handleBookPress(item)} />
          </View>
        )}
        contentContainerStyle={styles.resultsList}
        ListHeaderComponent={
          results.length > 0 ? (
            <View style={styles.searchAdContainer}>
              <Text style={[styles.resultsCount, { color: colors.textSecondary, fontFamily: bodyFont }]}>
                {results.length} result{results.length !== 1 ? 's' : ''}
                {searchQuery ? ` for "${searchQuery}"` : ''}
              </Text>
              <AdBanner position="inline" />
            </View>
          ) : null
        }
        ListFooterComponent={
          results.length > 0 ? (
            <View>
              <AdBanner position="bottom" />
              <AdSpacer height={80} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <>
                <Ionicons name="search-outline" size={56} color={colors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: headingFont }]}>
                  No Books Found
                </Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: bodyFont }]}>
                  {searchQuery
                    ? `No results for "${searchQuery}". Try a different search term.`
                    : 'Start typing to search our library of classics.'}
                </Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  searchContainerFocused: {
    borderColor: COLORS.accent,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    borderWidth: 0,
    padding: 0,
    margin: 0,
  },
  categoryList: {
    maxHeight: 50,
  },
  categoryContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 0,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  searchAdContainer: {
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 13,
    marginBottom: 12,
  },
  resultsList: {
    padding: 16,
  },
  resultItem: {
    marginBottom: 0,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
});
