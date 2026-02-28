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
import {likePost, unlikePost} from '../../api/likes';
import {useSyncLikes} from '../../hooks/useSyncLikes';
import {usePostsStore} from '../../stores/postsStore';
import {useColors} from '../../theme';
import {PAGINATION_LIMIT} from '../../config';
import type {Post} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ExploreStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<ExploreStackParamList, 'TagPosts'>;

export default function TagPostsScreen({route, navigation}: Props) {
  const {tagName} = route.params;
  const c = useColors();
  const cacheLike = usePostsStore(s => s.cacheLike);

  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Sync like states from global cache on focus
  useSyncLikes(setPosts);

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
      } catch {}
      setLoading(false);
    },
    [tagName, page, hasMore, loading],
  );

  useEffect(() => {
    fetch(true);
  }, []);

  const toggleLike = useCallback(async (post: Post) => {
    const was = post.is_liked;
    const newLiked = !was;
    const newCount = post.like_count + (was ? -1 : 1);
    setPosts(prev =>
      prev.map(p =>
        p.id === post.id ? {...p, is_liked: newLiked, like_count: newCount} : p,
      ),
    );
    cacheLike(post.id, newLiked, newCount);
    try {
      was ? await unlikePost(post.id) : await likePost(post.id);
    } catch {
      setPosts(prev =>
        prev.map(p =>
          p.id === post.id ? {...p, is_liked: was, like_count: post.like_count} : p,
        ),
      );
      cacheLike(post.id, was, post.like_count);
    }
  }, [cacheLike]);

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <PostCard
            post={item}
            onPress={() =>
              (navigation as any).navigate('PostDetail', {postId: item.id})
            }
            onAuthorPress={() =>
              navigation.navigate('Profile', {username: item.author.username})
            }
            onLike={() => toggleLike(item)}
            onComment={() =>
              (navigation as any).navigate('PostDetail', {postId: item.id})
            }
          />
        )}
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
            <ActivityIndicator style={{paddingVertical: 20}} size="small" />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
});
