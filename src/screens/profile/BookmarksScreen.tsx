import React, {useEffect, useCallback} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import PostCard from '../../components/post/PostCard';
import EmptyState from '../../components/common/EmptyState';
import {getBookmarks} from '../../api/bookmarks';
import {useSyncLikes} from '../../hooks/useSyncLikes';
import {useOptimisticLike} from '../../hooks/useOptimisticLike';
import {useOptimisticBookmark} from '../../hooks/useOptimisticBookmark';
import {useOptimisticRepost} from '../../hooks/useOptimisticRepost';
import {useColors} from '../../theme';
import {sharedStyles} from '../../styles/shared';
import type {Post} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '../../navigation/types';
import {usePaginatedFetch} from '../../hooks/usePaginatedFetch';
import {usePostCardActions} from '../../hooks/usePostCardActions';
import {resolveActionTarget} from '../../utils/posts';
import {applyStateUpdate} from '../../utils/state';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Bookmarks'>;

export default function BookmarksScreen({navigation}: Props) {
  const c = useColors();
  const fetchBookmarksPage = useCallback(async (page: number, limit: number) => {
    const res = await getBookmarks(page, limit);
    return res.data ?? [];
  }, []);
  const {
    items: posts,
    setItems: setPosts,
    loading,
    hasMore,
    refresh,
    loadMore,
  } = usePaginatedFetch<Post>({
    fetchPage: fetchBookmarksPage,
    errorContext: 'BookmarksScreen:fetch',
  });

  useSyncLikes(setPosts);

  // REFACTORED: Uses shared useOptimisticLike hook instead of inline implementation
  const handleLike = useOptimisticLike(setPosts);
  const handleBookmarkPosts = useCallback(
    (updater: React.SetStateAction<Post[]>) => {
      setPosts(current =>
        applyStateUpdate(current, updater).filter(
          post => resolveActionTarget(post).is_bookmarked,
        ),
      );
    },
    [setPosts],
  );
  const handleBookmark = useOptimisticBookmark(handleBookmarkPosts);
  const handleRepost = useOptimisticRepost(setPosts);
  const getPostCardActions = usePostCardActions({
    navigation,
    onLike: post => handleLike(post),
    onBookmark: post => handleBookmark(post),
    onRepost: post => handleRepost(post),
  });

  useEffect(() => {
    refresh();
  }, [refresh]);

  const renderPost = useCallback(
    ({item}: {item: Post}) => {
      return (
        <PostCard post={item} {...getPostCardActions(item)} />
      );
    },
    [getPostCardActions],
  );

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        contentContainerStyle={sharedStyles.paddedListContent}
        refreshControl={
          <RefreshControl
            refreshing={loading && posts.length > 0}
            onRefresh={refresh}
          />
        }
        onEndReached={() => {
          if (hasMore) loadMore();
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading ? <EmptyState icon="bookmark-outline" title="No bookmarks yet" /> : null
        }
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
