import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, THEMES } from '../../constants/theme';
import { useAppStore } from '../../lib/store';

export default function LegalScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const insets = useSafeAreaInsets();
  const theme = useAppStore((s) => s.theme);
  const colors = THEMES[theme];
  const settings = useAppStore((s) => s.settings);

  const getTitle = () => {
    switch (type) {
      case 'terms':
        return 'Terms and Conditions';
      case 'privacy':
        return 'Privacy Notice';
      case 'legal':
        return 'Legal Notice';
      default:
        return 'Legal';
    }
  };

  const getContent = () => {
    switch (type) {
      case 'terms':
        return settings?.terms_and_conditions || '';
      case 'privacy':
        return settings?.privacy_notice || '';
      case 'legal':
        return settings?.legal_notice || '';
      default:
        return '';
    }
  };

  // Simple HTML to text converter
  const htmlToText = (html: string) => {
    if (!html) return '';
    return html
      .replace(/<h2>/g, '\n\n')
      .replace(/<\/h2>/g, '\n')
      .replace(/<h3>/g, '\n\n')
      .replace(/<\/h3>/g, '\n')
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n\n')
      .replace(/<ul>/g, '')
      .replace(/<\/ul>/g, '')
      .replace(/<li>/g, '• ')
      .replace(/<\/li>/g, '\n')
      .replace(/<strong>/g, '')
      .replace(/<\/strong>/g, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: getTitle(),
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={true}
      >
        <Text style={[styles.text, { color: colors.text }]}>
          {htmlToText(getContent())}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
  },
});
