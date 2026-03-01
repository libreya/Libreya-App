import { Platform } from 'react-native';

export const COLORS = {
  primary: '#5A1F2B',
  secondary: '#F5EFE6',
  accent: '#C6A75E',
  text: '#2B2B2B',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#888888',
  lightGray: '#E5E5E5',
  error: '#D32F2F',
  success: '#4CAF50',
};

export const THEMES = {
  light: {
    background: '#FFFFFF',
    surface: '#F5EFE6',
    text: '#2B2B2B',
    textSecondary: '#666666',
    border: '#E5E5E5',
  },
  sepia: {
    background: '#F4ECD8',
    surface: '#EDE4D0',
    text: '#5C4B37',
    textSecondary: '#7D6B57',
    border: '#D4C8B4',
  },
  dark: {
    background: '#1A1A1A',
    surface: '#2D2D2D',
    text: '#E5E5E5',
    textSecondary: '#AAAAAA',
    border: '#404040',
  },
  night: {
    background: '#0D0D0D',
    surface: '#1A1A1A',
    text: '#CCCCCC',
    textSecondary: '#888888',
    border: '#333333',
  },
};

export const FONTS = {
  heading: 'LibreBaskerville-Bold',
  body: 'LibreBaskerville-Regular',
  bodyItalic: 'LibreBaskerville-Italic',
  reading: 'LibreBaskerville-Regular',
  // Fallbacks for before fonts load
  headingFallback: Platform.select({ ios: 'Georgia-Bold', android: 'serif', web: 'Georgia, serif' }) || 'serif',
  bodyFallback: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }) || 'serif',
};

export const LOGO_URL = 'https://customer-assets.emergentagent.com/job_b554f1a4-c35c-4e60-a285-bdc61c896871/artifacts/0ouwazt9_Libreya%20Logo.png';
