import React from 'react';
import {View, Image, Text, StyleSheet} from 'react-native';
import {UPLOADS_URL} from '../../config';
import {useThemeStore} from '../../stores/themeStore';

interface Props {
  uri?: string;
  name?: string;
  size?: number;
}

export default function Avatar({uri, name, size = 40}: Props) {
  const theme = useThemeStore(s => s.theme);
  const resolvedUri =
    uri && uri.startsWith('http') ? uri : uri ? `${UPLOADS_URL}/${uri}` : null;

  if (resolvedUri) {
    return (
      <Image
        source={{uri: resolvedUri}}
        style={[styles.image, {width: size, height: size, borderRadius: size / 2}]}
        accessibilityLabel={`${name || 'User'}'s avatar`}
      />
    );
  }

  const initial = (name || '?')[0].toUpperCase();
  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        },
      ]}
      accessibilityLabel={`${name || 'User'}'s avatar`}>
      <Text
        style={[
          styles.initial,
          {fontSize: size * 0.4, color: theme === 'dark' ? '#d1d5db' : '#6b7280'},
        ]}>
        {initial}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontWeight: '700',
  },
});
