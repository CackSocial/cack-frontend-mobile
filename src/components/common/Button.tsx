import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {useColors, fonts, radii, spacing, typography} from '../../theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  accessibilityLabel?: string;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
}: Props) {
  const c = useColors();

  const backgroundColor = {
    primary: c.accent,
    secondary: 'transparent',
    danger: c.danger,
    ghost: 'transparent',
  }[variant];

  const borderColor = {
    primary: c.accent,
    secondary: c.borderStrong,
    danger: c.danger,
    ghost: 'transparent',
  }[variant];

  const textColor = {
    primary: c.accentText,
    secondary: c.textPrimary,
    danger: '#ffffff',
    ghost: c.textSecondary,
  }[variant];

  const sizeStyles = {
    sm: styles.sm,
    md: styles.md,
    lg: styles.lg,
  }[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{disabled: disabled || loading}}
      style={({pressed}) => [
        styles.base,
        sizeStyles,
        {
          backgroundColor,
          borderColor,
          opacity: disabled ? 0.5 : 1,
          transform: [{scale: pressed && !disabled && !loading ? 0.98 : 1}],
        },
        fullWidth ? styles.fullWidth : null,
        variant === 'ghost' && pressed ? {backgroundColor: c.bgHover} : null,
        variant === 'secondary' && pressed ? {backgroundColor: c.bgHover} : null,
        variant === 'primary' && pressed ? {backgroundColor: c.accentHover} : null,
        variant === 'danger' && pressed ? {backgroundColor: c.dangerHover} : null,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text style={[styles.text, styles[`${size}Text`], {color: textColor}, textStyle]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1.5,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing[2],
  },
  fullWidth: {
    width: '100%',
  },
  sm: {
    minHeight: 36,
    paddingHorizontal: spacing[3],
    borderRadius: radii.md,
  },
  md: {
    minHeight: 42,
    paddingHorizontal: spacing[5],
  },
  lg: {
    minHeight: 50,
    paddingHorizontal: spacing[6],
  },
  text: {
    fontFamily: fonts.bodyMedium,
    includeFontPadding: false,
  },
  smText: {
    fontSize: typography.sm,
  },
  mdText: {
    fontSize: typography.sm,
  },
  lgText: {
    fontSize: typography.base,
  },
});
