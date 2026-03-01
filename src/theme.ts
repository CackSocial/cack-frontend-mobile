import {Platform} from 'react-native';
import {useThemeStore} from './stores/themeStore';

const light = {
  bgPrimary: '#ffffff',
  bgSecondary: '#f7f7f7',
  bgTertiary: '#eff3f4',
  bgElevated: '#ffffff',

  textPrimary: '#0f1419',
  textSecondary: '#536471',
  textTertiary: '#536471',
  textMuted: '#8b98a5',
  textInverse: '#ffffff',

  border: '#eff3f4',
  borderStrong: '#cfd9de',

  accent: '#1d9bf0',
  accentText: '#ffffff',

  danger: '#f4212e',
  dangerBg: '#fef2f2',
  like: '#f91880',
  success: '#00ba7c',
};

const dark: typeof light = {
  bgPrimary: '#000000',
  bgSecondary: '#16181c',
  bgTertiary: '#1d1f23',
  bgElevated: '#000000',

  textPrimary: '#e7e9ea',
  textSecondary: '#71767b',
  textTertiary: '#71767b',
  textMuted: '#536471',
  textInverse: '#0f1419',

  border: '#2f3336',
  borderStrong: '#3e4144',

  accent: '#1d9bf0',
  accentText: '#ffffff',

  danger: '#f4212e',
  dangerBg: '#1c0a0a',
  like: '#f91880',
  success: '#00ba7c',
};

export const colors = {light, dark};

export type ThemeColors = typeof light;

export function useColors(): ThemeColors {
  const theme = useThemeStore(s => s.theme);
  return colors[theme];
}

// Typography matching the web's Syne (display) + Outfit (body) system
export const fonts = {
  display: Platform.select({android: 'Syne-Bold', ios: 'Syne-Bold'}) || 'System',
  displayBold: Platform.select({android: 'Syne-ExtraBold', ios: 'Syne-ExtraBold'}) || 'System',
  body: Platform.select({android: 'Outfit-Regular', ios: 'Outfit-Regular'}) || 'System',
  bodyMedium: Platform.select({android: 'Outfit-Medium', ios: 'Outfit-Medium'}) || 'System',
  bodySemiBold: Platform.select({android: 'Outfit-SemiBold', ios: 'Outfit-SemiBold'}) || 'System',
  bodyBold: Platform.select({android: 'Outfit-Bold', ios: 'Outfit-Bold'}) || 'System',
};
