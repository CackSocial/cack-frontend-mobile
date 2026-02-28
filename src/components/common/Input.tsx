import React from 'react';
import {View, TextInput, Text, StyleSheet} from 'react-native';
import type {TextInputProps} from 'react-native';
import {useThemeStore} from '../../stores/themeStore';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({label, error, style, ...rest}: Props) {
  const theme = useThemeStore(s => s.theme);
  const isDark = theme === 'dark';

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, {color: isDark ? '#d1d5db' : '#374151'}]}>
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
        style={[
          styles.input,
          {
            backgroundColor: isDark ? '#1f2937' : '#f9fafb',
            color: isDark ? '#f3f4f6' : '#111827',
            borderColor: error
              ? '#ef4444'
              : isDark
              ? '#374151'
              : '#d1d5db',
          },
          style,
        ]}
        {...rest}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
});
