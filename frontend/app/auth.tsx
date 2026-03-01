import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, THEMES } from '../constants/theme';
import { useAppStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppStore((s) => s.theme);
  const colors = THEMES[theme];
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

  useEffect(() => {
    const checkAppleAuth = async () => {
      if (Platform.OS === 'ios') {
        const isAvailable = await AppleAuthentication.isAvailableAsync();
        setAppleAuthAvailable(isAvailable);
      } else if (Platform.OS === 'web') {
        setAppleAuthAvailable(true);
      }
    };
    checkAppleAuth();
  }, []);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: email.split('@')[0],
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          // Create user in our database
          const newUser = {
            id: data.user.id,
            email: data.user.email,
            display_name: email.split('@')[0],
            auth_provider: 'email',
            is_admin: email === 'hello@libreya.app',
            terms_accepted: false,
          };

          await api.post('/users', newUser);

          // Migrate guest data if exists
          if (user && user.auth_provider === 'guest') {
            try {
              await api.post('/users/migrate-guest', {
                guest_uuid: user.id,
                new_user_id: data.user.id,
              });
            } catch (e) {
              console.log('No guest data to migrate');
            }
          }

          setUser(newUser as any);
          Alert.alert('Success', 'Account created successfully!');
          router.back();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Get user from our database
          try {
            const userData = await api.get(`/users/${data.user.id}`);
            setUser(userData);
          } catch {
            // User not in our DB, create them
            const newUser = {
              id: data.user.id,
              email: data.user.email,
              display_name: data.user.email?.split('@')[0],
              auth_provider: 'email',
              is_admin: email === 'hello@libreya.app',
              terms_accepted: false,
            };
            await api.post('/users', newUser);
            setUser(newUser as any);
          }

          router.back();
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const migrateGuestData = async (guestId: string, newUserId: string) => {
    try {
      await api.post('/users/migrate-guest', {
        guest_uuid: guestId,
        new_user_id: newUserId,
      });
    } catch (e) {
      // Silent fail - guest data migration is best effort
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: Platform.OS === 'web'
            ? window.location.origin
            : 'libreya://auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;

      if (Platform.OS === 'web' && data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    setAppleLoading(true);
    const previousGuestId = user?.auth_provider === 'guest' ? user.id : null;

    try {
      if (Platform.OS === 'ios') {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });

        if (credential.identityToken) {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'apple',
            token: credential.identityToken,
          });

          if (error) throw error;

          if (data.user) {
            const displayName = credential.fullName
              ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
              : data.user.email?.split('@')[0] || 'User';

            const newUser = {
              id: data.user.id,
              email: data.user.email,
              display_name: displayName,
              auth_provider: 'apple' as const,
              is_admin: data.user.email === 'hello@libreya.app',
              terms_accepted: false,
            };

            try {
              await api.post('/users', newUser);
            } catch {
              try {
                await api.patch(`/users/${data.user.id}`, {
                  display_name: displayName,
                  auth_provider: 'apple'
                });
              } catch { }
            }

            if (previousGuestId) {
              await migrateGuestData(previousGuestId, data.user.id);
            }

            await AsyncStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);
            router.replace('/(tabs)');
          }
        }
      } else if (Platform.OS === 'web') {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: {
            redirectTo: window.location.origin,
          },
        });

        if (error) throw error;

        if (data?.url) {
          window.location.href = data.url;
        }
      } else {
        Alert.alert('Not Available', 'Apple Sign-In is only available on iOS and web.');
      }
    } catch (error: any) {
      if (error.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Error', error.message || 'Apple sign-in failed');
      }
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          title: mode === 'signin' ? 'Sign In' : 'Create Account',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          presentation: 'modal',
        }}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={{ uri: 'https://customer-assets.emergentagent.com/job_b554f1a4-c35c-4e60-a285-bdc61c896871/artifacts/0ouwazt9_Libreya%20Logo.png' }}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={[styles.title, { color: colors.text }]}>
          {mode === 'signin' ? 'Welcome Back' : 'Join Libreya'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {mode === 'signin'
            ? 'Sign in to sync your reading progress'
            : 'Create an account to save your progress'}
        </Text>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={mode === 'signup' ? 'password-new' : 'password'}
          />

          {mode === 'signup' && (
            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="password-new"
            />
          )}

          <Button
            title={mode === 'signin' ? 'Sign In' : 'Create Account'}
            onPress={handleEmailAuth}
            loading={loading}
          />
        </View>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or continue with</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: colors.surface }]}
            onPress={handleGoogleAuth}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#DB4437" />
            ) : (
              <>
                <Ionicons name="logo-google" size={24} color="#DB4437" />
                <Text style={[styles.socialText, { color: colors.text }]}>Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: colors.surface }]}
            onPress={handleAppleAuth}
            disabled={appleLoading}
          >
            {appleLoading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <>
                <Ionicons name="logo-apple" size={24} color={colors.text} />
                <Text style={[styles.socialText, { color: colors.text }]}>Apple</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          style={styles.switchMode}
        >
          <Text style={[styles.switchText, { color: colors.textSecondary }]}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <Text style={{ color: COLORS.primary, fontWeight: '600' }}>
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  socialText: {
    fontSize: 16,
    fontWeight: '500',
  },
  switchMode: {
    marginTop: 24,
  },
  switchText: {
    fontSize: 14,
  },
});
