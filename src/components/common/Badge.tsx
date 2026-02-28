import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useColors, fonts} from '../../theme';

interface Props {
  count: number;
  size?: number;
}

export default function Badge({count, size = 18}: Props) {
  const c = useColors();
  if (count <= 0) return null;

  const label = count > 99 ? '99+' : String(count);

  return (
    <View
      style={[
        styles.badge,
        {minWidth: size, height: size, borderRadius: size / 2, backgroundColor: c.accent},
      ]}
      accessibilityLabel={`${count} unread`}>
      <Text style={[styles.text, {fontSize: size * 0.6, color: c.accentText}]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  text: {
    fontFamily: fonts.bodyBold,
  },
});
