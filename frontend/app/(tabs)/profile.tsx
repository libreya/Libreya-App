import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, THEMES } from '../../constants/theme';
import { useAppStore } from '../../lib/store';
import { Button } from '../../components/Button';
import { ThemeToggle } from '../../components/ThemeToggle';
import { api } from '../../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Custom confirm dialog that works on web
const showConfirm = (title: string, message: string, onConfirm: () => void, confirmText = 'OK', destructive = false) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
    ]);
  }
};

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppStore((s) => s.theme);
  const colors = THEMES[theme];
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const deleteAccount = useAppStore((s) => s.deleteAccount);
  const signOut = useAppStore((s) => s.signOut);

  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);

  const isGuest = user?.auth_provider === 'guest';

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await api.patch(`/users/${user.id}`, { display_name: displayName, bio });
      setUser({ ...user, display_name: displayName, bio });
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    showConfirm(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      async () => {
        try {
          await deleteAccount();
          
          // Show clear success message before redirect
          const successMessage = '✓ Your account and all data have been successfully erased.\n\nYou will now be redirected to the Welcome screen.';
          
          if (Platform.OS === 'web') {
            window.alert(successMessage);
          } else {
            Alert.alert(
              'Account Deleted', 
              'Your account and all data have been successfully erased.',
              [{ text: 'OK', onPress: () => router.replace('/welcome') }]
            );
            return; // Don't redirect immediately on native - wait for alert dismiss
          }
          
          router.replace('/welcome');
        } catch (error: any) {
          const errorMessage = error?.message || 'Failed to delete account. Please try again.';
          if (Platform.OS === 'web') {
            window.alert(`Error: ${errorMessage}`);
          } else {
            Alert.alert('Error', errorMessage);
          }
        }
      },
      'Delete',
      true
    );
  };

  const handleSignOut = () => {
    showConfirm(
      'Sign Out',
      'Are you sure you want to sign out?',
      async () => {
        try {
          await signOut();
          router.replace('/welcome');
        } catch (error) {
          if (Platform.OS === 'web') {
            window.alert('Error: Failed to sign out. Please try again.');
          } else {
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        }
      },
      'Sign Out'
    );
  };

  const MenuItem = ({ icon, title, onPress, danger = false }: any) => (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: colors.surface }]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={24}
        color={danger ? COLORS.error : colors.text}
      />
      <Text style={[styles.menuText, { color: danger ? COLORS.error : colors.text }]}>
        {title}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 100 }}
    >
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: COLORS.primary }]}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {user?.display_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'G'}
            </Text>
          )}
        </View>
        
        {editing ? (
          <View style={styles.editForm}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
              placeholder="Display Name"
              placeholderTextColor={colors.textSecondary}
              value={displayName}
              onChangeText={setDisplayName}
            />
            <TextInput
              style={[styles.input, styles.bioInput, { backgroundColor: colors.surface, color: colors.text }]}
              placeholder="Bio"
              placeholderTextColor={colors.textSecondary}
              value={bio}
              onChangeText={setBio}
              multiline
            />
            <View style={styles.editButtons}>
              <Button title="Cancel" variant="outline" onPress={() => setEditing(false)} />
              <Button title="Save" onPress={handleSaveProfile} loading={saving} />
            </View>
          </View>
        ) : (
          <>
            <Text style={[styles.name, { color: colors.text }]}>
              {user?.display_name || (isGuest ? 'Guest User' : user?.email)}
            </Text>
            {user?.bio && <Text style={[styles.bio, { color: colors.textSecondary }]}>{user.bio}</Text>}
            {isGuest && (
              <View style={[styles.guestBadge, { backgroundColor: COLORS.accent }]}>
                <Text style={styles.guestText}>Guest Account</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={[styles.editLink, { color: COLORS.primary }]}>Edit Profile</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {isGuest && (
        <View style={[styles.signupPrompt, { backgroundColor: colors.surface }]}>
          <Text style={[styles.promptTitle, { color: colors.text }]}>Create an Account</Text>
          <Text style={[styles.promptText, { color: colors.textSecondary }]}>
            Sign up to sync your reading progress, favorites, and highlights across devices.
          </Text>
          <Button title="Sign Up" onPress={() => router.push('/auth')} />
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE</Text>
        <ThemeToggle />
      </View>

      {user?.is_admin && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ADMIN</Text>
          <MenuItem
            icon="settings-outline"
            title="Admin Dashboard"
            onPress={() => router.push('/admin')}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>LEGAL</Text>
        <MenuItem
          icon="document-text-outline"
          title="Terms and Conditions"
          onPress={() => router.push('/legal/terms')}
        />
        <MenuItem
          icon="shield-checkmark-outline"
          title="Privacy Notice"
          onPress={() => router.push('/legal/privacy')}
        />
        <MenuItem
          icon="information-circle-outline"
          title="Legal Notice"
          onPress={() => router.push('/legal/legal')}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACCOUNT</Text>
        {!isGuest && (
          <MenuItem
            icon="log-out-outline"
            title="Sign Out"
            onPress={handleSignOut}
          />
        )}
        <MenuItem
          icon="trash-outline"
          title="Delete Account"
          onPress={handleDeleteAccount}
          danger
        />
      </View>

      <Text style={[styles.version, { color: colors.textSecondary }]}>Libreya v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  guestBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  guestText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },
  editLink: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  editForm: {
    width: '100%',
    paddingHorizontal: 16,
  },
  input: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  signupPrompt: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  promptText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
    marginBottom: 16,
  },
});
