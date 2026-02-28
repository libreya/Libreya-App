import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, THEMES } from '../../constants/theme';
import { useAppStore, Book } from '../../lib/store';
import { BookCard } from '../../components/BookCard';
import { AdBanner } from '../../components/AdBanner';

const { width } = Dimensions.get('window');

export default function LibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppStore((s) => s.theme);
  const colors = THEMES[theme];
  
  const books = useAppStore((s) => s.books);
  const featuredBooks = useAppStore((s) => s.featuredBooks);
  const recommendedBooks = useAppStore((s) => s.recommendedBooks);
  const fetchBooks = useAppStore((s) => s.fetchBooks);
  const fetchFeaturedBooks = useAppStore((s) => s.fetchFeaturedBooks);
  const fetchRecommendedBooks = useAppStore((s) => s.fetchRecommendedBooks);
  
  const [refreshing, setRefreshing] = React.useState(false);
  const [showAllBooks, setShowAllBooks] = useState(false);
  const INITIAL_BOOKS_COUNT = 12;

  const loadData = async () => {
    await Promise.all([
      fetchBooks(),
      fetchFeaturedBooks(),
      fetchRecommendedBooks(),
    ]);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleBookPress = (book: Book) => {
    router.push(`/book/${book.id}`);
  };

  const renderHeroSection = () => (
    <View style={styles.heroContainer}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800' }}
        style={styles.heroImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(90,31,43,0.9)', COLORS.primary]}
        style={styles.heroGradient}
      >
        <Text style={styles.heroTitle}>Welcome to Libreya</Text>
        <Text style={styles.heroSubtitle}>Your Gateway to Classic Literature</Text>
        <Text style={styles.heroBookCount}>300+ Classic Books</Text>
      </LinearGradient>
    </View>
  );

  const renderSection = (title: string, data: Book[], horizontal = true) => {
    const displayData = horizontal ? data : (showAllBooks ? data : data.slice(0, INITIAL_BOOKS_COUNT));
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
          {!horizontal && data.length > INITIAL_BOOKS_COUNT && (
            <TouchableOpacity 
              style={[styles.viewAllButton, { backgroundColor: COLORS.primary }]}
              onPress={() => setShowAllBooks(!showAllBooks)}
            >
              <Text style={styles.viewAllButtonText}>
                {showAllBooks ? 'Show Less' : `View All ${data.length}`}
              </Text>
              <Ionicons 
                name={showAllBooks ? 'chevron-up' : 'chevron-down'} 
                size={16} 
                color={COLORS.white} 
              />
            </TouchableOpacity>
          )}
        </View>
        {horizontal ? (
          <FlatList
            horizontal
            data={data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <BookCard book={item} onPress={() => handleBookPress(item)} compact />
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        ) : (
          <>
            <View style={styles.gridList}>
              {displayData.map((item) => (
                <BookCard key={item.id} book={item} onPress={() => handleBookPress(item)} />
              ))}
            </View>
            {!showAllBooks && data.length > INITIAL_BOOKS_COUNT && (
              <TouchableOpacity 
                style={[styles.loadMoreButton, { borderColor: COLORS.primary }]}
                onPress={() => setShowAllBooks(true)}
              >
                <Text style={[styles.loadMoreText, { color: COLORS.primary }]}>
                  Load All {data.length} Books
                </Text>
                <Ionicons name="arrow-down" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            )}
            {showAllBooks && data.length > INITIAL_BOOKS_COUNT && (
              <TouchableOpacity 
                style={[styles.loadMoreButton, { borderColor: COLORS.primary }]}
                onPress={() => setShowAllBooks(false)}
              >
                <Text style={[styles.loadMoreText, { color: COLORS.primary }]}>
                  Show Less
                </Text>
                <Ionicons name="arrow-up" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {renderHeroSection()}
        
        {featuredBooks.length > 0 && renderSection('Featured Books', featuredBooks)}
        
        <AdBanner />
        
        {recommendedBooks.length > 0 && renderSection('Recommended For You', recommendedBooks)}
        
        {books.length > 0 && renderSection('All Books', books, false)}
        
        {/* Bottom Ad Banner */}
        <View style={styles.bottomAdContainer}>
          <AdBanner />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  heroBookCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  section: {
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  viewAllButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 2,
    borderRadius: 12,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '600',
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
  gridList: {
    paddingHorizontal: 16,
  },
  bottomAdContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
});
