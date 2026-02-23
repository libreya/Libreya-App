import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Button } from './Button';
import { COLORS, THEMES } from '../constants/theme';
import { useAppStore } from '../lib/store';

interface TermsModalProps {
  visible: boolean;
  onAccept: () => void;
}

export function TermsModal({ visible, onAccept }: TermsModalProps) {
  const themeKey = useAppStore((s) => s.theme);
  const colors = THEMES[themeKey];
  const settings = useAppStore((s) => s.settings);
  const { height } = useWindowDimensions();

  // Simple HTML to text converter
  const htmlToText = (html: string) => {
    if (!html) return '';
    return html
      .replace(/<h2>/g, '\n\n## ')
      .replace(/<\/h2>/g, '\n')
      .replace(/<h3>/g, '\n### ')
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
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.background, maxHeight: height * 0.85 }]}>
          <Text style={[styles.title, { color: colors.text }]}>Terms and Conditions</Text>
          
          <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
            <Text style={[styles.text, { color: colors.text }]}>
              {htmlToText(settings?.terms_and_conditions || '')}
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              By tapping "Accept", you agree to our Terms and Conditions.
            </Text>
            <Button title="Accept & Continue" onPress={onAccept} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  content: {
    marginBottom: 16,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
});
