import React from 'react';
import {View, StyleSheet} from 'react-native';
import type {ReactNode} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {useColors, radii, spacing, elevation} from '../../theme';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  elevated?: boolean;
}

export default function Surface({
  children,
  style,
  padding = spacing[4],
  elevated = false,
}: Props) {
  const c = useColors();

  return (
    <View
      style={[
        styles.base,
        elevated ? elevation.card : null,
        {
          backgroundColor: c.bgElevated,
          borderColor: c.border,
          padding,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: radii.xxl,
  },
});
