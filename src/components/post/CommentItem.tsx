import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type {Comment} from '../../types';
import Avatar from '../common/Avatar';
import {formatRelativeTime} from '../../utils/format';
import {useThemeStore} from '../../stores/themeStore';
import {useAuthStore} from '../../stores/authStore';

interface Props {
  comment: Comment;
  onAuthorPress?: () => void;
  onDelete?: () => void;
}

export default function CommentItem({comment, onAuthorPress, onDelete}: Props) {
  const theme = useThemeStore(s => s.theme);
  const currentUser = useAuthStore(s => s.user);
  const isDark = theme === 'dark';
  const isOwn = currentUser?.id === comment.author.id;

  return (
    <View
      style={[
        styles.container,
        {borderBottomColor: isDark ? '#374151' : '#f3f4f6'},
      ]}>
      <TouchableOpacity onPress={onAuthorPress}>
        <Avatar
          uri={comment.author.avatar_url}
          name={comment.author.display_name}
          size={32}
        />
      </TouchableOpacity>
      <View style={styles.body}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onAuthorPress}>
            <Text
              style={[
                styles.name,
                {color: isDark ? '#f3f4f6' : '#111827'},
              ]}>
              {comment.author.display_name}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.time, {color: isDark ? '#6b7280' : '#9ca3af'}]}>
            {formatRelativeTime(comment.created_at)}
          </Text>
          {isOwn && onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              accessibilityLabel="Delete comment"
              accessibilityRole="button">
              <Icon name="delete-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.content, {color: isDark ? '#d1d5db' : '#374151'}]}>
          {comment.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
  },
  body: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontWeight: '700',
    fontSize: 14,
  },
  time: {
    fontSize: 12,
    flex: 1,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
});
