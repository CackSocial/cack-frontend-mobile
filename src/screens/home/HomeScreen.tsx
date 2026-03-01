import React, {useEffect, useCallback} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PostCard from '../../components/post/PostCard';
import EmptyState from '../../components/common/EmptyState';
import {usePostsStore} from '../../stores/postsStore';
import {useColors} from '../../theme';
import type {Post} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export default function HomeScreen({navigation}: Props) {
  const c = useColors();
  const {timeline, isLoading, timelineHasMore, fetchTimeline} =
    usePostsStore();
  const toggleLike = usePostsStore(s => s.toggleLike);
  const toggleBookmark = usePostsStore(s => s.toggleBookmark);
  const toggleRepost = usePostsStore(s => s.toggleRepost);

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

  const navigateToPost = useCallback((post: Post) => {
    navigation.navigate('PostDetail', {postId: post.id});
  }, [navigation]);

  const navigateToProfile = useCallback((username: string) => {
    navigation.navigate('Profile', {username});
  }, [navigation]);

  const handleTagPress = useCallback((tag: string) => {
    navigation.getParent()?.navigate('ExploreTab', {
      screen: 'TagPosts',
      params: {tagName: tag},
      initial: false,
    });
  }, [navigation]);

  const renderPost = useCallback(({item}: {item: Post}) => (
    <PostCard
      post={item}
      onPress={() => navigateToPost(item)}
      onAuthorPress={() => navigateToProfile(item.author.username)}
      onLike={() => toggleLike(item.id)}
      onComment={() => navigateToPost(item)}
      onBookmark={() => toggleBookmark(item.id)}
      onRepost={() => toggleRepost(item.id)}
      onQuote={() => navigation.navigate('QuotePost', {post: item})}
      onTagPress={handleTagPress}
      onMentionPress={username => navigateToProfile(username)}
      onOriginalPostPress={
        item.original_post
          ? () => navigation.navigate('PostDetail', {postId: item.original_post!.id})
          : undefined
      }
    />
  ), [navigateToPost, navigateToProfile, toggleLike, toggleBookmark, toggleRepost, handleTagPress, navigation]);

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}>
      <FlatList
        data={timeline}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        refreshControl={
          <RefreshControl refreshing={isLoading && timeline.length > 0} onRefresh={handleRefresh} />
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="account-group-outline"
              title="Your timeline is empty"
              subtitle="Follow some people to see their posts"
            />
          ) : null
        }
        ListFooterComponent={
          isLoading && timeline.length > 0 ? (
            <ActivityIndicator style={styles.loader} size="small" />
          ) : null
        }
      />
      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, {backgroundColor: c.accent}]}
        onPress={() => navigation.navigate('CreatePost')}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Create new post">
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    paddingVertical: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 72,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
