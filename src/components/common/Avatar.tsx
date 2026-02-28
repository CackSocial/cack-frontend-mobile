import React from 'react';
import {View, Image, Text, StyleSheet} from 'react-native';
import {UPLOADS_URL} from '../../config';
import {useColors} from '../../theme';

interface Props {
  uri?: string;
  name?: string;
  size?: number;
}

export default function Avatar({uri, name, size = 40}: Props) {
  const c = useColors();
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
          backgroundColor: c.accent,
        },
      ]}
      accessibilityLabel={`${name || 'User'}'s avatar`}>
      <Text
        style={[
          styles.initial,
          {fontSize: size * 0.4, color: c.accentText},
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
