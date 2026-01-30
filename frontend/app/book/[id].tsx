import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { COLORS, THEMES } from '../../constants/theme';
import { useAppStore } from '../../lib/store';
import { AdBanner } from '../../components/AdBanner';
import { api } from '../../lib/api';

const { width, height } = Dimensions.get('window');

interface Chapter {
  title: string;
  content: string;
}

export default function BookReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  
  const theme = useAppStore((s) => s.theme);
  const colors = THEMES[theme];
  const user = useAppStore((s) => s.user);
  
  const currentBook = useAppStore((s) => s.currentBook);
  const currentActivity = useAppStore((s) => s.currentActivity);
  const fetchBook = useAppStore((s) => s.fetchBook);
  const updateActivity = useAppStore((s) => s.updateActivity);
  const addHighlight = useAppStore((s) => s.addHighlight);
  const chaptersReadSinceAd = useAppStore((s) => s.chaptersReadSinceAd);
  const incrementChapterRead = useAppStore((s) => s.incrementChapterRead);
  const resetChapterCount = useAppStore((s) => s.resetChapterCount);
  const fetchFavorites = useAppStore((s) => s.fetchFavorites);
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    loadBook();
  }, [id]);

  useEffect(() => {
    // Update local favorite state when activity changes
    setIsFavorite(currentActivity?.is_favorite || false);
  }, [currentActivity]);

  const loadBook = async () => {
    if (!id) return;
    setLoading(true);
    const book = await fetchBook(parseInt(id));
    if (book?.content_body) {
      parseChapters(book.content_body);
    }
    setLoading(false);
  };

  const parseChapters = (content: string) => {
    const chapterRegex = /<h2>([^<]+)<\/h2>/gi;
    const matches = content.split(chapterRegex);
    
    const parsedChapters: Chapter[] = [];
    
    if (matches.length <= 1) {
      parsedChapters.push({
        title: currentBook?.title || 'Book',
        content: stripHtml(content),
      });
    } else {
      if (matches[0].trim()) {
        parsedChapters.push({
          title: 'Preface',
          content: stripHtml(matches[0]),
        });
      }
      
      for (let i = 1; i < matches.length; i += 2) {
        const title = matches[i]?.trim() || `Chapter ${Math.ceil(i / 2)}`;
        const content = matches[i + 1] || '';
        parsedChapters.push({
          title,
          content: stripHtml(content),
        });
      }
    }
    
    setChapters(parsedChapters);
    
    if (currentActivity?.last_position) {
      const chapterIndex = Math.floor(currentActivity.last_position * parsedChapters.length);
      setCurrentChapter(Math.min(chapterIndex, parsedChapters.length - 1));
    }
  };

  const stripHtml = (html: string) => {
    return html
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  };

  const goToChapter = (index: number) => {
    if (index < 0 || index >= chapters.length) return;
    
    if (index > currentChapter) {
      incrementChapterRead();
      if ((chaptersReadSinceAd + 1) >= 3) {
        setShowInterstitial(true);
        resetChapterCount();
        setTimeout(() => setShowInterstitial(false), 2000);
      }
    }
    
    setCurrentChapter(index);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    
    const progress = index / chapters.length;
    updateActivity({ 
      last_position: progress,
      chapter_read_count: (currentActivity?.chapter_read_count || 0) + 1 
    });
  };

  const handleToggleFavorite = async () => {
    if (!user || !currentBook) return;
    
    setFavoriteLoading(true);
    const newFavoriteStatus = !isFavorite;
    
    try {
      // Optimistically update UI
      setIsFavorite(newFavoriteStatus);
      
      // Save to database
      const activity = {
        user_id: user.id,
        book_id: currentBook.id,
        last_position: currentActivity?.last_position || 0,
        is_favorite: newFavoriteStatus,
        highlights: currentActivity?.highlights || [],
        chapter_read_count: currentActivity?.chapter_read_count || 0,
      };
      
      await api.post('/activity', activity);
      
      // Refresh favorites list
      await fetchFavorites();
      
      // Show confirmation
      if (newFavoriteStatus) {
        Alert.alert('Added to Favorites', `"${currentBook.title}" has been added to your favorites.`);
      } else {
        Alert.alert('Removed from Favorites', `"${currentBook.title}" has been removed from your favorites.`);
      }
    } catch (error) {
      // Revert on error
      setIsFavorite(!newFavoriteStatus);
      Alert.alert('Error', 'Failed to update favorites. Please try again.');
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    if (!currentBook) return;
    
    const shareData = {
      title: currentBook.title,
      text: `I'm reading "${currentBook.title}" by ${currentBook.author} on Libreya! Check out this free classic literature app.`,
      url: Platform.OS === 'web' ? window.location.href : `https://libreya.app/book/${currentBook.id}`,
    };

    try {
      // Check if Web Share API is available (modern browsers and mobile)
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to React Native Share
        const result = await Share.share({
          message: shareData.text,
          url: shareData.url,
          title: shareData.title,
        });
        
        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            console.log('Shared via:', result.activityType);
          }
        }
      }
    } catch (error: any) {
      // User cancelled or error
      if (error.name !== 'AbortError') {
        console.error('Share error:', error);
        // Fallback: copy to clipboard
        if (Platform.OS === 'web') {
          try {
            await navigator.clipboard.writeText(shareData.text + ' ' + shareData.url);
            Alert.alert('Copied!', 'Share link copied to clipboard.');
          } catch {
            Alert.alert('Share', shareData.text);
          }
        }
      }
    }
  };

  const handleCopyText = async () => {
    if (selectedText) {
      await Clipboard.setStringAsync(selectedText);
      Alert.alert('Copied', 'Text copied to clipboard');
    }
  };

  const handleHighlight = () => {
    if (selectedText) {
      addHighlight(selectedText, currentChapter / chapters.length, currentChapter);
      Alert.alert('Highlighted', 'Text has been saved to your highlights');
      setSelectedText('');
    }
  };

  const progress = chapters.length > 0 ? ((currentChapter + 1) / chapters.length) * 100 : 0;

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  if (!currentBook || chapters.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Book not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: currentBook.title,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                onPress={handleToggleFavorite} 
                style={styles.headerBtn}
                disabled={favoriteLoading}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFavorite ? COLORS.error : colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.headerBtn}>
                <Ionicons name="share-outline" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
        <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: COLORS.primary }]} />
      </View>
      
      {/* Chapter Info */}
      <View style={[styles.chapterHeader, { backgroundColor: colors.surface }]}>
        <Text style={[styles.chapterTitle, { color: colors.text }]} numberOfLines={1}>
          {chapters[currentChapter]?.title}
        </Text>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {currentChapter + 1} of {chapters.length} ({Math.round(progress)}%)
        </Text>
      </View>
      
      {/* Content */}
      <ScrollView
        ref={scrollRef}
        style={styles.content}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onTouchStart={() => setShowControls(!showControls)}
      >
        <Text
          style={[styles.bookText, { color: colors.text, fontSize }]}
          selectable
        >
          {chapters[currentChapter]?.content}
        </Text>
        
        {/* Ad Banner at end of chapter */}
        <View style={styles.chapterEndAd}>
          <AdBanner />
        </View>
        
        {/* Next/Previous buttons at end of chapter content */}
        <View style={styles.chapterNavButtons}>
          <TouchableOpacity
            onPress={() => goToChapter(currentChapter - 1)}
            disabled={currentChapter === 0}
            style={[
              styles.chapterNavBtn,
              { backgroundColor: currentChapter === 0 ? colors.border : COLORS.primary }
            ]}
          >
            <Ionicons name="chevron-back" size={20} color={currentChapter === 0 ? colors.textSecondary : COLORS.white} />
            <Text style={{ color: currentChapter === 0 ? colors.textSecondary : COLORS.white, fontWeight: '600' }}>
              Previous
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => goToChapter(currentChapter + 1)}
            disabled={currentChapter === chapters.length - 1}
            style={[
              styles.chapterNavBtn,
              { backgroundColor: currentChapter === chapters.length - 1 ? colors.border : COLORS.primary }
            ]}
          >
            <Text style={{ color: currentChapter === chapters.length - 1 ? colors.textSecondary : COLORS.white, fontWeight: '600' }}>
              Next
            </Text>
            <Ionicons name="chevron-forward" size={20} color={currentChapter === chapters.length - 1 ? colors.textSecondary : COLORS.white} />
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Bottom Controls */}
      {showControls && (
        <View style={[styles.controls, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 10 }]}>
          <View style={styles.fontControls}>
            <TouchableOpacity
              onPress={() => setFontSize(Math.max(14, fontSize - 2))}
              style={styles.controlBtn}
            >
              <Ionicons name="text" size={16} color={colors.text} />
              <Text style={{ color: colors.text }}>-</Text>
            </TouchableOpacity>
            <Text style={[styles.fontSizeText, { color: colors.text }]}>{fontSize}px</Text>
            <TouchableOpacity
              onPress={() => setFontSize(Math.min(28, fontSize + 2))}
              style={styles.controlBtn}
            >
              <Ionicons name="text" size={20} color={colors.text} />
              <Text style={{ color: colors.text }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Interstitial Ad Placeholder */}
      {showInterstitial && (
        <View style={styles.interstitialOverlay}>
          <View style={styles.interstitialContent}>
            <Text style={styles.interstitialText}>Advertisement</Text>
            <Text style={styles.interstitialSubtext}>Interstitial ad (every 3 chapters)</Text>
            <TouchableOpacity 
              style={styles.closeAdBtn}
              onPress={() => setShowInterstitial(false)}
            >
              <Text style={styles.closeAdText}>Close in 2s</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    padding: 8,
  },
  progressContainer: {
    height: 3,
    width: '100%',
  },
  progressBar: {
    height: '100%',
  },
  chapterHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  progressText: {
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  bookText: {
    lineHeight: 32,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  chapterEndAd: {
    marginTop: 32,
    marginBottom: 16,
  },
  chapterNavButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  chapterNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  controls: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  fontControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  fontSizeText: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
  },
  interstitialOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  interstitialContent: {
    backgroundColor: '#333',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  interstitialText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '600',
  },
  interstitialSubtext: {
    color: COLORS.gray,
    fontSize: 14,
    marginTop: 8,
  },
  closeAdBtn: {
    marginTop: 16,
    padding: 8,
  },
  closeAdText: {
    color: COLORS.accent,
    fontSize: 14,
  },
});
