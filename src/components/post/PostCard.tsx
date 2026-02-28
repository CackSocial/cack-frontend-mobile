import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet, Share} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type {Post} from '../../types';
import Avatar from '../common/Avatar';
import RenderTaggedContent from '../../utils/renderTaggedContent';
import {formatRelativeTime, formatCount} from '../../utils/format';
import {UPLOADS_URL} from '../../config';
import {useColors, fonts} from '../../theme';

interface Props {
  post: Post;
  onPress?: () => void;
  onAuthorPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onTagPress?: (tag: string) => void;
}

export default function PostCard({
  post,
  onPress,
  onAuthorPress,
  onLike,
  onComment,
  onTagPress,
}: Props) {
  const c = useColors();

  const imageUri = post.image_url
    ? post.image_url.startsWith('http')
      ? post.image_url
      : `${UPLOADS_URL}/${post.image_url}`
    : null;

  const handleShare = () => {
    Share.share({message: post.content});
  };

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
      <View style={styles.row}>
        <TouchableOpacity onPress={onAuthorPress}>
          <Avatar
            uri={post.author.avatar_url}
            name={post.author.display_name}
            size={40}
          />
        </TouchableOpacity>
        <View style={styles.body}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onAuthorPress}
              style={styles.authorRow}
              accessibilityLabel={`View ${post.author.display_name}'s profile`}>
              <Text style={[styles.displayName, {color: c.textPrimary}]}>
                {post.author.display_name}
              </Text>
              <Text style={[styles.meta, {color: c.textTertiary}]}>
                @{post.author.username} · {formatRelativeTime(post.created_at)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <RenderTaggedContent
              content={post.content}
              style={{color: c.textPrimary, fontSize: 15, lineHeight: 24, fontFamily: fonts.body}}
              tagStyle={{color: c.accent, fontFamily: fonts.bodySemiBold}}
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

          {/* Actions — 3 buttons evenly spaced */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onLike}
              accessibilityRole="button"
              accessibilityLabel={post.is_liked ? 'Unlike post' : 'Like post'}>
              <Icon
                name={post.is_liked ? 'heart' : 'heart-outline'}
                size={18}
                color={post.is_liked ? '#ef4444' : c.textMuted}
              />
              <Text
                style={[
                  styles.actionCount,
                  {color: post.is_liked ? '#ef4444' : c.textMuted},
                ]}>
                {post.like_count > 0 ? formatCount(post.like_count) : ' '}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onComment}
              accessibilityRole="button"
              accessibilityLabel="View comments">
              <Icon name="comment-outline" size={18} color={c.textMuted} />
              <Text style={[styles.actionCount, {color: c.textMuted}]}>
                {post.comment_count > 0 ? formatCount(post.comment_count) : ' '}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleShare}
              accessibilityRole="button"
              accessibilityLabel="Share post">
              <Icon name="share-outline" size={18} color={c.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  body: {
    flex: 1,
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
    gap: 6,
  },
  displayName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
  },
  meta: {
    fontSize: 13,
    fontFamily: fonts.body,
  },
  content: {
    marginTop: 4,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 10,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 12,
    justifyContent: 'space-between',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 2,
    minWidth: 54,
  },
  actionCount: {
    fontSize: 13,
    fontFamily: fonts.body,
  },
});
