import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import type {ViewStyle, TextStyle} from 'react-native';
import {useColors, fonts} from '../../theme';

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
  const c = useColors();

  const bgColors = {
    primary: c.accent,
    secondary: 'transparent',
    danger: c.danger,
    ghost: 'transparent',
  };

  const textColors = {
    primary: c.accentText,
    secondary: c.textPrimary,
    danger: '#ffffff',
    ghost: c.textSecondary,
  };

  const borderColors = {
    primary: c.accent,
    secondary: c.borderStrong,
    danger: c.danger,
    ghost: 'transparent',
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
          borderWidth: 1.5,
          borderColor: borderColors[variant],
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
    fontFamily: fonts.bodySemiBold,
  },
});
