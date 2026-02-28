import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useColors} from '../../theme';

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export default function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 4,
  style,
}: Props) {
  const c = useColors();
  const bg = c.bgTertiary;

  return (
    <View
      style={[
        styles.skeleton,
        {width: width as any, height, borderRadius, backgroundColor: bg},
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    opacity: 0.6,
  },
});
