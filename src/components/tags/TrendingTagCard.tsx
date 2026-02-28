import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import type {Tag} from '../../types';
import {formatCount} from '../../utils/format';
import {useThemeStore} from '../../stores/themeStore';

interface Props {
  tag: Tag;
  onPress?: () => void;
}

export default function TrendingTagCard({tag, onPress}: Props) {
  const theme = useThemeStore(s => s.theme);
  const isDark = theme === 'dark';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {backgroundColor: isDark ? '#1f2937' : '#f9fafb'},
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Tag ${tag.name}, ${tag.post_count} posts`}>
      <Text style={[styles.name, {color: isDark ? '#f3f4f6' : '#111827'}]}>
        #{tag.name}
      </Text>
      <Text style={[styles.count, {color: isDark ? '#6b7280' : '#9ca3af'}]}>
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
    fontWeight: '700',
  },
  count: {
    fontSize: 13,
    marginTop: 4,
  },
});
