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

  const navigateToPost = (post: Post) => {
    navigation.navigate('PostDetail', {postId: post.id});
  };

  const navigateToProfile = (username: string) => {
    navigation.navigate('Profile', {username});
  };

  const renderPost = ({item}: {item: Post}) => (
    <PostCard
      post={item}
      onPress={() => navigateToPost(item)}
      onAuthorPress={() => navigateToProfile(item.author.username)}
      onLike={() => toggleLike(item.id)}
      onComment={() => navigateToPost(item)}
      onTagPress={tag =>
        navigation.getParent()?.navigate('ExploreTab', {
          screen: 'TagPosts',
          params: {tagName: tag},
        })
      }
    />
  );

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

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, {backgroundColor: c.accent}]}
        onPress={() => navigation.navigate('CreatePost')}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Create new post">
        <Icon name="plus" size={28} color={c.accentText} />
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
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
