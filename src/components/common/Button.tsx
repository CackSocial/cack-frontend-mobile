import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import type {ViewStyle, TextStyle} from 'react-native';
import {useThemeStore} from '../../stores/themeStore';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  accessibilityLabel,
}: Props) {
  const theme = useThemeStore(s => s.theme);
  const isDark = theme === 'dark';

  const bgColors = {
    primary: '#3b82f6',
    secondary: isDark ? '#374151' : '#e5e7eb',
    danger: '#ef4444',
    ghost: 'transparent',
  };

  const textColors = {
    primary: '#ffffff',
    secondary: isDark ? '#d1d5db' : '#374151',
    danger: '#ffffff',
    ghost: '#3b82f6',
  };

  const heights = {sm: 32, md: 42, lg: 50};
  const fontSizes = {sm: 13, md: 15, lg: 17};

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{disabled: disabled || loading}}
      style={[
        styles.btn,
        {
          backgroundColor: bgColors[variant],
          height: heights[size],
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={textColors[variant]} />
      ) : (
        <Text
          style={[
            styles.text,
            {color: textColors[variant], fontSize: fontSizes[size]},
            textStyle,
          ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: '600',
  },
});
