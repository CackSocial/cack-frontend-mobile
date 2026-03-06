import React, {useEffect, useCallback, useMemo, useState} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import PostCard from '../../components/post/PostCard';
import PostComposer from '../../components/post/PostComposer';
import EmptyState from '../../components/common/EmptyState';
import {createPost} from '../../api/posts';
import {usePostsStore} from '../../stores/postsStore';
import {useColors, layout, spacing} from '../../theme';
import {getErrorMessage} from '../../utils/log';
import {sharedStyles} from '../../styles/shared';
import type {Post, ImageAsset} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export default function HomeScreen({navigation}: Props) {
  const c = useColors();
  const {timeline, isLoading, timelineHasMore, fetchTimeline, prependPost} = usePostsStore();
  const toggleLike = usePostsStore(s => s.toggleLike);
  const toggleBookmark = usePostsStore(s => s.toggleBookmark);
  const toggleRepost = usePostsStore(s => s.toggleRepost);
  const [composerLoading, setComposerLoading] = useState(false);

  useEffect(() => {
    fetchTimeline(true);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchTimeline(true);
  }, [fetchTimeline]);

  const handleEndReached = useCallback(() => {
    if (timelineHasMore && !isLoading) {
      fetchTimeline(false);
    }
  }, [timelineHasMore, isLoading, fetchTimeline]);

  const handleCreatePost = useCallback(async (content: string, image?: ImageAsset) => {
    setComposerLoading(true);
    try {
      const post = await createPost(content, image);
      prependPost(post);
    } catch (e: unknown) {
      Alert.alert('Error', getErrorMessage(e));
      throw e;
    } finally {
      setComposerLoading(false);
    }
  }, [prependPost]);

  const handleTagPress = useCallback(
    (tag: string) => {
      navigation.getParent()?.navigate('ExploreTab', {
        screen: 'TagPosts',
        params: {tagName: tag},
        initial: false,
      });
    },
    [navigation],
  );

  const renderHeader = useMemo(
    () => (
      <View style={styles.composerWrap}>
        <PostComposer
          onSubmit={handleCreatePost}
          loading={composerLoading}
          compact
        />
      </View>
    ),
    [composerLoading, handleCreatePost],
  );

  const renderPost = useCallback(
    ({item}: {item: Post}) => {
      const actionTarget = item.post_type === 'repost' && item.original_post ? item.original_post : item;
      return (
        <PostCard
          post={item}
          onPress={() => navigation.navigate('PostDetail', {postId: actionTarget.id})}
          onAuthorPress={() =>
            navigation.navigate('Profile', {username: actionTarget.author.username})
          }
          onLike={() => toggleLike(actionTarget.id)}
          onComment={() => navigation.navigate('PostDetail', {postId: actionTarget.id})}
          onBookmark={() => toggleBookmark(actionTarget.id)}
          onRepost={() => toggleRepost(actionTarget.id)}
          onQuote={() => navigation.navigate('QuotePost', {post: actionTarget})}
          onTagPress={handleTagPress}
          onMentionPress={username => navigation.navigate('Profile', {username})}
          onOriginalPostPress={
            item.original_post
              ? () => navigation.navigate('PostDetail', {postId: item.original_post!.id})
              : undefined
          }
        />
      );
    },
    [handleTagPress, navigation, toggleBookmark, toggleLike, toggleRepost],
  );

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}> 
      <FlatList
        data={timeline}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={sharedStyles.paddedListContent}
        refreshControl={
          <RefreshControl refreshing={isLoading && timeline.length > 0} onRefresh={handleRefresh} />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? <EmptyState icon="file-document-outline" title="No posts yet" /> : null
        }
        ListFooterComponent={
          isLoading && timeline.length > 0 ? (
            <ActivityIndicator style={sharedStyles.listLoader} size="small" />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  composerWrap: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing[4],
  },
});
