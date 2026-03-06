import React from 'react';
import {View, TextInput, Text, StyleSheet} from 'react-native';
import type {StyleProp, TextInputProps, TextStyle, ViewStyle} from 'react-native';
import {useColors, fonts, radii, spacing, typography} from '../../theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
}

export default function Input({
  label,
  error,
  containerStyle,
  style,
  multiline,
  ...rest
}: Props) {
  const c = useColors();

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[styles.label, {color: c.textSecondary}]}>{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={c.textMuted}
        style={[
          styles.input,
          multiline ? styles.multiline : null,
          {
            backgroundColor: c.bgSecondary,
            color: c.textPrimary,
            borderColor: error ? c.danger : c.border,
          },
          style,
        ]}
        multiline={multiline}
        {...rest}
      />
      {error ? (
        <Text style={[styles.error, {color: c.danger}]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[1],
  },
  label: {
    fontSize: typography.sm,
    fontFamily: fonts.bodyMedium,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: radii.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: typography.base,
    fontFamily: fonts.body,
    minHeight: 50,
  },
  multiline: {
    minHeight: 112,
    textAlignVertical: 'top',
  },
  error: {
    fontSize: typography.xs,
    fontFamily: fonts.body,
  },
});
