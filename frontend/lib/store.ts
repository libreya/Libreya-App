import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import * as Crypto from 'expo-crypto';
import { supabase } from './supabase';
import { Platform } from 'react-native';

export interface User {
  id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  auth_provider: 'guest' | 'email' | 'google' | 'apple';
  is_admin: boolean;
  terms_accepted: boolean;
  terms_accepted_at?: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  content_body?: string;
  category?: string;
  cover_image?: string;
  is_featured: boolean;
  read_count: number;
  description?: string;
}

export interface UserActivity {
  id?: number;
  user_id: string;
  book_id: number;
  last_position: number;
  is_favorite: boolean;
  highlights: Array<{ text: string; position: number; chapter?: number }>;
  chapter_read_count: number;
}

export interface AppSettings {
  terms_and_conditions: string;
  privacy_notice: string;
  legal_notice: string;
}

type Theme = 'light' | 'sepia' | 'dark' | 'night';

interface AppState {
  user: User | null;
  isLoading: boolean;
  theme: Theme;
  books: Book[];
  featuredBooks: Book[];
  recommendedBooks: Book[];
  currentBook: Book | null;
  currentActivity: UserActivity | null;
  favorites: Book[];
  settings: AppSettings | null;
  chaptersReadSinceAd: number;
  isOffline: boolean;
  error: string | null;

  initializeApp: () => Promise<void>;
  setUser: (user: User | null) => void;
  setTheme: (theme: Theme) => void;
  setError: (error: string | null) => void;
  setOffline: (offline: boolean) => void;
  fetchBooks: (params?: { category?: string; search?: string }) => Promise<void>;
  fetchFeaturedBooks: () => Promise<void>;
  fetchRecommendedBooks: () => Promise<void>;
  fetchBook: (bookId: number) => Promise<Book | null>;
  fetchFavorites: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateActivity: (activity: Partial<UserActivity>) => Promise<void>;
  toggleFavorite: (bookId: number) => Promise<void>;
  addHighlight: (text: string, position: number, chapter?: number) => Promise<void>;
  acceptTerms: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  signOut: () => Promise<void>;
  incrementChapterRead: () => void;
  resetChapterCount: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isLoading: true,
  theme: 'light',
  books: [],
  featuredBooks: [],
  recommendedBooks: [],
  currentBook: null,
  currentActivity: null,
  favorites: [],
  settings: null,
  chaptersReadSinceAd: 0,
  isOffline: false,
  error: null,

