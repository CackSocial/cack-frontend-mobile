import React, {useEffect, useState, useCallback} from 'react';
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
import {useColors, fonts, radii, spacing, typography} from '../../theme';
import {getErrorMessage} from '../../utils/log';
import {sharedStyles} from '../../styles/shared';
import type {Comment} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../../navigation/types';

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
    } catch {}
    setSending(false);
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
            maxLength={2000}
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

  useSyncPostLike(setPost);

  const handleLike = useOptimisticLike(undefined, setPost);
  const handleBookmark = useOptimisticBookmark(undefined, setPost);
  const handleRepost = useOptimisticRepost(undefined, setPost);

  useEffect(() => {
    fetchPost();
    fetchComments(true);
  }, []);

  const handleSubmitComment = useCallback(
    async (text: string) => {
      try {
        const newComment = await createComment(postId, text);
        addComment(newComment);
        if (post) {
          cachePost(postId, {comment_count: post.comment_count + 1});
        }
      } catch (e: unknown) {
        Alert.alert('Error', getErrorMessage(e));
        throw e;
      }
    },
    [postId, post, addComment, cachePost],
  );

  const navigateToProfile = (username: string) => {
    navigation.navigate('Profile', {username});
  };

  const renderHeader = useCallback(() => {
    if (!post) return null;
    const actionTarget = post.post_type === 'repost' && post.original_post ? post.original_post : post;
    return (
      <View style={styles.headerContent}>
        <PostCard
          post={post}
          onAuthorPress={() => navigateToProfile(actionTarget.author.username)}
          onLike={() => handleLike(post)}
          onBookmark={() => handleBookmark(post)}
          onRepost={() => handleRepost(post)}
          onQuote={() => navigation.navigate('QuotePost', {post: actionTarget})}
          onTagPress={tag =>
            navigation.getParent()?.navigate('ExploreTab', {
              screen: 'TagPosts',
              params: {tagName: tag},
              initial: false,
            })
          }
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
  }, [c.textPrimary, handleBookmark, handleLike, handleRepost, handleSubmitComment, navigation, post]);

  const renderComment = ({item}: {item: Comment}) => (
    <CommentItem
      comment={item}
      onAuthorPress={() => navigateToProfile(item.author.username)}
      onMentionPress={username => navigateToProfile(username)}
      onTagPress={tag =>
        navigation.getParent()?.navigate('ExploreTab', {
          screen: 'TagPosts',
          params: {tagName: tag},
          initial: false,
        })
      }
    />
  );

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
