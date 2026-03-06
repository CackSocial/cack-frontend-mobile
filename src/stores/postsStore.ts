import {Alert} from 'react-native';
import {create} from 'zustand';
import type {Post} from '../types';
import * as api from '../api';
import {PAGINATION_LIMIT} from '../config';
import {logError} from '../utils/log';
import {findPostById, updatePostsById} from '../utils/posts';

/** Cached post metadata kept in sync across all screens */
interface CachedPostState {
  is_liked: boolean;
  like_count: number;
  comment_count: number;
  is_bookmarked: boolean;
  is_reposted: boolean;
  repost_count: number;
}

interface PostsState {
  timeline: Post[];
  timelinePage: number;
  timelineHasMore: boolean;
  isLoading: boolean;
  postCache: Record<string, CachedPostState>;
  fetchTimeline(reset?: boolean): Promise<void>;
  prependPost(post: Post): void;
  removePost(id: string): void;
  toggleLike(id: string): void;
  toggleBookmark(id: string): void;
  toggleRepost(id: string): void;
  cachePost(id: string, meta: Partial<CachedPostState>): void;
  applyPostCache(posts: Post[]): Post[];
  updatePost(id: string, updates: Partial<Post>): void;
}

type PostsSnapshot = Pick<PostsState, 'timeline' | 'postCache'>;

function buildCachedPostState(
  patch: Partial<CachedPostState> = {},
  cached?: Partial<CachedPostState>,
  post?: Post,
): CachedPostState {
  return {
    is_liked: patch.is_liked ?? cached?.is_liked ?? post?.is_liked ?? false,
    like_count: patch.like_count ?? cached?.like_count ?? post?.like_count ?? 0,
    comment_count:
      patch.comment_count ?? cached?.comment_count ?? post?.comment_count ?? 0,
    is_bookmarked:
      patch.is_bookmarked
      ?? cached?.is_bookmarked
      ?? post?.is_bookmarked
      ?? false,
    is_reposted:
      patch.is_reposted ?? cached?.is_reposted ?? post?.is_reposted ?? false,
    repost_count:
      patch.repost_count ?? cached?.repost_count ?? post?.repost_count ?? 0,
  };
}

function getCachedState(snapshot: PostsSnapshot, id: string): CachedPostState {
  return buildCachedPostState(
    {},
    snapshot.postCache[id],
    findPostById(snapshot.timeline, id),
  );
}

function applyCachedState(
  snapshot: PostsSnapshot,
  id: string,
  cachedState: CachedPostState,
) {
  return {
    timeline: updatePostsById(snapshot.timeline, id, cachedState),
    postCache: {
      ...snapshot.postCache,
      [id]: cachedState,
    },
  };
}

function cacheTimelinePosts(
  postCache: Record<string, CachedPostState>,
  posts: Post[],
) {
  return posts.reduce<Record<string, CachedPostState>>((nextCache, post) => {
    nextCache[post.id] = buildCachedPostState({}, nextCache[post.id], post);
    return nextCache;
  }, {...postCache});
}

function hasCachedStateDiff(post: Post, cachedState: CachedPostState): boolean {
  return (
    cachedState.is_liked !== post.is_liked
    || cachedState.like_count !== post.like_count
    || cachedState.comment_count !== post.comment_count
    || cachedState.is_bookmarked !== post.is_bookmarked
    || cachedState.is_reposted !== post.is_reposted
    || cachedState.repost_count !== post.repost_count
  );
}

