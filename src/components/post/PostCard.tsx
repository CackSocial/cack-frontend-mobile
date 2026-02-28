import React, {useCallback} from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type {Post} from '../../types';
import Avatar from '../common/Avatar';
import RenderTaggedContent from '../../utils/renderTaggedContent';
import {formatRelativeTime, formatCount} from '../../utils/format';
import {UPLOADS_URL} from '../../config';
import {useColors} from '../../theme';
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
  const c = useColors();
  const currentUser = useAuthStore(s => s.user);

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
          backgroundColor: c.bgElevated,
          borderBottomColor: c.border,
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
                {color: c.textPrimary},
              ]}>
              {post.author.display_name}
            </Text>
            <Text style={[styles.username, {color: c.textTertiary}]}>
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
          style={{color: c.textPrimary, fontSize: 15, lineHeight: 22}}
          tagStyle={{color: c.accent}}
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
            color={post.is_liked ? '#ef4444' : c.textMuted}
          />
          {post.like_count > 0 && (
            <Text
              style={[
                styles.actionCount,
                {color: post.is_liked ? '#ef4444' : c.textMuted},
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
            color={c.textMuted}
          />
          {post.comment_count > 0 && (
            <Text
              style={[
                styles.actionCount,
                {color: c.textMuted},
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
