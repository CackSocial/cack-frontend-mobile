import React, {useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Avatar from '../../components/common/Avatar';
import PostCard from '../../components/post/PostCard';
import EmptyState from '../../components/common/EmptyState';
import {usePostsStore} from '../../stores/postsStore';
import {useAuthStore} from '../../stores/authStore';
import {useColors, fonts} from '../../theme';
import type {Post} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export default function HomeScreen({navigation}: Props) {
  const c = useColors();
  const currentUser = useAuthStore(s => s.user);
  const {timeline, isLoading, timelineHasMore, fetchTimeline} =
    usePostsStore();
  const toggleLike = usePostsStore(s => s.toggleLike);

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
    });
  }, [navigation]);

  const renderPost = useCallback(({item}: {item: Post}) => (
    <PostCard
      post={item}
      onPress={() => navigateToPost(item)}
      onAuthorPress={() => navigateToProfile(item.author.username)}
      onLike={() => toggleLike(item.id)}
      onComment={() => navigateToPost(item)}
      onTagPress={handleTagPress}
    />
  ), [navigateToPost, navigateToProfile, toggleLike, handleTagPress]);

  const renderHeader = useCallback(() => (
    <TouchableOpacity
      style={[styles.composerBar, {borderBottomColor: c.border}]}
      onPress={() => navigation.navigate('CreatePost')}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Create new post">
      <Avatar
        uri={currentUser?.avatar_url}
        name={currentUser?.display_name ?? ''}
        size={36}
      />
      <Text style={[styles.composerPlaceholder, {color: c.textMuted}]}>
        What's on your mind?
      </Text>
    </TouchableOpacity>
  ), [c, currentUser, navigation]);

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}>
      <FlatList
        data={timeline}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        ListHeaderComponent={renderHeader}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  composerPlaceholder: {
    flex: 1,
    fontSize: 15,
    fontFamily: fonts.body,
  },
  loader: {
    paddingVertical: 20,
  },
});
