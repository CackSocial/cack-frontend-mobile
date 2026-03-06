import React, {useEffect, useCallback} from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import PostCard from '../../components/post/PostCard';
import EmptyState from '../../components/common/EmptyState';
import {getTagPosts} from '../../api/tags';
import {useSyncLikes} from '../../hooks/useSyncLikes';
import {useOptimisticLike} from '../../hooks/useOptimisticLike';
import {useOptimisticBookmark} from '../../hooks/useOptimisticBookmark';
import {useOptimisticRepost} from '../../hooks/useOptimisticRepost';
import {useColors} from '../../theme';
import {sharedStyles} from '../../styles/shared';
import type {Post} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ExploreStackParamList} from '../../navigation/types';
import {usePaginatedFetch} from '../../hooks/usePaginatedFetch';
import {usePostCardActions} from '../../hooks/usePostCardActions';

type Props = NativeStackScreenProps<ExploreStackParamList, 'TagPosts'>;

export default function TagPostsScreen({route, navigation}: Props) {
  const {tagName} = route.params;
  const c = useColors();
  const fetchTagPostsPage = useCallback(
    async (page: number, limit: number) => {
      const res = await getTagPosts(tagName, page, limit);
      return res.data ?? [];
    },
    [tagName],
  );
  const {
    items: posts,
    setItems: setPosts,
    loading,
    hasMore,
    refresh,
    loadMore,
  } = usePaginatedFetch<Post>({
    fetchPage: fetchTagPostsPage,
    errorContext: 'TagPostsScreen:fetch',
  });

  // Sync like states from global cache on focus
  useSyncLikes(setPosts);

  // REFACTORED: Uses shared useOptimisticLike hook instead of inline implementation
  const toggleLike = useOptimisticLike(setPosts);
  const toggleBookmark = useOptimisticBookmark(setPosts);
  const toggleRepost = useOptimisticRepost(setPosts);
  const getPostCardActions = usePostCardActions({
    navigation,
    onLike: post => toggleLike(post),
    onBookmark: post => toggleBookmark(post),
    onRepost: post => toggleRepost(post),
  });

  useEffect(() => {
    refresh();
  }, [refresh]);

  const renderPost = useCallback(
    ({item}: {item: Post}) => (
      <PostCard post={item} {...getPostCardActions(item)} />
    ),
    [getPostCardActions],
  );

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        contentContainerStyle={sharedStyles.paddedListContent}
        renderItem={renderPost}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="tag-outline"
              title={`No posts for #${tagName}`}
            />
          ) : null
        }
        onEndReached={() => {
          if (hasMore) loadMore();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator style={sharedStyles.listLoader} size="small" />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
});