export const usePostsStore = create<PostsState>((set, get) => ({
  timeline: [],
  timelinePage: 1,
  timelineHasMore: true,
  isLoading: false,
  postCache: {},

  async fetchTimeline(reset = false) {
    const state = get();
    if (state.isLoading) return;
    if (!reset && !state.timelineHasMore) return;

    const page = reset ? 1 : state.timelinePage;
    set({isLoading: true});

    try {
      const res = await api.getTimeline(page, PAGINATION_LIMIT);
      const posts = res.data ?? [];

      set(current => {
        const existing = reset ? [] : current.timeline;
        const existingIds = new Set(existing.map(post => post.id));
        const deduped = posts.filter(post => !existingIds.has(post.id));

        return {
          timeline: reset ? posts : [...existing, ...deduped],
          timelinePage: page + 1,
          timelineHasMore: posts.length === PAGINATION_LIMIT,
          isLoading: false,
          postCache: cacheTimelinePosts(current.postCache, posts),
        };
      });
    } catch (error: unknown) {
      logError('fetchTimeline', error);
      set({isLoading: false});
    }
  },

  prependPost(post: Post) {
    set(current => ({
      timeline: current.timeline.some(existing => existing.id === post.id)
        ? current.timeline
        : [post, ...current.timeline],
      postCache: {
        ...current.postCache,
        [post.id]: buildCachedPostState({}, current.postCache[post.id], post),
      },
    }));
  },

  removePost(id: string) {
    set(current => ({timeline: current.timeline.filter(post => post.id !== id)}));
  },

  toggleLike(id: string) {
    const currentState = get();
    const previous = getCachedState(currentState, id);
    const next = buildCachedPostState(
      {
        is_liked: !previous.is_liked,
        like_count: previous.like_count + (!previous.is_liked ? 1 : -1),
      },
      previous,
    );

    set(current => applyCachedState(current, id, next));

    const request = next.is_liked ? api.likePost : api.unlikePost;
    request(id).catch((error: unknown) => {
      logError('toggleLike', error);
      set(current => applyCachedState(current, id, previous));
    });
  },

  toggleBookmark(id: string) {
    const currentState = get();
    const previous = getCachedState(currentState, id);
    const next = buildCachedPostState(
      {
        is_bookmarked: !previous.is_bookmarked,
      },
      previous,
    );

    set(current => applyCachedState(current, id, next));

    const request = next.is_bookmarked ? api.bookmarkPost : api.unbookmarkPost;
    request(id).catch((error: unknown) => {
      logError('toggleBookmark', error);
      set(current => applyCachedState(current, id, previous));
    });
  },

  toggleRepost(id: string) {
    const currentState = get();
    const previous = getCachedState(currentState, id);
    const next = buildCachedPostState(
      {
        is_reposted: !previous.is_reposted,
        repost_count:
          previous.repost_count + (!previous.is_reposted ? 1 : -1),
      },
      previous,
    );

    set(current => applyCachedState(current, id, next));

    const request = next.is_reposted ? api.repost : api.deleteRepost;
    request(id).catch((error: unknown) => {
      logError('toggleRepost', error);
      Alert.alert(
        'Error',
        next.is_reposted
          ? 'Failed to repost.'
          : 'Failed to remove repost. Please try again.',
      );
      set(current => applyCachedState(current, id, previous));
    });
  },

  cachePost(id: string, meta: Partial<CachedPostState>) {
    set(current => {
      const merged = buildCachedPostState(
        meta,
        current.postCache[id],
        findPostById(current.timeline, id),
      );
      return applyCachedState(current, id, merged);
    });
  },

  applyPostCache(posts: Post[]): Post[] {
    const {postCache} = get();
    let changed = false;

    const nextPosts = posts.map(post => {
      let nextPost = post;
      const cachedPost = postCache[post.id];

      if (cachedPost && hasCachedStateDiff(post, cachedPost)) {
        changed = true;
        nextPost = {...nextPost, ...cachedPost};
      }

      if (post.original_post) {
        const cachedOriginal = postCache[post.original_post.id];
        if (cachedOriginal && hasCachedStateDiff(post.original_post, cachedOriginal)) {
          changed = true;
          nextPost = {
            ...nextPost,
            original_post: {...post.original_post, ...cachedOriginal},
          };
        }
      }

      return nextPost;
    });

    return changed ? nextPosts : posts;
  },

  updatePost(id: string, updates: Partial<Post>) {
    set(current => ({
      timeline: updatePostsById(current.timeline, id, updates),
    }));
  },
}));
