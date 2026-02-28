import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, THEMES } from '../constants/theme';
import { useAppStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { Button } from '../components/Button';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useAppStore((s) => s.theme);
  const colors = THEMES[theme];

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  // Check if user has access token from email link
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // No session - user may have accessed this page directly
        // The supabase client should handle the token from URL automatically
      }
    };
    checkSession();
  }, []);

  const handleResetPassword = async () => {
    setErrorMessage('');

    if (!password) {
      setErrorMessage('Please enter a new password');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        if (error.message.includes('expired') || error.message.includes('invalid')) {
          setErrorMessage('Reset link has expired. Please request a new one.');
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      setSuccess(true);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen
          options={{
            headerShown: true,
            title: 'Password Reset',
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
          }}
        />
        <View style={[styles.successContainer, { paddingTop: insets.top + 40 }]}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          <Text style={[styles.successTitle, { color: colors.text }]}>
            Password Updated!
          </Text>
          <Text style={[styles.successText, { color: colors.textSecondary }]}>
            Your password has been successfully reset. You can now sign in with your new password.
          </Text>
          <Button
            title="Go to Sign In"
            onPress={() => router.replace('/')}
            style={{ marginTop: 32, width: '100%' }}
          />
        </View>
      </View>
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
          title: 'Reset Password',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconContainer}>
          <Ionicons name="key-outline" size={60} color={COLORS.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          Create New Password
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your new password must be at least 6 characters long.
        </Text>

        {/* Error Message Display */}
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={COLORS.error} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          {/* New Password */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>New Password</Text>
            <View style={[styles.passwordInputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                placeholder="Enter new password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={(text) => { setPassword(text); setErrorMessage(''); }}
                secureTextEntry={!showPassword}
                autoComplete="password-new"
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

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Confirm New Password</Text>
            <View style={[styles.passwordInputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                placeholder="Confirm new password"
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

          <Button
            title="Reset Password"
            onPress={handleResetPassword}
            loading={loading}
            style={{ marginTop: 8 }}
          />
        </View>

        <TouchableOpacity
          style={styles.backLink}
          onPress={() => router.replace('/')}
        >
          <Text style={[styles.backLinkText, { color: colors.textSecondary }]}>
            Back to <Text style={{ color: COLORS.primary, fontWeight: '600' }}>Sign In</Text>
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
  iconContainer: {
    marginBottom: 24,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
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
  successContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  backLink: {
    marginTop: 24,
  },
  backLinkText: {
    fontSize: 14,
  },
});
