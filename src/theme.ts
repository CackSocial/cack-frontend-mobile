import {useThemeStore} from './stores/themeStore';

const light = {
  bgPrimary: '#fafafa',
  bgSecondary: '#f0f0f0',
  bgTertiary: '#e5e5e5',
  bgElevated: '#ffffff',

  textPrimary: '#0a0a0a',
  textSecondary: '#525252',
  textTertiary: '#737373',
  textMuted: '#a3a3a3',
  textInverse: '#fafafa',

  border: '#e5e5e5',
  borderStrong: '#d4d4d4',

  accent: '#0a0a0a',
  accentText: '#fafafa',

  danger: '#dc2626',
  dangerBg: '#fef2f2',
  like: '#ef4444',
  success: '#16a34a',
};

const dark: typeof light = {
  bgPrimary: '#0a0a0a',
  bgSecondary: '#141414',
  bgTertiary: '#1f1f1f',
  bgElevated: '#171717',

  textPrimary: '#fafafa',
  textSecondary: '#a3a3a3',
  textTertiary: '#737373',
  textMuted: '#525252',
  textInverse: '#0a0a0a',

  border: '#262626',
  borderStrong: '#404040',

  accent: '#fafafa',
  accentText: '#0a0a0a',

  danger: '#ef4444',
  dangerBg: '#1a0a0a',
  like: '#ef4444',
  success: '#22c55e',
};

export const colors = {light, dark};

export type ThemeColors = typeof light;

export function useColors(): ThemeColors {
  const theme = useThemeStore(s => s.theme);
  return colors[theme];
}
