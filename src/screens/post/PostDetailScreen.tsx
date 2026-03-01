import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PostCard from '../../components/post/PostCard';
import CommentItem from '../../components/post/CommentItem';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import {usePostDetail} from '../../hooks/usePostDetail';
import {useSyncPostLike} from '../../hooks/useSyncLikes';
import {createComment} from '../../api/comments';
import {likePost, unlikePost} from '../../api/likes';
import {usePostsStore} from '../../stores/postsStore';
import {useAuthStore} from '../../stores/authStore';
import {useColors, fonts} from '../../theme';
import type {Comment} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'PostDetail'>;

/** Self-contained reply bar — owns its own text state so typing doesn't re-render the parent */
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
    <View
      style={[
        styles.replyBar,
        {borderBottomColor: c.border, borderTopColor: c.border},
      ]}>
      <Avatar
        uri={currentUser?.avatar_url}
        name={currentUser?.display_name ?? ''}
        size={32}
      />
      <View
        style={[
          styles.replyInputWrap,
          {backgroundColor: c.bgSecondary, borderColor: c.borderStrong},
        ]}>
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
        <Icon
          name="send"
          size={18}
          color={text.trim() ? c.accentText : c.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
});

export default function PostDetailScreen({route, navigation}: Props) {
  const {postId} = route.params;
  const c = useColors();
  const cachePost = usePostsStore(s => s.cachePost);
  const toggleBookmark = usePostsStore(s => s.toggleBookmark);
  const toggleRepost = usePostsStore(s => s.toggleRepost);

  const {
    post,
    setPost,
    comments,
    loading,
    commentsHasMore,
    fetchPost,
    fetchComments,
    addComment,
  } = usePostDetail(postId);

  // Sync post state from global cache on focus
  useSyncPostLike(setPost);

  useEffect(() => {
    fetchPost();
    fetchComments(true);
  }, []);

  const handleLike = useCallback(async () => {
    if (!post) return;
    const was = post.is_liked;
    const newLiked = !was;
    const newCount = post.like_count + (was ? -1 : 1);
    setPost({...post, is_liked: newLiked, like_count: newCount});
    cachePost(post.id, {is_liked: newLiked, like_count: newCount});
    try {
      was ? await unlikePost(post.id) : await likePost(post.id);
    } catch {
      setPost({...post, is_liked: was, like_count: post.like_count});
      cachePost(post.id, {is_liked: was, like_count: post.like_count});
    }
  }, [post, setPost, cachePost]);

  const handleSubmitComment = useCallback(async (text: string) => {
    try {
      const newComment = await createComment(postId, text);
      addComment(newComment);
      if (post) {
        cachePost(postId, {comment_count: post.comment_count + 1});
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
      throw e; // let ReplyBar know it failed
    }
  }, [postId, post, addComment, cachePost]);

  const navigateToProfile = (username: string) => {
    navigation.navigate('Profile', {username});
  };

  const renderHeader = useCallback(() =>
    post ? (
      <View>
        <PostCard
          post={post}
          onAuthorPress={() => navigateToProfile(post.author.username)}
          onLike={handleLike}
          onBookmark={() => toggleBookmark(post.id)}
          onRepost={() => toggleRepost(post.id)}
          onQuote={() => navigation.navigate('QuotePost', {post})}
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
        {comments.length > 0 && (
          <View style={[styles.repliesHeader, {borderBottomColor: c.border}]}>
            <Text style={[styles.repliesTitle, {color: c.textPrimary}]}>
              Replies
            </Text>
          </View>
        )}
      </View>
    ) : null,
  [post, comments.length, handleLike, handleSubmitComment, c, navigation, toggleBookmark, toggleRepost]);

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
        <ActivityIndicator size="large" />
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
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="comment-outline"
              title="No replies yet"
              subtitle="Be the first to reply"
            />
          ) : null
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
  replyBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    gap: 10,
  },
  replyInputWrap: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    maxHeight: 120,
  },
  replyInput: {
    fontSize: 15,
    fontFamily: fonts.body,
    maxHeight: 100,
    paddingVertical: 6,
  },
  replyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repliesHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  repliesTitle: {
    fontSize: 16,
    fontFamily: fonts.bodySemiBold,
  },
});
