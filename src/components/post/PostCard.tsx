import React from 'react';
import {View, Text, Image, TouchableOpacity, StyleSheet, Share} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type {Post} from '../../types';
import Avatar from '../common/Avatar';
import RenderTaggedContent from '../../utils/renderTaggedContent';
import {resolveImageUri} from '../../utils/resolveImageUri';
import {formatRelativeTime, formatCount} from '../../utils/format';
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

// REFACTORED: Wrapped in React.memo — rendered in FlatList, benefits from shallow prop comparison
export default React.memo(function PostCard({
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

  const handleShare = () => {
    Share.share({message: post.content}).catch(() => {});
  };

  const isRepost = post.post_type === 'repost';
  const isQuote = post.post_type === 'quote';

  const displayPost = isRepost && post.original_post ? post.original_post : post;
  const displayImage = resolveImageUri(displayPost.image_url);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.card, {borderBottomColor: c.border}]}
      accessibilityRole="button"
      accessibilityLabel={`Post by ${displayPost.author.display_name}`}>
      {/* Repost label */}
      {isRepost && (
        <View style={styles.repostLabel}>
          <Icon name="repeat" size={14} color={c.textMuted} />
          <Text style={[styles.repostLabelText, {color: c.textMuted}]}>
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
          <TouchableOpacity
            onPress={isRepost ? onOriginalPostPress : onAuthorPress}
            style={styles.authorRow}
            accessibilityLabel={`View ${displayPost.author.display_name}'s profile`}>
            <Text style={[styles.displayName, {color: c.textPrimary}]} numberOfLines={1}>
              {displayPost.author.display_name}
            </Text>
            <Text style={[styles.meta, {color: c.textSecondary}]} numberOfLines={1}>
              @{displayPost.author.username}
            </Text>
            <Text style={[styles.dot, {color: c.textSecondary}]}>·</Text>
            <Text style={[styles.meta, {color: c.textSecondary}]}>
              {formatRelativeTime(displayPost.created_at)}
            </Text>
          </TouchableOpacity>

          {/* Content */}
          {displayPost.content ? (
            <View style={styles.content}>
              <RenderTaggedContent
                content={displayPost.content}
                style={{color: c.textPrimary, fontSize: 15, lineHeight: 22, fontFamily: fonts.body}}
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
              style={[styles.postImage, {borderColor: c.border}]}
              resizeMode="cover"
              accessibilityLabel="Post image"
            />
          )}

          {/* Quoted post embed */}
          {isQuote && post.original_post && (
            <TouchableOpacity
              style={[styles.quotedPost, {borderColor: c.border}]}
              onPress={onOriginalPostPress}
              activeOpacity={0.7}>
              <View style={styles.quotedHeader}>
                <Avatar
                  uri={post.original_post.author.avatar_url}
                  name={post.original_post.author.display_name}
                  size={18}
                />
                <Text style={[styles.quotedName, {color: c.textPrimary}]}>
                  {post.original_post.author.display_name}
                </Text>
                <Text style={[styles.quotedMeta, {color: c.textSecondary}]}>
                  @{post.original_post.author.username}
                </Text>
              </View>
              {post.original_post.content ? (
                <Text
                  style={[styles.quotedContent, {color: c.textPrimary}]}
                  numberOfLines={3}>
                  {post.original_post.content}
                </Text>
              ) : null}
              {post.original_post.image_url ? (
                <Image
                  source={{uri: resolveImageUri(post.original_post.image_url)!}}
                  style={[styles.quotedImage, {borderColor: c.border}]}
                  resizeMode="cover"
                />
              ) : null}
            </TouchableOpacity>
          )}

          {/* Actions — use displayPost for counts/states so reposts show original's engagement */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onComment}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              accessibilityLabel="View comments">
              <Icon name="comment-outline" size={17} color={c.textMuted} />
              {displayPost.comment_count > 0 && (
                <Text style={[styles.actionCount, {color: c.textMuted}]}>
                  {formatCount(displayPost.comment_count)}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onRepost}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              accessibilityLabel={displayPost.is_reposted ? 'Undo repost' : 'Repost'}>
              <Icon
                name="repeat"
                size={17}
                color={displayPost.is_reposted ? c.success : c.textMuted}
              />
              {displayPost.repost_count > 0 && (
                <Text
                  style={[
                    styles.actionCount,
                    {color: displayPost.is_reposted ? c.success : c.textMuted},
                  ]}>
                  {formatCount(displayPost.repost_count)}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onLike}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              accessibilityLabel={displayPost.is_liked ? 'Unlike post' : 'Like post'}>
              <Icon
                name={displayPost.is_liked ? 'heart' : 'heart-outline'}
                size={17}
                color={displayPost.is_liked ? c.like : c.textMuted}
              />
              {displayPost.like_count > 0 && (
                <Text
                  style={[
                    styles.actionCount,
                    {color: displayPost.is_liked ? c.like : c.textMuted},
                  ]}>
                  {formatCount(displayPost.like_count)}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onBookmark}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              accessibilityLabel={displayPost.is_bookmarked ? 'Remove bookmark' : 'Bookmark'}>
              <Icon
                name={displayPost.is_bookmarked ? 'bookmark' : 'bookmark-outline'}
                size={17}
                color={displayPost.is_bookmarked ? c.accent : c.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={handleShare}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
              accessibilityLabel="Share post">
              <Icon name="export-variant" size={17} color={c.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  repostLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    paddingBottom: 4,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 16,
  },
  displayName: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    flexShrink: 0,
  },
  meta: {
    fontSize: 14,
    fontFamily: fonts.body,
    flexShrink: 1,
  },
  dot: {
    fontSize: 14,
    fontFamily: fonts.body,
  },
  content: {
    marginTop: 2,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 10,
  },
  quotedPost: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginTop: 10,
  },
  quotedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  quotedName: {
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
  },
  quotedMeta: {
    fontSize: 13,
    fontFamily: fonts.body,
  },
  quotedContent: {
    fontSize: 14,
    fontFamily: fonts.body,
    lineHeight: 19,
  },
  quotedImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 6,
    paddingRight: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: 13,
    fontFamily: fonts.body,
  },
});
