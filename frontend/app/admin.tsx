import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  Modal,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, THEMES } from '../constants/theme';
import { useAppStore, Book } from '../lib/store';
import { api } from '../lib/api';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';

// App Settings keys for global text editing
const APP_SETTINGS_KEYS = [
  { key: 'welcome_title', label: 'Welcome Screen Title', default: 'Welcome to Libreya' },
  { key: 'welcome_subtitle', label: 'Welcome Screen Subtitle', default: 'Your Gateway to Classic Literature' },
  { key: 'terms_conditions', label: 'Terms & Conditions', default: '' },
  { key: 'privacy_notice', label: 'Privacy Notice', default: '' },
  { key: 'legal_notice', label: 'Legal Notice', default: '' },
  { key: 'about_text', label: 'About App Text', default: '' },
  { key: 'featured_section_title', label: 'Featured Section Title', default: 'Featured Books' },
  { key: 'recommended_section_title', label: 'Recommended Section Title', default: 'Recommended For You' },
  { key: 'signup_cta', label: 'Sign Up CTA Text', default: 'Sign up to sync your reading progress' },
];

export default function AdminScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppStore((s) => s.theme);
  const colors = THEMES[theme];
  const user = useAppStore((s) => s.user);
  const settings = useAppStore((s) => s.settings);
  const fetchSettings = useAppStore((s) => s.fetchSettings);

  const [activeTab, setActiveTab] = useState<'books' | 'settings' | 'app_settings'>('books');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showBookModal, setShowBookModal] = useState(false);

  // Settings state
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [settingsContent, setSettingsContent] = useState('');
  
  // App Settings state
  const [appSettings, setAppSettings] = useState<Record<string, string>>({});
  const [editingAppSetting, setEditingAppSetting] = useState<string | null>(null);
  const [appSettingValue, setAppSettingValue] = useState('');
  
  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);

  // Book form state
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    category: '',
    description: '',
    content_body: '',
    cover_image: '',
    is_featured: false,
  });
  
  // Content editor state
  const [showContentEditor, setShowContentEditor] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (user && !user.is_admin) {
      Alert.alert('Access Denied', 'You do not have admin privileges');
      router.back();
    }
  }, [user]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const data = await api.get('/books?limit=200');
      setBooks(data);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadBooks();
      fetchSettings();
      loadAppSettings();
    }, [])
  );

  const handleToggleFeatured = async (book: Book) => {
    try {
      await api.patch(`/admin/books/${book.id}`, { is_featured: !book.is_featured });
      loadBooks();
    } catch (error) {
      Alert.alert('Error', 'Failed to update book');
    }
  };

  const handleDeleteBook = (book: Book) => {
    Alert.alert('Delete Book', `Are you sure you want to delete "${book.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/admin/books/${book.id}`);
            loadBooks();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete book');
          }
        },
      },
    ]);
  };

  const handleEditBook = async (book: Book) => {
    setEditingBook(book);
    // Fetch full book data including content_body
    try {
      const fullBook = await api.get(`/books/${book.id}`);
      setBookForm({
        title: fullBook.title,
        author: fullBook.author,
        category: fullBook.category || '',
        description: fullBook.description || '',
        content_body: fullBook.content_body || '',
        cover_image: fullBook.cover_image || '',
        is_featured: fullBook.is_featured,
      });
    } catch (e) {
      // Fallback to partial data
      setBookForm({
        title: book.title,
        author: book.author,
        category: book.category || '',
        description: book.description || '',
        content_body: '',
        cover_image: book.cover_image || '',
        is_featured: book.is_featured,
      });
    }
    setShowContentEditor(false);
    setShowBookModal(true);
  };

  // Image picker and upload function
  const handlePickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant access to your photo library');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [2, 3], // Book cover aspect ratio
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingImage(true);
        const asset = result.assets[0];
        
        // Generate unique filename
        const fileName = `cover_${Date.now()}.jpg`;
        const filePath = `book-covers/${fileName}`;
        
        // For web, use the URI directly or upload to backend
        if (Platform.OS === 'web' && asset.base64) {
          // Convert base64 to blob and upload
          const base64Data = asset.base64;
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/jpeg' });

          // Upload to Supabase Storage
          const { data, error } = await supabase.storage
            .from('book-covers')
            .upload(filePath, blob, {
              contentType: 'image/jpeg',
              upsert: true,
            });

          if (error) {
            // If bucket doesn't exist, use a fallback URL approach
            console.log('Storage upload error:', error);
            // Use base64 data URL as fallback
            setBookForm({ ...bookForm, cover_image: `data:image/jpeg;base64,${base64Data}` });
            Alert.alert('Note', 'Image saved locally. For persistent storage, configure Supabase Storage bucket.');
          } else {
            // Get public URL
            const { data: urlData } = supabase.storage
              .from('book-covers')
              .getPublicUrl(filePath);
            
            setBookForm({ ...bookForm, cover_image: urlData.publicUrl });
            Alert.alert('Success', 'Cover image uploaded successfully!');
          }
        } else {
          // For native, use the URI
          setBookForm({ ...bookForm, cover_image: asset.uri });
        }
        
        setUploadingImage(false);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      setUploadingImage(false);
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  // Load app settings
  const loadAppSettings = async () => {
    try {
      const data = await api.get('/settings');
      const settingsMap: Record<string, string> = {};
      if (Array.isArray(data)) {
        data.forEach((item: { key: string; value: string }) => {
          settingsMap[item.key] = item.value;
        });
      }
      setAppSettings(settingsMap);
    } catch (error) {
      console.error('Error loading app settings:', error);
    }
  };

  // Save app setting
  const handleSaveAppSetting = async (key: string, value: string) => {
    try {
      await api.post('/admin/settings', { key, value });
      setAppSettings({ ...appSettings, [key]: value });
      setEditingAppSetting(null);
      Alert.alert('Success', 'Setting saved successfully');
      fetchSettings(); // Refresh global settings
    } catch (error) {
      Alert.alert('Error', 'Failed to save setting');
    }
  };

  const handleSaveBook = async () => {
    if (!bookForm.title || !bookForm.author) {
      Alert.alert('Error', 'Title and author are required');
      return;
    }

    try {
      // Include content_body in the save payload
      const savePayload = {
        title: bookForm.title,
        author: bookForm.author,
        category: bookForm.category,
        description: bookForm.description,
        is_featured: bookForm.is_featured,
        ...(bookForm.content_body ? { content_body: bookForm.content_body } : {}),
        ...(bookForm.cover_image ? { cover_image: bookForm.cover_image } : {}),
      };
      
      if (editingBook) {
        await api.patch(`/admin/books/${editingBook.id}`, savePayload);
      } else {
        await api.post('/admin/books', savePayload);
      }
      setShowBookModal(false);
      setShowContentEditor(false);
      setEditingBook(null);
      setBookForm({ title: '', author: '', category: '', description: '', content_body: '', cover_image: '', is_featured: false });
      loadBooks();
      Alert.alert('Success', 'Book saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save book');
    }
  };

  const handleEditSetting = (key: string) => {
    setEditingKey(key);
    switch (key) {
      case 'terms':
        setSettingsContent(settings?.terms_and_conditions || '');
        break;
      case 'privacy':
        setSettingsContent(settings?.privacy_notice || '');
        break;
      case 'legal':
        setSettingsContent(settings?.legal_notice || '');
        break;
    }
  };

  const handleSaveSetting = async () => {
    if (!editingKey) return;
    try {
      const keyMap: Record<string, string> = {
        terms: 'terms_and_conditions',
        privacy: 'privacy_notice',
        legal: 'legal_notice',
      };
      await api.post('/admin/settings', {
        key: keyMap[editingKey],
        value: settingsContent,
      });
      fetchSettings();
      setEditingKey(null);
      Alert.alert('Success', 'Settings saved');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  if (!user?.is_admin) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Access Denied</Text>
      </View>
    );
  }

  const renderBookItem = ({ item }: { item: Book }) => (
    <View style={[styles.bookItem, { backgroundColor: colors.surface }]}>
      <View style={styles.bookInfo}>
        <Text style={[styles.bookTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.bookAuthor, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.author}
        </Text>
        <View style={styles.bookMeta}>
          {item.is_featured && (
            <View style={[styles.badge, { backgroundColor: COLORS.accent }]}>
              <Text style={styles.badgeText}>Featured</Text>
            </View>
          )}
          {item.category && (
            <Text style={[styles.category, { color: colors.textSecondary }]}>{item.category}</Text>
          )}
        </View>
      </View>
      <View style={styles.bookActions}>
        <TouchableOpacity onPress={() => handleToggleFeatured(item)}>
          <Ionicons
            name={item.is_featured ? 'star' : 'star-outline'}
            size={24}
            color={item.is_featured ? COLORS.accent : colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleEditBook(item)}>
          <Ionicons name="pencil-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteBook(item)}>
          <Ionicons name="trash-outline" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Admin Dashboard',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'books' && styles.activeTab]}
          onPress={() => setActiveTab('books')}
        >
          <Ionicons
            name="book-outline"
            size={20}
            color={activeTab === 'books' ? COLORS.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'books' ? COLORS.primary : colors.textSecondary },
            ]}
          >
            Books
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Ionicons
            name="settings-outline"
            size={20}
            color={activeTab === 'settings' ? COLORS.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'settings' ? COLORS.primary : colors.textSecondary },
            ]}
          >
            Legal Settings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'app_settings' && styles.activeTab]}
          onPress={() => setActiveTab('app_settings')}
        >
          <Ionicons
            name="globe-outline"
            size={20}
            color={activeTab === 'app_settings' ? COLORS.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'app_settings' ? COLORS.primary : colors.textSecondary },
            ]}
          >
            App Settings
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'books' ? (
        <>
          <View style={styles.header}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Books ({books.length})
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: COLORS.primary }]}
              onPress={() => {
                setEditingBook(null);
                setBookForm({ title: '', author: '', category: '', description: '', content_body: '', cover_image: '', is_featured: false });
                setShowBookModal(true);
              }}
            >
              <Ionicons name="add" size={20} color={COLORS.white} />
              <Text style={styles.addButtonText}>Add Book</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={books}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderBookItem}
            contentContainerStyle={styles.list}
            refreshing={loading}
            onRefresh={loadBooks}
          />
        </>
      ) : activeTab === 'app_settings' ? (
        <ScrollView contentContainerStyle={styles.settingsContent}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Global App Settings</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Customize app text, labels, and messages
          </Text>

          {APP_SETTINGS_KEYS.map((setting) => (
            <View key={setting.key} style={[styles.settingItem, { backgroundColor: colors.surface }]}>
              <View style={styles.settingHeader}>
                <Text style={[styles.settingLabel, { color: colors.text }]}>{setting.label}</Text>
                <TouchableOpacity
                  style={[styles.editSettingButton, { backgroundColor: COLORS.primary }]}
                  onPress={() => {
                    setEditingAppSetting(setting.key);
                    setAppSettingValue(appSettings[setting.key] || setting.default);
                  }}
                >
                  <Ionicons name="pencil" size={14} color={COLORS.white} />
                  <Text style={styles.editSettingButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.settingPreview, { color: colors.textSecondary }]} numberOfLines={2}>
                {appSettings[setting.key] || setting.default || '(Not set)'}
              </Text>
            </View>
          ))}

          {/* App Setting Edit Modal */}
          <Modal
            visible={editingAppSetting !== null}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setEditingAppSetting(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    Edit: {APP_SETTINGS_KEYS.find(s => s.key === editingAppSetting)?.label || ''}
                  </Text>
                  <TouchableOpacity onPress={() => setEditingAppSetting(null)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalBody}>
                  <TextInput
                    style={[
                      styles.textarea,
                      { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                    ]}
                    value={appSettingValue}
                    onChangeText={setAppSettingValue}
                    multiline
                    textAlignVertical="top"
                    placeholder="Enter value..."
                    placeholderTextColor={colors.textSecondary}
                  />
                </ScrollView>
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: colors.border }]}
                    onPress={() => setEditingAppSetting(null)}
                  >
                    <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: COLORS.primary }]}
                    onPress={() => editingAppSetting && handleSaveAppSetting(editingAppSetting, appSettingValue)}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.settingsContent}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Legal Documents</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Edit the legal texts displayed to users
          </Text>

          {editingKey ? (
            <View style={styles.editingContainer}>
              <Text style={[styles.editingTitle, { color: colors.text }]}>
                Editing: {editingKey === 'terms' ? 'Terms & Conditions' : editingKey === 'privacy' ? 'Privacy Notice' : 'Legal Notice'}
              </Text>
              <TextInput
                style={[
                  styles.textarea,
                  { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                ]}
                multiline
                value={settingsContent}
                onChangeText={setSettingsContent}
                placeholder="Enter HTML content..."
                placeholderTextColor={colors.textSecondary}
              />
              <View style={styles.editButtons}>
                <Button title="Cancel" variant="outline" onPress={() => setEditingKey(null)} />
                <Button title="Save" onPress={handleSaveSetting} />
              </View>
            </View>
          ) : (
            <View style={styles.settingsCards}>
              <TouchableOpacity
                style={[styles.settingCard, { backgroundColor: colors.surface }]}
                onPress={() => handleEditSetting('terms')}
              >
                <Ionicons name="document-text-outline" size={32} color={COLORS.primary} />
                <Text style={[styles.settingCardTitle, { color: colors.text }]}>Terms & Conditions</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingCard, { backgroundColor: colors.surface }]}
                onPress={() => handleEditSetting('privacy')}
              >
                <Ionicons name="shield-checkmark-outline" size={32} color={COLORS.primary} />
                <Text style={[styles.settingCardTitle, { color: colors.text }]}>Privacy Notice</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.settingCard, { backgroundColor: colors.surface }]}
                onPress={() => handleEditSetting('legal')}
              >
                <Ionicons name="information-circle-outline" size={32} color={COLORS.primary} />
                <Text style={[styles.settingCardTitle, { color: colors.text }]}>Legal Notice</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Book Edit Modal */}
      <Modal visible={showBookModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingBook ? 'Edit Book' : 'Add Book'}
              </Text>
              <TouchableOpacity onPress={() => setShowBookModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Title *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={bookForm.title}
                onChangeText={(text) => setBookForm({ ...bookForm, title: text })}
                placeholder="Book title"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Author *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={bookForm.author}
                onChangeText={(text) => setBookForm({ ...bookForm, author: text })}
                placeholder="Author name"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Category</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
                value={bookForm.category}
                onChangeText={(text) => setBookForm({ ...bookForm, category: text })}
                placeholder="Category"
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.descInput,
                  { backgroundColor: colors.surface, color: colors.text },
                ]}
                value={bookForm.description}
                onChangeText={(text) => setBookForm({ ...bookForm, description: text })}
                placeholder="Book description"
                placeholderTextColor={colors.textSecondary}
                multiline
              />

              <TouchableOpacity
                style={styles.featuredToggle}
                onPress={() => setBookForm({ ...bookForm, is_featured: !bookForm.is_featured })}
              >
                <Ionicons
                  name={bookForm.is_featured ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={COLORS.primary}
                />
                <Text style={[styles.featuredText, { color: colors.text }]}>Featured Book</Text>
              </TouchableOpacity>

              {/* Cover Image Section */}
              <View style={styles.coverImageSection}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Cover Image</Text>
                <View style={styles.coverImageRow}>
                  {bookForm.cover_image ? (
                    <Image source={{ uri: bookForm.cover_image }} style={styles.coverPreview} />
                  ) : (
                    <View style={[styles.coverPlaceholder, { backgroundColor: colors.surface }]}>
                      <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>No cover</Text>
                    </View>
                  )}
                  <View style={styles.coverButtons}>
                    <TouchableOpacity
                      style={[styles.uploadButton, { backgroundColor: COLORS.primary }]}
                      onPress={handlePickImage}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                      ) : (
                        <>
                          <Ionicons name="cloud-upload-outline" size={18} color={COLORS.white} />
                          <Text style={styles.uploadButtonText}>Upload Image</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.urlInput, { backgroundColor: colors.surface, color: colors.text }]}
                      value={bookForm.cover_image}
                      onChangeText={(text) => setBookForm({ ...bookForm, cover_image: text })}
                      placeholder="Or paste image URL"
                      placeholderTextColor={colors.textSecondary}
                    />
                    {bookForm.cover_image && (
                      <TouchableOpacity
                        style={styles.clearCoverButton}
                        onPress={() => setBookForm({ ...bookForm, cover_image: '' })}
                      >
                        <Ionicons name="trash-outline" size={18} color={COLORS.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              {/* Content Editor Section */}
              {editingBook && (
                <View style={styles.contentEditorSection}>
                  <TouchableOpacity
                    style={[styles.contentEditorToggle, { backgroundColor: COLORS.primary }]}
                    onPress={() => setShowContentEditor(!showContentEditor)}
                  >
                    <Ionicons name={showContentEditor ? 'chevron-up' : 'create-outline'} size={20} color={COLORS.white} />
                    <Text style={styles.contentEditorToggleText}>
                      {showContentEditor ? 'Hide Content Editor' : 'Edit Book Content (HTML)'}
                    </Text>
                  </TouchableOpacity>
                  
                  {showContentEditor && (
                    <View style={styles.contentEditorWrapper}>
                      <Text style={[styles.contentEditorHint, { color: colors.textSecondary }]}>
                        Edit the book's HTML content below. Use &lt;h2&gt; for chapter titles and &lt;p&gt; for paragraphs.
                      </Text>
                      <TextInput
                        style={[
                          styles.contentTextarea,
                          { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
                        ]}
                        value={bookForm.content_body}
                        onChangeText={(text) => setBookForm({ ...bookForm, content_body: text })}
                        placeholder="<h2>Chapter 1</h2><p>Once upon a time...</p>"
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        textAlignVertical="top"
                      />
                      <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                        {bookForm.content_body.length.toLocaleString()} characters
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button title="Cancel" variant="outline" onPress={() => setShowBookModal(false)} />
              <Button title="Save" onPress={handleSaveBook} />
            </View>
          </View>
        </View>
      </Modal>
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
  tabs: {
    flexDirection: 'row',
    padding: 8,
    margin: 16,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(90,31,43,0.1)',
  },
  tabText: {
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  list: {
    padding: 16,
  },
  bookItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  bookAuthor: {
    fontSize: 14,
    marginTop: 2,
  },
  bookMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '600',
  },
  category: {
    fontSize: 12,
  },
  bookActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsContent: {
    padding: 16,
  },
  settingsCards: {
    gap: 12,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  settingCardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  editingContainer: {
    flex: 1,
  },
  editingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 300,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalContent: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  descInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  featuredToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  featuredText: {
    fontSize: 16,
  },
  contentEditorSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 16,
  },
  contentEditorToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  contentEditorToggleText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  contentEditorWrapper: {
    marginTop: 16,
  },
  contentEditorHint: {
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  contentTextarea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 400,
    fontSize: 14,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  // Cover image styles
  coverImageSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  coverImageRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  coverPreview: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  coverPlaceholder: {
    width: 80,
    height: 120,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverButtons: {
    flex: 1,
    gap: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  uploadButtonText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  urlInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
  },
  clearCoverButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  // App settings styles
  settingItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  settingPreview: {
    fontSize: 14,
    lineHeight: 20,
  },
  editSettingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  editSettingButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontWeight: '500',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: COLORS.white,
    fontWeight: '500',
  },
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
});
