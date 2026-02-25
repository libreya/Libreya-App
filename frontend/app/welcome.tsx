import React, { useState, useEffect, useRef } from 'react';
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
  TextInput,
  LayoutChangeEvent,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as AppleAuthentication from 'expo-apple-authentication';
import { COLORS, THEMES } from '../constants/theme';
import { useAppStore } from '../lib/store';
import { supabase, getRedirectUrl } from '../lib/supabase';
import { api } from '../lib/api';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomePageHeader from '@/components/WelcomePageHeader';
import WelcomPageContent from '@/components/WelcomPageContent';

const { width, height } = Dimensions.get('window');
export type SectionKey = "meetTheFounder" | "philosophy";

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppStore((s) => s.theme);
  const colors = THEMES[theme];
  const setUser = useAppStore((s) => s.setUser);
  const user = useAppStore((s) => s.user);

  const [mode, setMode] = useState<'welcome' | 'signin' | 'signup' | 'forgot'>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Error message state
  const [errorMessage, setErrorMessage] = useState('');

  // Forgot password states
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const scrollRef = useRef<ScrollView | null>(null);

  const [sectionPositions, setSectionPositions] = useState<
    Record<SectionKey, number>
  >({
    meetTheFounder: 0,
    philosophy: 0
  });

  const scrollToSection = (key: SectionKey) => {
    const y = sectionPositions[key];
    scrollRef.current?.scrollTo({ y, animated: true });
  };

  const registerSection = (key: SectionKey, y: number) => {
    setSectionPositions((prev) => ({ ...prev, [key]: y }));
  };

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

  // Clear error when mode changes
  useEffect(() => {
    setErrorMessage('');
    setResetEmailSent(false);
  }, [mode]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

      try {
        await api.post('/users', guestUser);
      } catch (e) {
        // Continue even if server save fails
      }

      await AsyncStorage.setItem('user', JSON.stringify(guestUser));
      setUser(guestUser);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to continue as guest. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter email and password');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const previousGuestId = user?.auth_provider === 'guest' ? user.id : null;

      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: email.split('@')[0] },
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            setErrorMessage('An account with this email already exists. Please sign in instead.');
          } else {
            setErrorMessage(error.message);
          }
          return;
        }

        if (data.user) {
          const newUser = {
            id: data.user.id,
            email: data.user.email,
            display_name: email.split('@')[0],
            auth_provider: 'email' as const,
            is_admin: email === 'hello@libreya.app',
            terms_accepted: false,
          };

          // Try to create user, ignore duplicate errors
          try {
            await api.post('/users', newUser);
          } catch (e: any) {
            // Ignore duplicate user errors - user already exists
            if (!e.message?.includes('409') && !e.message?.includes('exists')) {
              console.error('Error creating user profile:', e);
            }
          }

          if (previousGuestId) {
            await migrateGuestData(previousGuestId, data.user.id);
          }

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

        if (error) {
          // Parse specific error messages
          if (error.message.includes('Invalid login credentials')) {
            setErrorMessage('Incorrect password. Please try again.');
          } else if (error.message.includes('Email not confirmed')) {
            setErrorMessage('Please verify your email address before signing in.');
          } else if (error.message.includes('User not found') || error.message.includes('no user found')) {
            setErrorMessage('No account found with this email.');
          } else {
            setErrorMessage(error.message);
          }
          return;
        }

        if (data.user) {
          let userData;
          try {
            userData = await api.get(`/users/${data.user.id}`);
          } catch {
            // User doesn't exist in our DB - create profile
            userData = {
              id: data.user.id,
              email: data.user.email,
              display_name: data.user.email?.split('@')[0],
              auth_provider: 'email' as const,
              is_admin: email === 'hello@libreya.app',
              terms_accepted: false,
            };
            // Try to create user, ignore duplicate errors
            try {
              await api.post('/users', userData);
            } catch (e: any) {
              // Ignore duplicate user errors
              if (!e.message?.includes('409') && !e.message?.includes('exists')) {
                console.error('Error creating user profile:', e);
              }
            }
          }

          if (previousGuestId) {
            await migrateGuestData(previousGuestId, data.user.id);
          }

          await AsyncStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot password handler
  const handleForgotPassword = async () => {
    setErrorMessage('');

    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = Platform.OS === 'web'
        ? `${window.location.origin}/reset-password`
        : 'libreya://reset-password';

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        if (error.message.includes('User not found') || error.message.includes('no user')) {
          setErrorMessage('No account found with this email.');
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      setResetEmailSent(true);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const redirectUrl = getRedirectUrl();

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
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

  const handleAppleSignIn = async () => {
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
        const redirectUrl = getRedirectUrl();

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'apple',
          options: {
            redirectTo: redirectUrl,
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
          <ScrollView ref={scrollRef}>
            <WelcomePageHeader onNavigate={scrollToSection} />
            <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
              <Text style={styles.title}>Libreya</Text>
              <Text style={styles.subtitle}>Curated classics. Timeless reading.</Text>
              <Text style={styles.description}>
                Discover timeless classics from the world's greatest authors.<br></br>
                Free, forever.
              </Text>
              <View style={styles.browseButtonContainer}>
                <TouchableOpacity
                  style={styles.guestButton}
                  onPress={handleContinueAsGuest}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.browseButtonText}>Click here to browse our free ebooks</Text>
                  )}
                </TouchableOpacity>
              </View>

            </View>

            <WelcomPageContent registerSection={registerSection} />
            <View style={styles.buttonContainer}>
              <Button
                title="Sign Up with Email to save your favorites"
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

              {Platform.OS === 'ios' && appleAuthAvailable ? (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                  cornerRadius={12}
                  style={styles.appleAuthButton}
                  onPress={handleAppleSignIn}
                />
              ) : (
                <TouchableOpacity
                  style={styles.appleButton}
                  onPress={handleAppleSignIn}
                  disabled={appleLoading}
                >
                  {appleLoading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <>
                      <Ionicons name="logo-apple" size={20} color={COLORS.white} />
                      <Text style={styles.appleButtonText}>Continue with Apple</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

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
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  // Render forgot password screen
  if (mode === 'forgot') {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Reset Password',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerLeft: () => (
              <TouchableOpacity onPress={() => setMode('signin')} style={{ padding: 8 }}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            ),
          }}
        />

        <ScrollView
          contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 20 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.forgotIconContainer}>
            <Ionicons name="lock-closed-outline" size={60} color={COLORS.primary} />
          </View>

          <Text style={[styles.formTitle, { color: colors.text }]}>
            Forgot Password?
          </Text>
          <Text style={[styles.formSubtitle, { color: colors.textSecondary }]}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          {resetEmailSent ? (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
              <Text style={[styles.successTitle, { color: colors.text }]}>Email Sent!</Text>
              <Text style={[styles.successText, { color: colors.textSecondary }]}>
                Check your inbox for a password reset link. If you don't see it, check your spam folder.
              </Text>
              <Button
                title="Back to Sign In"
                onPress={() => {
                  setMode('signin');
                  setResetEmailSent(false);
                }}
                style={{ marginTop: 20 }}
              />
            </View>
          ) : (
            <View style={styles.form}>
              {errorMessage ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              <Button
                title="Send Reset Link"
                onPress={handleForgotPassword}
                loading={loading}
              />

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => setMode('signin')}
              >
                <Text style={[styles.linkText, { color: colors.textSecondary }]}>
                  Remember your password?{' '}
                  <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

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

        {/* Error Message Display */}
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={COLORS.error} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => { setEmail(text); setErrorMessage(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          {/* Password field with show/hide toggle */}
          <View style={styles.passwordContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Password</Text>
            <View style={[styles.passwordInputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                placeholder="Enter your password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={(text) => { setPassword(text); setErrorMessage(''); }}
                secureTextEntry={!showPassword}
                autoComplete={mode === 'signup' ? 'password-new' : 'password'}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password for signup */}
          {mode === 'signup' && (
            <View style={styles.passwordContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Confirm Password</Text>
              <View style={[styles.passwordInputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  placeholder="Confirm your password"
                  placeholderTextColor={colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={(text) => { setConfirmPassword(text); setErrorMessage(''); }}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="password-new"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Forgot Password Link - only show on signin */}
          {mode === 'signin' && (
            <TouchableOpacity
              style={styles.forgotPasswordLink}
              onPress={() => setMode('forgot')}
            >
              <Text style={[styles.forgotPasswordText, { color: COLORS.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
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
    justifyContent: 'flex-start',
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
    fontSize: 100,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 48,
    fontStyle: 'italic',
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  description: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginTop: 50,
    marginBottom: 50
  },
  browseButtonContainer: {
    width: '50%',
    gap: 12,
    marginTop: 100,
    marginBottom: 100
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
  appleAuthButton: {
    width: '100%',
    height: 50,
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
  browseButtonText: {
    fontSize: 20,
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
  // Password visibility toggle styles
  passwordContainer: {
    marginBottom: 16,
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeButton: {
    padding: 8,
  },
  // Error message styles
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    width: '100%',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    flex: 1,
  },
  // Forgot password styles
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  forgotIconContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  // Success message styles
  successContainer: {
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
  },
});
