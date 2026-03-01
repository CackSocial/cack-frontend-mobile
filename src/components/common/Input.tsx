import React from 'react';
import {View, TextInput, Text, StyleSheet} from 'react-native';
import type {TextInputProps} from 'react-native';
import {useColors, fonts} from '../../theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({label, error, style, ...rest}: Props) {
  const c = useColors();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, {color: c.textSecondary}]}>
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor={c.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: c.bgSecondary,
            color: c.textPrimary,
            borderColor: error ? c.danger : c.border,
          },
          style,
        ]}
        {...rest}
      />
      {error && <Text style={[styles.error, {color: c.danger}]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.body,
  },
  error: {
    fontSize: 12,
    fontFamily: fonts.body,
    marginTop: 4,
  },
});
