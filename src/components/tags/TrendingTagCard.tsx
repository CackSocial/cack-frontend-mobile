import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import type {Tag} from '../../types';
import {formatCount} from '../../utils/format';
import {useColors, fonts} from '../../theme';

interface Props {
  tag: Tag;
  onPress?: () => void;
}

export default function TrendingTagCard({tag, onPress}: Props) {
  const c = useColors();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {backgroundColor: c.bgElevated},
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Tag ${tag.name}, ${tag.post_count} posts`}>
      <Text style={[styles.name, {color: c.textPrimary}]}>
        #{tag.name}
      </Text>
      <Text style={[styles.count, {color: c.textTertiary}]}>
        {formatCount(tag.post_count)} posts
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    margin: 4,
    minWidth: 140,
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontFamily: fonts.bodySemiBold,
  },
  count: {
    fontSize: 13,
    marginTop: 4,
  },
});
