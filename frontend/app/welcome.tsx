import React, { useState } from 'react';
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
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, THEMES } from '../constants/theme';
import { useAppStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppStore((s) => s.theme);
  const colors = THEMES[theme];
  const setUser = useAppStore((s) => s.setUser);

  const [mode, setMode] = useState<'welcome' | 'signin' | 'signup'>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleContinueAsGuest = async () => {
    setLoading(true);
    try {
      const guestUuid = Crypto.randomUUID();
      const guestUser = {
        id: guestUuid,
        auth_provider: 'guest' as const,
        is_admin: false,
        terms_accepted: false,
      };

      // Try to save to server
      try {
        await api.post('/users', guestUser);
      } catch (e) {
        console.log('Could not save guest to server');
      }

      await AsyncStorage.setItem('user', JSON.stringify(guestUser));
      setUser(guestUser);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to continue as guest');
    } finally {
      setLoading(false);
    }
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
          const newUser = {
            id: data.user.id,
            email: data.user.email,
            display_name: email.split('@')[0],
            auth_provider: 'email' as const,
            is_admin: email === 'hello@libreya.app',
            terms_accepted: false,
          };

          await api.post('/users', newUser);
          await AsyncStorage.setItem('user', JSON.stringify(newUser));
          setUser(newUser);
          Alert.alert('Success', 'Account created successfully!');
          router.replace('/(tabs)');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          let userData;
          try {
            userData = await api.get(`/users/${data.user.id}`);
          } catch {
            userData = {
              id: data.user.id,
              email: data.user.email,
              display_name: data.user.email?.split('@')[0],
              auth_provider: 'email' as const,
              is_admin: email === 'hello@libreya.app',
              terms_accepted: false,
            };
            await api.post('/users', userData);
          }

          await AsyncStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
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

      // For web, Supabase handles the redirect
      if (Platform.OS === 'web' && data?.url) {
        window.location.href = data.url;
      } else {
        // For native, show info about configuration needed
        Alert.alert(
          'Google Sign-In',
          'Google authentication will redirect you to sign in. For native apps, ensure OAuth is configured in your Supabase dashboard.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = () => {
    Alert.alert(
      'Coming Soon',
      'Apple Sign-In will be available once Apple Developer credentials are configured. Please use Email or Google authentication for now.'
    );
  };

  // Welcome Screen
  if (mode === 'welcome') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800' }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        
        <LinearGradient
          colors={['transparent', 'rgba(90,31,43,0.8)', COLORS.primary]}
          style={styles.gradient}
        >
          <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
            <Image
              source={{ uri: 'https://customer-assets.emergentagent.com/job_bc7b9e4f-7678-4b25-b887-2287e22fd313/artifacts/vl9x3m91_Logo1.jpg' }}
              style={styles.logo}
              resizeMode="contain"
            />
            
            <Text style={styles.title}>Libreya</Text>
            <Text style={styles.subtitle}>Your Gateway to Classic Literature</Text>
            <Text style={styles.description}>
              Discover over 300 timeless classics from the world's greatest authors.
              Free, forever.
            </Text>

            <View style={styles.buttonContainer}>
              <Button
                title="Sign Up with Email"
                onPress={() => setMode('signup')}
                style={styles.primaryButton}
              />

              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignIn}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <ActivityIndicator color="#DB4437" />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={20} color="#DB4437" />
                    <Text style={styles.googleButtonText}>Continue with Google</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.appleButton}
                onPress={handleAppleSignIn}
              >
                <Ionicons name="logo-apple" size={20} color={COLORS.white} />
                <Text style={styles.appleButtonText}>Continue with Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.guestButton}
                onPress={handleContinueAsGuest}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.guestButtonText}>Continue as Guest</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setMode('signin')}>
                <Text style={styles.signinLink}>
                  Already have an account? <Text style={styles.signinLinkBold}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Sign In / Sign Up Form
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
          headerLeft: () => (
            <TouchableOpacity onPress={() => setMode('welcome')} style={{ padding: 8 }}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={{ uri: 'https://customer-assets.emergentagent.com/job_bc7b9e4f-7678-4b25-b887-2287e22fd313/artifacts/vl9x3m91_Logo1.jpg' }}
          style={styles.formLogo}
          resizeMode="contain"
        />

        <Text style={[styles.formTitle, { color: colors.text }]}>
          {mode === 'signin' ? 'Welcome Back' : 'Join Libreya'}
        </Text>
        <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
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
            style={{ marginTop: 8 }}
          />
        </View>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: colors.surface }]}
            onPress={handleGoogleSignIn}
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
            onPress={handleAppleSignIn}
          >
            <Ionicons name="logo-apple" size={24} color={colors.text} />
            <Text style={[styles.socialText, { color: colors.text }]}>Apple</Text>
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

        <TouchableOpacity onPress={handleContinueAsGuest} style={styles.guestLink}>
          <Text style={[styles.guestLinkText, { color: colors.textSecondary }]}>
            or <Text style={{ textDecorationLine: 'underline' }}>continue as guest</Text>
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
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  guestButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  signinLink: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 8,
  },
  signinLinkBold: {
    fontWeight: '600',
    color: COLORS.white,
  },
  formContent: {
    padding: 24,
    alignItems: 'center',
  },
  formLogo: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  formSubtitle: {
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
  guestLink: {
    marginTop: 16,
  },
  guestLinkText: {
    fontSize: 14,
  },
});
