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
  
  const currentBook = useAppStore((s) => s.currentBook);
  const currentActivity = useAppStore((s) => s.currentActivity);
  const fetchBook = useAppStore((s) => s.fetchBook);
  const updateActivity = useAppStore((s) => s.updateActivity);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const addHighlight = useAppStore((s) => s.addHighlight);
  const chaptersReadSinceAd = useAppStore((s) => s.chaptersReadSinceAd);
  const incrementChapterRead = useAppStore((s) => s.incrementChapterRead);
  const resetChapterCount = useAppStore((s) => s.resetChapterCount);
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBook();
  }, [id]);

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
    // Parse HTML content into chapters
    const chapterRegex = /<h2>([^<]+)<\/h2>/gi;
    const matches = content.split(chapterRegex);
    
    const parsedChapters: Chapter[] = [];
    
    if (matches.length <= 1) {
      // No chapters found, treat entire content as one chapter
      parsedChapters.push({
        title: currentBook?.title || 'Book',
        content: stripHtml(content),
      });
    } else {
      // First item before any chapter heading
      if (matches[0].trim()) {
        parsedChapters.push({
          title: 'Preface',
          content: stripHtml(matches[0]),
        });
      }
      
      // Parse chapters
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
    
    // Restore last position
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
    
    // Check if we need to show interstitial ad (every 3 chapters)
    if (index > currentChapter) {
      incrementChapterRead();
      if ((chaptersReadSinceAd + 1) >= 3) {
        setShowInterstitial(true);
        resetChapterCount();
        // In a real app, show the ad here
        setTimeout(() => setShowInterstitial(false), 2000);
      }
    }
    
    setCurrentChapter(index);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    
    // Save progress
    const progress = index / chapters.length;
    updateActivity({ 
      last_position: progress,
      chapter_read_count: (currentActivity?.chapter_read_count || 0) + 1 
    });
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

  const handleShare = async () => {
    if (!currentBook) return;
    try {
      await Share.share({
        message: `I'm reading "${currentBook.title}" by ${currentBook.author} on Libreya!`,
      });
    } catch (error) {
      console.error(error);
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
              <TouchableOpacity onPress={() => toggleFavorite(currentBook.id)} style={styles.headerBtn}>
                <Ionicons
                  name={currentActivity?.is_favorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={currentActivity?.is_favorite ? COLORS.error : colors.text}
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
        <Text style={[styles.chapterTitle, { color: colors.text }]}>
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
          onSelectionChange={(e) => {
            if (Platform.OS !== 'web') {
              // Handle text selection on mobile
            }
          }}
        >
          {chapters[currentChapter]?.content}
        </Text>
      </ScrollView>
      
      {/* Controls */}
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
          
          <View style={styles.navControls}>
            <TouchableOpacity
              onPress={() => goToChapter(currentChapter - 1)}
              disabled={currentChapter === 0}
              style={[styles.navBtn, currentChapter === 0 && styles.navBtnDisabled]}
            >
              <Ionicons name="chevron-back" size={24} color={currentChapter === 0 ? colors.textSecondary : COLORS.primary} />
              <Text style={{ color: currentChapter === 0 ? colors.textSecondary : COLORS.primary }}>Previous</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => goToChapter(currentChapter + 1)}
              disabled={currentChapter === chapters.length - 1}
              style={[styles.navBtn, currentChapter === chapters.length - 1 && styles.navBtnDisabled]}
            >
              <Text style={{ color: currentChapter === chapters.length - 1 ? colors.textSecondary : COLORS.primary }}>Next</Text>
              <Ionicons name="chevron-forward" size={24} color={currentChapter === chapters.length - 1 ? colors.textSecondary : COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Interstitial Ad Placeholder */}
      {showInterstitial && (
        <View style={styles.interstitialOverlay}>
          <View style={styles.interstitialContent}>
            <Text style={styles.interstitialText}>Advertisement</Text>
            <Text style={styles.interstitialSubtext}>Ad would display here</Text>
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
  navControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 4,
  },
  navBtnDisabled: {
    opacity: 0.5,
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
});
