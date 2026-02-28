import React, {useCallback} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type {Post} from '../../types';
import Avatar from '../common/Avatar';
import RenderTaggedContent from '../../utils/renderTaggedContent';
import {formatRelativeTime, formatCount} from '../../utils/format';
import {UPLOADS_URL} from '../../config';
import {useThemeStore} from '../../stores/themeStore';
import {useAuthStore} from '../../stores/authStore';

interface Props {
  post: Post;
  onPress?: () => void;
  onAuthorPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onDelete?: () => void;
  onTagPress?: (tag: string) => void;
}

export default function PostCard({
  post,
  onPress,
  onAuthorPress,
  onLike,
  onComment,
  onDelete,
  onTagPress,
}: Props) {
  const theme = useThemeStore(s => s.theme);
  const currentUser = useAuthStore(s => s.user);
  const isDark = theme === 'dark';

  const imageUri = post.image_url
    ? post.image_url.startsWith('http')
      ? post.image_url
      : `${UPLOADS_URL}/${post.image_url}`
    : null;

  const isOwn = currentUser?.id === post.author.id;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderBottomColor: isDark ? '#374151' : '#e5e7eb',
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Post by ${post.author.display_name}`}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onAuthorPress}
          style={styles.authorRow}
          accessibilityLabel={`View ${post.author.display_name}'s profile`}>
          <Avatar
            uri={post.author.avatar_url}
            name={post.author.display_name}
            size={40}
          />
          <View style={styles.authorInfo}>
            <Text
              style={[
                styles.displayName,
                {color: isDark ? '#f3f4f6' : '#111827'},
              ]}>
              {post.author.display_name}
            </Text>
            <Text style={[styles.username, {color: isDark ? '#6b7280' : '#9ca3af'}]}>
              @{post.author.username} · {formatRelativeTime(post.created_at)}
            </Text>
          </View>
        </TouchableOpacity>
        {isOwn && onDelete && (
          <TouchableOpacity
            onPress={onDelete}
            accessibilityLabel="Delete post"
            accessibilityRole="button">
            <Icon name="delete-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <RenderTaggedContent
          content={post.content}
          style={{color: isDark ? '#d1d5db' : '#374151', fontSize: 15, lineHeight: 22}}
          tagStyle={{color: '#3b82f6'}}
          onTagPress={onTagPress}
        />
      </View>

      {/* Image */}
      {imageUri && (
        <Image
          source={{uri: imageUri}}
          style={styles.postImage}
          resizeMode="cover"
          accessibilityLabel="Post image"
        />
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onLike}
          accessibilityRole="button"
          accessibilityLabel={post.is_liked ? 'Unlike post' : 'Like post'}>
          <Icon
            name={post.is_liked ? 'heart' : 'heart-outline'}
            size={20}
            color={post.is_liked ? '#ef4444' : isDark ? '#6b7280' : '#9ca3af'}
          />
          {post.like_count > 0 && (
            <Text
              style={[
                styles.actionCount,
                {color: post.is_liked ? '#ef4444' : isDark ? '#6b7280' : '#9ca3af'},
              ]}>
              {formatCount(post.like_count)}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={onComment}
          accessibilityRole="button"
          accessibilityLabel="View comments">
          <Icon
            name="comment-outline"
            size={20}
            color={isDark ? '#6b7280' : '#9ca3af'}
          />
          {post.comment_count > 0 && (
            <Text
              style={[
                styles.actionCount,
                {color: isDark ? '#6b7280' : '#9ca3af'},
              ]}>
              {formatCount(post.comment_count)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorInfo: {
    marginLeft: 10,
    flex: 1,
  },
  displayName: {
    fontWeight: '700',
    fontSize: 15,
  },
  username: {
    fontSize: 13,
  },
  content: {
    marginTop: 8,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 10,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 24,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: 13,
  },
});
