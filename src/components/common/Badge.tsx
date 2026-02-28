import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface Props {
  count: number;
  size?: number;
}

export default function Badge({count, size = 18}: Props) {
  if (count <= 0) return null;

  const label = count > 99 ? '99+' : String(count);

  return (
    <View
      style={[
        styles.badge,
        {minWidth: size, height: size, borderRadius: size / 2},
      ]}
      accessibilityLabel={`${count} unread`}>
      <Text style={[styles.text, {fontSize: size * 0.6}]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  text: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
