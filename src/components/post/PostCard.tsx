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
  onBookmark?: () => void;
  onRepost?: () => void;
  onQuote?: () => void;
  onTagPress?: (tag: string) => void;
  onMentionPress?: (username: string) => void;
  onOriginalPostPress?: () => void;
}

function resolveImageUri(url: string | undefined): string | null {
  if (!url) return null;
  return url.startsWith('http') ? url : `${UPLOADS_URL}/${url}`;
}

export default function PostCard({
  post,
  onPress,
  onAuthorPress,
  onLike,
  onComment,
  onBookmark,
  onRepost,
  onQuote,
  onTagPress,
  onMentionPress,
  onOriginalPostPress,
}: Props) {
  const c = useColors();
  const imageUri = resolveImageUri(post.image_url);

  const handleShare = () => {
    Share.share({message: post.content});
  };

  const isRepost = post.post_type === 'repost';
  const isQuote = post.post_type === 'quote';

  // For reposts, display the original post content
  const displayPost = isRepost && post.original_post ? post.original_post : post;
  const displayImage = resolveImageUri(displayPost.image_url);

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
      accessibilityLabel={`Post by ${displayPost.author.display_name}`}>
      {/* Repost label */}
      {isRepost && (
        <View style={styles.repostLabel}>
          <Icon name="repeat" size={14} color={c.textTertiary} />
          <Text style={[styles.repostLabelText, {color: c.textTertiary}]}>
            {post.author.display_name} reposted
          </Text>
        </View>
      )}

      <View style={styles.row}>
        <TouchableOpacity onPress={isRepost ? onOriginalPostPress : onAuthorPress}>
          <Avatar
            uri={displayPost.author.avatar_url}
            name={displayPost.author.display_name}
            size={40}
          />
        </TouchableOpacity>
        <View style={styles.body}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={isRepost ? onOriginalPostPress : onAuthorPress}
              style={styles.authorRow}
              accessibilityLabel={`View ${displayPost.author.display_name}'s profile`}>
              <Text style={[styles.displayName, {color: c.textPrimary}]}>
                {displayPost.author.display_name}
              </Text>
              <Text style={[styles.meta, {color: c.textTertiary}]}>
                @{displayPost.author.username} · {formatRelativeTime(displayPost.created_at)}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {displayPost.content ? (
            <View style={styles.content}>
              <RenderTaggedContent
                content={displayPost.content}
                style={{color: c.textPrimary, fontSize: 15, lineHeight: 24, fontFamily: fonts.body}}
                tagStyle={{color: c.accent, fontFamily: fonts.bodySemiBold}}
                onTagPress={onTagPress}
                onMentionPress={onMentionPress}
              />
            </View>
          ) : null}

          {/* Image */}
          {displayImage && (
            <Image
              source={{uri: displayImage}}
              style={styles.postImage}
              resizeMode="cover"
              accessibilityLabel="Post image"
            />
          )}

          {/* Quoted post embed */}
          {isQuote && post.original_post && (
            <TouchableOpacity
              style={[styles.quotedPost, {borderColor: c.border, backgroundColor: c.bgSecondary}]}
              onPress={onOriginalPostPress}
              activeOpacity={0.8}>
              <View style={styles.quotedHeader}>
                <Avatar
                  uri={post.original_post.author.avatar_url}
                  name={post.original_post.author.display_name}
                  size={20}
                />
                <Text style={[styles.quotedName, {color: c.textPrimary}]}>
                  {post.original_post.author.display_name}
                </Text>
                <Text style={[styles.quotedMeta, {color: c.textTertiary}]}>
                  @{post.original_post.author.username}
                </Text>
              </View>
              {post.original_post.content ? (
                <Text
                  style={[styles.quotedContent, {color: c.textSecondary}]}
                  numberOfLines={3}>
                  {post.original_post.content}
                </Text>
              ) : null}
              {post.original_post.image_url ? (
                <Image
                  source={{uri: resolveImageUri(post.original_post.image_url)!}}
                  style={styles.quotedImage}
                  resizeMode="cover"
                />
              ) : null}
            </TouchableOpacity>
          )}

          {/* Actions — 5 buttons */}
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
              onPress={onRepost}
              accessibilityRole="button"
              accessibilityLabel={post.is_reposted ? 'Undo repost' : 'Repost'}>
              <Icon
                name="repeat"
                size={18}
                color={post.is_reposted ? '#16a34a' : c.textMuted}
              />
              <Text
                style={[
                  styles.actionCount,
                  {color: post.is_reposted ? '#16a34a' : c.textMuted},
                ]}>
                {post.repost_count > 0 ? formatCount(post.repost_count) : ' '}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onBookmark}
              accessibilityRole="button"
              accessibilityLabel={post.is_bookmarked ? 'Remove bookmark' : 'Bookmark'}>
              <Icon
                name={post.is_bookmarked ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={post.is_bookmarked ? c.accent : c.textMuted}
              />
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
  repostLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 52,
    marginBottom: 4,
  },
  repostLabelText: {
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
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
  quotedPost: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  quotedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  quotedName: {
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
  },
  quotedMeta: {
    fontSize: 12,
    fontFamily: fonts.body,
  },
  quotedContent: {
    fontSize: 14,
    fontFamily: fonts.body,
    lineHeight: 20,
  },
  quotedImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginTop: 8,
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
    minWidth: 42,
  },
  actionCount: {
    fontSize: 13,
    fontFamily: fonts.body,
  },
});
