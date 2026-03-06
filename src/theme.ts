import {Platform} from 'react-native';
import type {ViewStyle} from 'react-native';
import {useThemeStore} from './stores/themeStore';

const light = {
  bgPrimary: '#fafafa',
  bgSecondary: '#f0f0f0',
  bgTertiary: '#e5e5e5',
  bgElevated: '#ffffff',
  bgHover: 'rgba(0, 0, 0, 0.04)',
  bgActive: 'rgba(0, 0, 0, 0.08)',
  bgOverlay: 'rgba(0, 0, 0, 0.5)',

  textPrimary: '#0a0a0a',
  textSecondary: '#525252',
  textTertiary: '#737373',
  textMuted: '#a3a3a3',
  textInverse: '#fafafa',

  border: '#e5e5e5',
  borderStrong: '#d4d4d4',
  borderSubtle: '#f0f0f0',

  accent: '#0a0a0a',
  accentHover: '#262626',
  accentText: '#fafafa',

  danger: '#dc2626',
  dangerHover: '#b91c1c',
  dangerBg: '#fef2f2',
  like: '#ef4444',
  success: '#16a34a',
};

const dark: typeof light = {
  bgPrimary: '#0a0a0a',
  bgSecondary: '#141414',
  bgTertiary: '#1f1f1f',
  bgElevated: '#171717',
  bgHover: 'rgba(255, 255, 255, 0.06)',
  bgActive: 'rgba(255, 255, 255, 0.1)',
  bgOverlay: 'rgba(0, 0, 0, 0.7)',

  textPrimary: '#fafafa',
  textSecondary: '#a3a3a3',
  textTertiary: '#737373',
  textMuted: '#525252',
  textInverse: '#0a0a0a',

  border: '#262626',
  borderStrong: '#404040',
  borderSubtle: '#1a1a1a',

  accent: '#fafafa',
  accentHover: '#d4d4d4',
  accentText: '#0a0a0a',

  danger: '#ef4444',
  dangerHover: '#dc2626',
  dangerBg: '#2a1111',
  like: '#ef4444',
  success: '#22c55e',
};

export const colors = {light, dark};

export type ThemeColors = typeof light;

export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radii = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  pill: 9999,
} as const;

export const typography = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  hero: 30,
} as const;

export const layout = {
  screenPadding: spacing[4],
  screenGap: spacing[4],
  contentMaxWidth: 680,
  narrowMaxWidth: 460,
  tabBarHeight: 64,
  headerHeight: 56,
} as const;

export const sizes = {
  avatar: {
    sm: 28,
    md: 36,
    lg: 40,
    xl: 44,
    profile: 84,
    hero: 104,
  },
  icon: {
    sm: 18,
    md: 20,
    lg: 22,
  },
  iconButton: {
    sm: 32,
    md: 34,
    lg: 38,
    xl: 42,
  },
  notification: {
    badge: 18,
    typeIcon: 22,
  },
  composer: {
    compactMinInputHeight: 92,
    defaultMinInputHeight: 132,
    compactHeightOffset: 138,
    defaultHeightOffset: 170,
    previewHeight: 220,
    scrollbarOverlayWidth: 18,
    scrollbarTrackWidth: 4,
    scrollbarTrackInset: 7,
    minScrollbarThumbHeight: 24,
  },
  conversation: {
    imagePreview: 60,
    inputMaxHeight: 100,
    keyboardOffset: 88,
  },
  quotePreview: {
    imageHeight: 160,
  },
  editProfile: {
    bioMinHeight: 120,
  },
  postCard: {
    imageHeight: 220,
    quotedImageHeight: 120,
  },
  reply: {
    button: 42,
    inputMinHeight: 48,
    inputMaxHeight: 110,
  },
} as const;

export const opacity = {
  active: 0.84,
  actionPressed: 0.75,
  contentPressed: 0.88,
} as const;

export const timing = {
  scrollToEndDelayMs: 100,
} as const;

export const elevation = {
  card:
    Platform.select<ViewStyle>({
      ios: {
        shadowColor: '#0a0a0a',
        shadowOffset: {width: 0, height: 10},
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: {
        elevation: 2,
      },
      default: {},
    }) ?? {},
  floating:
    Platform.select<ViewStyle>({
      ios: {
        shadowColor: '#0a0a0a',
        shadowOffset: {width: 0, height: 16},
        shadowOpacity: 0.16,
        shadowRadius: 28,
      },
      android: {
        elevation: 6,
      },
      default: {},
    }) ?? {},
};

export function useColors(): ThemeColors {
  const theme = useThemeStore(s => s.theme);
  return colors[theme];
}

export const fonts = {
  display: Platform.select({android: 'Syne-Bold', ios: 'Syne-Bold'}) || 'System',
  displayBold:
    Platform.select({android: 'Syne-ExtraBold', ios: 'Syne-ExtraBold'}) ||
    'System',
  body: Platform.select({android: 'Outfit-Regular', ios: 'Outfit-Regular'}) || 'System',
  bodyMedium:
    Platform.select({android: 'Outfit-Medium', ios: 'Outfit-Medium'}) ||
    'System',
  bodySemiBold:
    Platform.select({android: 'Outfit-SemiBold', ios: 'Outfit-SemiBold'}) ||
    'System',
  bodyBold: Platform.select({android: 'Outfit-Bold', ios: 'Outfit-Bold'}) || 'System',
};
