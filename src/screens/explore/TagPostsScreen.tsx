import React, {useEffect, useState, useCallback} from 'react';
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
import {PAGINATION_LIMIT} from '../../config';
import {logError} from '../../utils/log';
import {sharedStyles} from '../../styles/shared';
import type {Post} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ExploreStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<ExploreStackParamList, 'TagPosts'>;

export default function TagPostsScreen({route, navigation}: Props) {
  const {tagName} = route.params;
  const c = useColors();

  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Sync like states from global cache on focus
  useSyncLikes(setPosts);

  // REFACTORED: Uses shared useOptimisticLike hook instead of inline implementation
  const toggleLike = useOptimisticLike(setPosts);
  const toggleBookmark = useOptimisticBookmark(setPosts);
  const toggleRepost = useOptimisticRepost(setPosts);

  const fetch = useCallback(
    async (reset = false) => {
      if (loading) return;
      const p = reset ? 1 : page;
      if (!reset && !hasMore) return;

      setLoading(true);
      try {
        const res = await getTagPosts(tagName, p, PAGINATION_LIMIT);
        const data = res.data ?? [];
        setPosts(prev => (reset ? data : [...prev, ...data]));
        setPage(p + 1);
        setHasMore(data.length === PAGINATION_LIMIT);
      } catch (e) {
        logError('TagPostsScreen:fetch', e);
      }
      setLoading(false);
    },
    [tagName, page, hasMore, loading],
  );

  useEffect(() => {
    fetch(true);
  }, []);

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({item}) => {
          const actionTarget = item.post_type === 'repost' && item.original_post ? item.original_post : item;
          return (
            <PostCard
              post={item}
              onPress={() =>
                navigation.navigate('PostDetail', {postId: actionTarget.id})
              }
              onAuthorPress={() =>
                navigation.navigate('Profile', {username: item.author.username})
              }
              onLike={() => toggleLike(item)}
              onComment={() =>
                navigation.navigate('PostDetail', {postId: actionTarget.id})
              }
              onBookmark={() => toggleBookmark(item)}
              onRepost={() => toggleRepost(item)}
              onQuote={() => navigation.navigate('QuotePost', {post: actionTarget})}
              onMentionPress={username =>
                navigation.navigate('Profile', {username})
              }
              onOriginalPostPress={
                item.original_post
                  ? () => navigation.navigate('PostDetail', {postId: item.original_post!.id})
                  : undefined
              }
            />
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="tag-outline"
              title={`No posts for #${tagName}`}
            />
          ) : null
        }
        onEndReached={() => {
          if (hasMore) fetch(false);
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
