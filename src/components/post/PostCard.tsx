import React from 'react';
import {View, Text, Image, Pressable, Share, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type {Post} from '../../types';
import Avatar from '../common/Avatar';
import RenderTaggedContent from '../../utils/renderTaggedContent';
import {resolveImageUri} from '../../utils/resolveImageUri';
import {formatRelativeTime, formatCount} from '../../utils/format';
import {useColors, fonts, radii, spacing, typography, elevation, opacity, sizes} from '../../theme';

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

interface ActionButtonProps {
  icon: string;
  label?: string;
  tintColor: string;
  onPress?: () => void;
}

function ActionButton({icon, label, tintColor, onPress}: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({pressed}) => [styles.actionButton, pressed ? {opacity: opacity.actionPressed} : null]}>
      <Icon name={icon} size={18} color={tintColor} />
      {label ? <Text style={[styles.actionText, {color: tintColor}]}>{label}</Text> : null}
    </Pressable>
  );
}

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

  const isRepost = post.post_type === 'repost';
  const isQuote = post.post_type === 'quote';

  const displayPost = isRepost && post.original_post ? post.original_post : post;
  const displayImage = resolveImageUri(displayPost.image_url);

  const handleShare = () => {
    const message = displayPost.content || 'Check out this post on Cack Social';
    Share.share({message}).catch(() => {});
  };

  return (
    <View
      style={[
        styles.card,
        elevation.card,
        {
          backgroundColor: c.bgElevated,
          borderColor: c.border,
        },
      ]}>
      {isRepost ? (
        <View style={styles.repostLabel}>
          <Icon name="repeat" size={14} color={c.textTertiary} />
          <Text style={[styles.repostLabelText, {color: c.textTertiary}]}> 
            {post.author.display_name} reposted
          </Text>
        </View>
      ) : null}

      <View style={styles.row}>
        <Pressable onPress={onAuthorPress}>
          <Avatar
            uri={displayPost.author.avatar_url}
            name={displayPost.author.display_name}
            size={44}
          />
        </Pressable>

        <View style={styles.body}>
          <Pressable
            onPress={onPress}
            style={({pressed}) => [styles.contentPressable, pressed ? {opacity: opacity.contentPressed} : null]}>
            <Pressable
              onPress={onAuthorPress}
              style={styles.authorRow}
              accessibilityLabel={`View ${displayPost.author.display_name}'s profile`}>
              <Text style={[styles.displayName, {color: c.textPrimary}]} numberOfLines={1}>
                {displayPost.author.display_name}
              </Text>
              <Text style={[styles.meta, {color: c.textTertiary}]} numberOfLines={1}>
                @{displayPost.author.username}
              </Text>
              <Text style={[styles.meta, {color: c.textTertiary}]}>·</Text>
              <Text style={[styles.meta, {color: c.textTertiary}]}> 
                {formatRelativeTime(displayPost.created_at)}
              </Text>
            </Pressable>

            {displayPost.content ? (
              <View style={styles.content}>
                <RenderTaggedContent
                  content={displayPost.content}
                  style={{
                    color: c.textPrimary,
                    fontSize: typography.base,
                    lineHeight: 24,
                    fontFamily: fonts.body,
                  }}
                  tagStyle={{color: c.textPrimary, fontFamily: fonts.bodySemiBold}}
                  onTagPress={onTagPress}
                  onMentionPress={onMentionPress}
                />
              </View>
            ) : null}

            {displayImage ? (
              <Image
                source={{uri: displayImage}}
                style={[styles.postImage, {borderColor: c.border}]}
                resizeMode="cover"
                accessibilityLabel="Post image"
              />
            ) : null}

            {isQuote && post.original_post ? (
              <Pressable
                style={[styles.quotedPost, {borderColor: c.border, backgroundColor: c.bgPrimary}]}
                onPress={onOriginalPostPress}>
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
                  <Text style={[styles.quotedContent, {color: c.textSecondary}]} numberOfLines={4}>
                    {post.original_post.content}
                  </Text>
                ) : null}
                {post.original_post.image_url &&
                resolveImageUri(post.original_post.image_url) ? (
                  <Image
                    source={{uri: resolveImageUri(post.original_post.image_url) as string}}
                    style={[styles.quotedImage, {borderColor: c.border}]}
                    resizeMode="cover"
                  />
                ) : null}
              </Pressable>
            ) : null}
          </Pressable>

          <View style={styles.actions}>
            <ActionButton
              icon="comment-outline"
              label={displayPost.comment_count > 0 ? formatCount(displayPost.comment_count) : undefined}
              tintColor={c.textTertiary}
              onPress={onComment}
            />
            <ActionButton
              icon="repeat"
              label={displayPost.repost_count > 0 ? formatCount(displayPost.repost_count) : undefined}
              tintColor={displayPost.is_reposted ? c.success : c.textTertiary}
              onPress={onRepost}
            />
            <ActionButton
              icon={displayPost.is_liked ? 'heart' : 'heart-outline'}
              label={displayPost.like_count > 0 ? formatCount(displayPost.like_count) : undefined}
              tintColor={displayPost.is_liked ? c.like : c.textTertiary}
              onPress={onLike}
            />
            {onQuote ? (
              <ActionButton icon="format-quote-close" tintColor={c.textTertiary} onPress={onQuote} />
            ) : null}
            <ActionButton
              icon={displayPost.is_bookmarked ? 'bookmark' : 'bookmark-outline'}
              tintColor={displayPost.is_bookmarked ? c.textPrimary : c.textTertiary}
              onPress={onBookmark}
            />
            <ActionButton icon="share-variant-outline" tintColor={c.textTertiary} onPress={handleShare} />
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    borderWidth: 1,
    borderRadius: radii.xxl,
    padding: spacing[4],
  },
  repostLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingLeft: 56,
    marginBottom: spacing[2],
  },
  repostLabelText: {
    fontSize: typography.xs,
    fontFamily: fonts.bodyMedium,
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  contentPressable: {
    gap: spacing[3],
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  displayName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: typography.sm,
  },
  meta: {
    fontSize: typography.sm,
    fontFamily: fonts.body,
  },
  content: {
    gap: spacing[2],
  },
  postImage: {
    width: '100%',
    height: sizes.postCard.imageHeight,
    borderRadius: radii.xl,
    borderWidth: 1,
  },
  quotedPost: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing[3],
    gap: spacing[2],
  },
  quotedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  quotedName: {
    fontSize: typography.sm,
    fontFamily: fonts.bodySemiBold,
  },
  quotedMeta: {
    fontSize: typography.sm,
    fontFamily: fonts.body,
  },
  quotedContent: {
    fontSize: typography.sm,
    fontFamily: fonts.body,
    lineHeight: 20,
  },
  quotedImage: {
    width: '100%',
    height: sizes.postCard.quotedImageHeight,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing[4],
    marginTop: spacing[4],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  actionText: {
    fontSize: typography.sm,
    fontFamily: fonts.body,
  },
});
