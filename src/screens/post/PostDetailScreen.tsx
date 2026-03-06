import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Text,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PostCard from '../../components/post/PostCard';
import CommentItem from '../../components/post/CommentItem';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import Surface from '../../components/common/Surface';
import {usePostDetail} from '../../hooks/usePostDetail';
import {useSyncPostLike} from '../../hooks/useSyncLikes';
import {useOptimisticLike} from '../../hooks/useOptimisticLike';
import {useOptimisticBookmark} from '../../hooks/useOptimisticBookmark';
import {useOptimisticRepost} from '../../hooks/useOptimisticRepost';
import {createComment} from '../../api/comments';
import {usePostsStore} from '../../stores/postsStore';
import {useAuthStore} from '../../stores/authStore';
import {MAX_COMMENT_LENGTH} from '../../config';
import {useColors, fonts, radii, spacing, typography} from '../../theme';
import {getErrorMessage, logError} from '../../utils/log';
import {navigateToExploreTag, type MainTabNavigation} from '../../navigation/helpers';
import {sharedStyles} from '../../styles/shared';
import type {Comment} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../../navigation/types';
import {resolveActionTarget, postToCachedState} from '../../utils/posts';

type Props = NativeStackScreenProps<HomeStackParamList, 'PostDetail'>;

const ReplyBar = React.memo(function ReplyBar({
  onSubmit,
}: {
  onSubmit: (text: string) => Promise<void>;
}) {
  const c = useColors();
  const currentUser = useAuthStore(s => s.user);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await onSubmit(trimmed);
      setText('');
    } catch (error: unknown) {
      logError('ReplyBar:handleSend', error);
    } finally {
      setSending(false);
    }
  }, [text, sending, onSubmit]);

  return (
    <Surface style={styles.replySurface}>
      <View style={styles.replyRow}>
        <Avatar uri={currentUser?.avatar_url} name={currentUser?.display_name ?? ''} size={36} />
        <View style={[styles.replyInputWrap, {backgroundColor: c.bgSecondary, borderColor: c.border}]}> 
          <TextInput
            style={[styles.replyInput, {color: c.textPrimary}]}
            placeholder="Post your reply"
            placeholderTextColor={c.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={MAX_COMMENT_LENGTH}
            accessibilityLabel="Reply input"
          />
        </View>
        <TouchableOpacity
          onPress={handleSend}
          disabled={!text.trim() || sending}
          style={[
            styles.replyBtn,
            {backgroundColor: text.trim() ? c.accent : c.bgTertiary},
          ]}
          accessibilityRole="button"
          accessibilityLabel="Send reply">
          {sending ? (
            <ActivityIndicator size="small" color={c.accentText} />
          ) : (
            <Icon name="send" size={18} color={text.trim() ? c.accentText : c.textMuted} />
          )}
        </TouchableOpacity>
      </View>
    </Surface>
  );
});

export default function PostDetailScreen({route, navigation}: Props) {
  const {postId} = route.params;
  const c = useColors();
  const cachePost = usePostsStore(s => s.cachePost);

  const {post, setPost, comments, loading, commentsHasMore, fetchPost, fetchComments, addComment} =
    usePostDetail(postId);

  const postRef = useRef(post);
  postRef.current = post;

  useSyncPostLike(setPost);

  const handleLike = useOptimisticLike(undefined, setPost);
  const handleBookmark = useOptimisticBookmark(undefined, setPost);
  const handleRepost = useOptimisticRepost(undefined, setPost);

  useEffect(() => {
    fetchPost();
    fetchComments(true);
  }, [fetchComments, fetchPost]);

  const handleSubmitComment = useCallback(
    async (text: string) => {
      try {
        const newComment = await createComment(postId, text);
        addComment(newComment);
        const currentPost = postRef.current;
        if (currentPost) {
          cachePost(postId, {
            ...postToCachedState(currentPost),
            comment_count: currentPost.comment_count + 1,
          });
        }
      } catch (e: unknown) {
        Alert.alert('Error', getErrorMessage(e));
        throw e;
      }
    },
    [postId, addComment, cachePost],
  );

  const navigateToProfile = useCallback(
    (username: string) => {
      navigation.navigate('Profile', {username});
    },
    [navigation],
  );

  const handleTagPress = useCallback(
    (tag: string) => {
      const parentNavigation = navigation.getParent<MainTabNavigation>();
      if (parentNavigation) {
        navigateToExploreTag(parentNavigation, tag);
      }
    },
    [navigation],
  );

  const renderHeader = useCallback(() => {
    if (!post) return null;
    const actionTarget = resolveActionTarget(post);
    return (
      <View style={styles.headerContent}>
        <PostCard
          post={post}
          onAuthorPress={() => navigateToProfile(actionTarget.author.username)}
          onLike={() => handleLike(post)}
          onBookmark={() => handleBookmark(post)}
          onRepost={() => handleRepost(post)}
          onQuote={() => navigation.navigate('QuotePost', {post: actionTarget})}
          onTagPress={handleTagPress}
          onMentionPress={username => navigateToProfile(username)}
          onOriginalPostPress={
            post.original_post
              ? () => navigation.push('PostDetail', {postId: post.original_post!.id})
              : undefined
          }
        />
        <ReplyBar onSubmit={handleSubmitComment} />
        <Text style={[styles.repliesTitle, {color: c.textPrimary}]}>Replies</Text>
      </View>
    );
  }, [c.textPrimary, handleBookmark, handleLike, handleRepost, handleSubmitComment, handleTagPress, navigateToProfile, navigation, post]);

  const renderComment = useCallback(({item}: {item: Comment}) => (
    <CommentItem
      comment={item}
      onAuthorPress={() => navigateToProfile(item.author.username)}
      onMentionPress={username => navigateToProfile(username)}
      onTagPress={handleTagPress}
    />
  ), [navigateToProfile, handleTagPress]);

  if (loading && !post) {
    return (
      <View style={[styles.center, {backgroundColor: c.bgPrimary}]}> 
        <ActivityIndicator size="large" color={c.textPrimary} />
      </View>
    );
  }

  return (
    <View style={[styles.flex, {backgroundColor: c.bgPrimary}]}> 
      <FlatList
        data={comments}
        keyExtractor={item => item.id}
        renderItem={renderComment}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={sharedStyles.paddedListContent}
        ListEmptyComponent={
          !loading ? <EmptyState icon="comment-outline" title="No replies yet" /> : null
        }
        onEndReached={() => {
          if (commentsHasMore) fetchComments(false);
        }}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  headerContent: {
    gap: spacing[3],
  },
  replySurface: {
    marginHorizontal: spacing[4],
  },
  replyRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[3],
  },
  replyInputWrap: {
    flex: 1,
    borderRadius: radii.xl,
    borderWidth: 1,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    minHeight: 48,
  },
  replyInput: {
    fontSize: typography.base,
    fontFamily: fonts.body,
    maxHeight: 110,
    paddingVertical: spacing[2],
  },
  replyBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repliesTitle: {
    fontSize: typography.lg,
    fontFamily: fonts.displayBold,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
  },
});