  initializeApp: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        set({ theme: savedTheme as Theme });
      }

      // Check for existing Supabase session (handles OAuth redirect and password reset)
      if (Platform.OS === 'web') {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // User logged in via OAuth or has active session
          const supaUser = session.user;
          const provider = supaUser.app_metadata?.provider || 'email';
          
          let userData: User = {
            id: supaUser.id,
            email: supaUser.email,
            display_name: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || 'User',
            avatar_url: supaUser.user_metadata?.avatar_url,
            auth_provider: provider as User['auth_provider'],
            is_admin: supaUser.email === 'hello@libreya.app',
            terms_accepted: false,
          };

          // Try to get existing user data from backend first
          try {
            const existingUser = await api.get(`/users/${supaUser.id}`);
            // User exists - merge data (preserve existing terms_accepted, etc.)
            userData = { ...userData, ...existingUser };
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            set({ user: userData });
          } catch (getUserError) {
            // User doesn't exist in backend - check if it's a 404
            // Only create new user if truly doesn't exist
            try {
              const newUser = await api.post('/users', userData);
              userData = { ...userData, ...newUser };
              await AsyncStorage.setItem('user', JSON.stringify(userData));
              set({ user: userData });
            } catch (createError: any) {
              // If 409 conflict, user exists with different ID (same email)
              // This can happen during password reset - just use local data
              if (createError.message?.includes('409') || createError.message?.includes('exists')) {
                await AsyncStorage.setItem('user', JSON.stringify(userData));
                set({ user: userData });
              } else {
                console.error('Error creating user:', createError);
              }
            }
          }

          // Check for guest data to migrate (only if we haven't done this before)
          const savedUser = await AsyncStorage.getItem('user');
          if (savedUser) {
            const previousUser = JSON.parse(savedUser);
            if (previousUser.auth_provider === 'guest' && previousUser.id !== supaUser.id) {
              try {
                await api.post('/users/migrate-guest', {
                  guest_uuid: previousUser.id,
                  new_user_id: supaUser.id,
                });
              } catch {}
            }
          }

          await get().fetchSettings();
          set({ isLoading: false });
          return;
        }
      }

      // Fall back to local storage user
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        set({ user });
      }

      await get().fetchSettings();
    } catch (error) {
      set({ error: 'Failed to initialize app' });
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (user) => {
    set({ user });
    if (user) {
      AsyncStorage.setItem('user', JSON.stringify(user));
    } else {
      AsyncStorage.removeItem('user');
    }
  },

  setTheme: async (theme) => {
    set({ theme });
    await AsyncStorage.setItem('theme', theme);
  },

  setError: (error) => set({ error }),
  setOffline: (offline) => set({ isOffline: offline }),

  fetchBooks: async (params) => {
    try {
      set({ isOffline: false });
      let endpoint = '/books?limit=500';  // Increased to load all 300+ books
      if (params?.category) endpoint += `&category=${params.category}`;
      if (params?.search) endpoint += `&search=${params.search}`;
      const books = await api.get(endpoint);
      set({ books, error: null });
    } catch (error) {
      set({ isOffline: true, error: 'Unable to load books. Please check your connection.' });
    }
  },

  fetchFeaturedBooks: async () => {
    try {
      const featuredBooks = await api.get('/books/featured?limit=10');
      set({ featuredBooks });
    } catch (error) {
      // Silent fail for featured books
    }
  },

  fetchRecommendedBooks: async () => {
    const { user } = get();
    if (!user) return;
    try {
      const recommendedBooks = await api.get(`/books/recommended/${user.id}?limit=10`);
      set({ recommendedBooks });
    } catch (error) {
      // Silent fail for recommendations
    }
  },

  fetchBook: async (bookId) => {
    try {
      set({ isOffline: false, error: null });
      const book = await api.get(`/books/${bookId}`);
      set({ currentBook: book });

      const { user } = get();
      if (user) {
        try {
          const activity = await api.get(`/activity/${user.id}/${bookId}`);
          set({ currentActivity: activity });
        } catch {
          set({ currentActivity: null });
        }
      }

      return book;
    } catch (error) {
      set({ isOffline: true, error: 'Unable to load book. Please check your connection.' });
      return null;
    }
  },

  fetchFavorites: async () => {
    const { user } = get();
    if (!user) return;
    try {
      const favorites = await api.get(`/favorites/${user.id}`);
      set({ favorites });
    } catch (error) {
      // Silent fail
    }
  },

  fetchSettings: async () => {
    const defaultSettings: AppSettings = {
      terms_and_conditions: `<h2>Terms and Conditions</h2><p><strong>Last Updated: February 2026</strong></p><h3>1. License</h3><p>Libreya grants you a personal, non-exclusive license to use this software for reading public-domain literature.</p><h3>2. Content</h3><p>Books are sourced from Project Gutenberg and Standard Ebooks. While the texts are public domain, the Libreya app design, code, and brand are the intellectual property of Libreya.</p><h3>3. Prohibited Use</h3><p>You may not scrape, reverse-engineer, or attempt to bypass the authentication systems of Libreya.</p><h3>4. Ad-Supported Service</h3><p>You acknowledge that Libreya is supported by advertisements. Tampering with ad delivery is a violation of these terms.</p><h3>5. Limitation of Liability</h3><p>Libreya is provided "as-is." We are not liable for any data loss or inaccuracies in the literary texts provided.</p>`,
      privacy_notice: `<h2>Privacy Notice for Libreya</h2><p><strong>Last Updated: February 2026</strong></p><h3>1. Identity and Contact Details</h3><p>Libreya is the "Data Controller" for your information.</p><p>Company Name: libreya.app</p><p>Contact/DPO Email: hello@libreya.app</p><h3>2. Information We Collect</h3><p>We collect information only to provide and improve your reading experience.</p><h3>3. Your Rights</h3><p>You can delete your account and all associated data immediately via the "Delete Account" button in Settings.</p>`,
      legal_notice: `<h2>Legal Notice</h2><h3>Royalty-Free Content Notice</h3><p>Works sourced via Standard Ebooks and Project Gutenberg. No copyright claimed on original texts.</p><h3>Contact</h3><p>For any legal inquiries, please contact: hello@libreya.app</p>`,
    };

    try {
      const settingsArray = await api.get('/settings');
      const settings: AppSettings = { ...defaultSettings };
      if (Array.isArray(settingsArray)) {
        settingsArray.forEach((s: { key: string; value: string }) => {
          if (s.key in settings) {
            (settings as any)[s.key] = s.value;
          }
        });
      }
      set({ settings });
    } catch (error) {
      set({ settings: defaultSettings });
    }
  },

  updateActivity: async (activityUpdate) => {
    const { user, currentBook, currentActivity } = get();
    if (!user || !currentBook) return;

    const activity: UserActivity = {
      user_id: user.id,
      book_id: currentBook.id,
      last_position: activityUpdate.last_position ?? currentActivity?.last_position ?? 0,
      is_favorite: activityUpdate.is_favorite ?? currentActivity?.is_favorite ?? false,
      highlights: activityUpdate.highlights ?? currentActivity?.highlights ?? [],
      chapter_read_count: activityUpdate.chapter_read_count ?? currentActivity?.chapter_read_count ?? 0,
    };

    try {
      await api.post('/activity', activity);
      set({ currentActivity: activity });
    } catch (error) {
      // Save locally on failure
      set({ currentActivity: activity });
    }
  },

  toggleFavorite: async (bookId) => {
    const { user, currentActivity } = get();
    if (!user) return;

    const newFavorite = !currentActivity?.is_favorite;
    
    await get().updateActivity({ is_favorite: newFavorite });
    await get().fetchFavorites();
  },

  addHighlight: async (text, position, chapter) => {
    const { currentActivity } = get();
    const highlights = [...(currentActivity?.highlights || []), { text, position, chapter }];
    await get().updateActivity({ highlights });
  },

  acceptTerms: async () => {
    const { user } = get();
    if (!user) return;

    const updatedUser = { ...user, terms_accepted: true, terms_accepted_at: new Date().toISOString() };
    set({ user: updatedUser });
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

    api.post('/users/accept-terms', { user_id: user.id, accepted: true }).catch(() => {});
  },

  deleteAccount: async () => {
    const { user } = get();
    if (!user) return;

    try {
      // Sign out from Supabase Auth first
      if (user.auth_provider !== 'guest') {
        await supabase.auth.signOut();
      }
      
      // Delete user data from backend (this also deletes from auth.users)
      const response = await api.delete(`/users/${user.id}`);
      console.log('Delete account response:', response);
      
      // Sign out from Supabase Auth (in case backend couldn't)
      if (user.auth_provider !== 'guest') {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          // Ignore sign out errors - user is already deleted
        }
      }
      
      // Clear ALL local storage related to auth
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('supabase.auth.token');
      
      // Clear any other cached data
      if (Platform.OS === 'web') {
        try {
          localStorage.removeItem('supabase.auth.token');
          // Clear all supabase related items
          Object.keys(localStorage).forEach(key => {
            if (key.includes('supabase') || key.includes('sb-')) {
              localStorage.removeItem(key);
            }
          });
        } catch (e) {}
      }
      
      // Reset all state
      set({ 
        user: null, 
        favorites: [], 
        currentActivity: null, 
        currentBook: null,
        books: [],
        featuredBooks: [],
        recommendedBooks: [],
      });
    } catch (error) {
      // Still try to sign out and clear local state
      try {
        await supabase.auth.signOut();
      } catch (e) {}
      await AsyncStorage.removeItem('user');
      set({ user: null, favorites: [], currentActivity: null });
      throw error;
    }
  },

  signOut: async () => {
    const { user } = get();
    if (!user) return;

    try {
      // Sign out from Supabase Auth
      if (user.auth_provider !== 'guest') {
        await supabase.auth.signOut();
      }
      
      // Clear local storage
      await AsyncStorage.removeItem('user');
      
      // Reset state but keep some app settings
      set({ 
        user: null, 
        favorites: [], 
        currentActivity: null, 
        currentBook: null,
        books: [],
        featuredBooks: [],
        recommendedBooks: [],
      });
    } catch (error) {
      // Still clear local state even if Supabase fails
      await AsyncStorage.removeItem('user');
      set({ user: null, favorites: [], currentActivity: null });
      throw error;
    }
  },

  incrementChapterRead: () => {
    set((state) => ({ chaptersReadSinceAd: state.chaptersReadSinceAd + 1 }));
  },

  resetChapterCount: () => {
    set({ chaptersReadSinceAd: 0 });
  },
}));
