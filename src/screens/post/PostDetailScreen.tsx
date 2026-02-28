import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PostCard from '../../components/post/PostCard';
import CommentItem from '../../components/post/CommentItem';
import EmptyState from '../../components/common/EmptyState';
import {usePostDetail} from '../../hooks/usePostDetail';
import {createComment, deleteComment} from '../../api/comments';
import {deletePost} from '../../api/posts';
import {likePost, unlikePost} from '../../api/likes';
import {usePostsStore} from '../../stores/postsStore';
import {useAuthStore} from '../../stores/authStore';
import {useColors, fonts} from '../../theme';
import type {Comment} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'PostDetail'>;

export default function PostDetailScreen({route, navigation}: Props) {
  const {postId} = route.params;
  const c = useColors();
  const currentUser = useAuthStore(s => s.user);
  const toggleTimelineLike = usePostsStore(s => s.toggleLike);
  const removeFromTimeline = usePostsStore(s => s.removePost);

  const {
    post,
    setPost,
    comments,
    loading,
    commentsHasMore,
    fetchPost,
    fetchComments,
    addComment,
    removeComment,
  } = usePostDetail(postId);

  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments(true);
  }, []);

  const handleLike = useCallback(async () => {
    if (!post) return;
    const was = post.is_liked;
    setPost({
      ...post,
      is_liked: !was,
      like_count: post.like_count + (was ? -1 : 1),
    });
    toggleTimelineLike(post.id);
    try {
      was ? await unlikePost(post.id) : await likePost(post.id);
    } catch {
      setPost({
        ...post,
        is_liked: was,
        like_count: post.like_count,
      });
      toggleTimelineLike(post.id);
    }
  }, [post, setPost, toggleTimelineLike]);

  const handleDeletePost = useCallback(async () => {
    if (!post) return;
    Alert.alert('Delete Post', 'Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePost(post.id);
            removeFromTimeline(post.id);
            navigation.goBack();
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  }, [post, navigation, removeFromTimeline]);

  const handleSendComment = async () => {
    if (!commentText.trim() || sending) return;
    setSending(true);
    try {
      const c = await createComment(postId, commentText.trim());
      addComment(c);
      setCommentText('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setSending(false);
  };

  const handleDeleteComment = (commentId: string) => {
    Alert.alert('Delete Comment', 'Are you sure?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteComment(commentId);
            removeComment(commentId);
          } catch (e: any) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const navigateToProfile = (username: string) => {
    navigation.navigate('Profile', {username});
  };

  const renderHeader = () =>
    post ? (
      <PostCard
        post={post}
        onAuthorPress={() => navigateToProfile(post.author.username)}
        onLike={handleLike}
        onDelete={
          currentUser?.id === post.author.id ? handleDeletePost : undefined
        }
        onTagPress={tag =>
          navigation.getParent()?.navigate('ExploreTab', {
            screen: 'TagPosts',
            params: {tagName: tag},
          })
        }
      />
    ) : null;

  const renderComment = ({item}: {item: Comment}) => (
    <CommentItem
      comment={item}
      onAuthorPress={() => navigateToProfile(item.author.username)}
      onDelete={
        currentUser?.id === item.author.id
          ? () => handleDeleteComment(item.id)
          : undefined
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
    <KeyboardAvoidingView
      style={[styles.flex, {backgroundColor: c.bgPrimary}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={88}>
      <FlatList
        data={comments}
        keyExtractor={item => item.id}
        renderItem={renderComment}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="comment-outline"
              title="No comments yet"
              subtitle="Be the first to comment"
            />
          ) : null
        }
        onEndReached={() => {
          if (commentsHasMore) fetchComments(false);
        }}
        onEndReachedThreshold={0.5}
      />

      {/* Comment input bar */}
      <View
        style={[
          styles.composerShell,
          {
            backgroundColor: c.bgPrimary,
            borderTopColor: c.border,
          },
        ]}>
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: c.bgSecondary,
              borderColor: c.borderStrong,
            },
          ]}>
          <TextInput
            style={[
              styles.commentInput,
              {color: c.textPrimary},
            ]}
            placeholder="Write a comment..."
            placeholderTextColor={c.textMuted}
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={2000}
            accessibilityLabel="Comment input"
          />
          <TouchableOpacity
            onPress={handleSendComment}
            disabled={!commentText.trim() || sending}
            style={[
              styles.sendBtn,
              {
                backgroundColor: commentText.trim() ? c.accent : c.bgTertiary,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Send comment">
            <Icon
              name="send"
              size={18}
              color={commentText.trim() ? c.accentText : c.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  composerShell: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.body,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
