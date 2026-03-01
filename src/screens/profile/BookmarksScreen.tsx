import React, {useState, useEffect, useCallback} from 'react';
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
import {PAGINATION_LIMIT} from '../../config';
import {logError} from '../../utils/log';
import {sharedStyles} from '../../styles/shared';
import type {Post} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Bookmarks'>;

export default function BookmarksScreen({navigation}: Props) {
  const c = useColors();
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useSyncLikes(setPosts);

  // REFACTORED: Uses shared useOptimisticLike hook instead of inline implementation
  const handleLike = useOptimisticLike(setPosts);
  const handleBookmark = useOptimisticBookmark(setPosts);
  const handleRepost = useOptimisticRepost(setPosts);

  const fetchBookmarks = useCallback(
    async (reset = false) => {
      if (loading) return;
      const p = reset ? 1 : page;
      if (!reset && !hasMore) return;
      setLoading(true);
      try {
        const res = await getBookmarks(p, PAGINATION_LIMIT);
        const items = res.data ?? [];
        setPosts(prev => (reset ? items : [...prev, ...items]));
        setPage(p + 1);
        setHasMore(items.length === PAGINATION_LIMIT);
      } catch (e: unknown) {
        logError('BookmarksScreen:fetch', e);
      }
      setLoading(false);
    },
    [page, hasMore, loading],
  );

  useEffect(() => {
    fetchBookmarks(true);
  }, []);

  const renderPost = useCallback(
    ({item}: {item: Post}) => (
      <PostCard
        post={item}
        onPress={() => navigation.navigate('PostDetail', {postId: item.id})}
        onAuthorPress={() =>
          navigation.navigate('Profile', {username: item.author.username})
        }
        onLike={() => handleLike(item)}
        onComment={() => navigation.navigate('PostDetail', {postId: item.id})}
        onBookmark={() => handleBookmark(item)}
        onRepost={() => handleRepost(item)}
        onQuote={() => navigation.navigate('QuotePost', {post: item})}
        onMentionPress={username =>
          navigation.navigate('Profile', {username})
        }
        onOriginalPostPress={
          item.original_post
            ? () => navigation.navigate('PostDetail', {postId: item.original_post!.id})
            : undefined
        }
      />
    ),
    [navigation, handleLike, handleBookmark, handleRepost],
  );

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        refreshControl={
          <RefreshControl
            refreshing={loading && posts.length > 0}
            onRefresh={() => fetchBookmarks(true)}
          />
        }
        onEndReached={() => {
          if (hasMore) fetchBookmarks(false);
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="bookmark-outline"
              title="No bookmarks yet"
              subtitle="Save posts to find them later"
            />
          ) : null
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
