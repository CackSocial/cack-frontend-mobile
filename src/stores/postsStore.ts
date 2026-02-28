import {create} from 'zustand';
import type {Post} from '../types';
import * as api from '../api';
import {PAGINATION_LIMIT} from '../config';
import {logError} from '../utils/log';

/** Cached post metadata kept in sync across all screens */
interface CachedPostState {
  is_liked: boolean;
  like_count: number;
  comment_count: number;
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
  cachePost(id: string, meta: Partial<CachedPostState>): void;
  applyPostCache(posts: Post[]): Post[];
  updatePost(id: string, updates: Partial<Post>): void;
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
      const newCache = {...get().postCache};
      posts.forEach(p => {
        newCache[p.id] = {
          is_liked: p.is_liked,
          like_count: p.like_count,
          comment_count: p.comment_count,
        };
      });
      set({
        timeline: reset ? posts : [...state.timeline, ...posts],
        timelinePage: page + 1,
        timelineHasMore: posts.length === PAGINATION_LIMIT,
        isLoading: false,
        postCache: newCache,
      });
    } catch (e) {
      logError('fetchTimeline', e);
      set({isLoading: false});
    }
  },

  prependPost(post: Post) {
    set(s => ({
      timeline: [post, ...s.timeline],
      postCache: {
        ...s.postCache,
        [post.id]: {
          is_liked: post.is_liked,
          like_count: post.like_count,
          comment_count: post.comment_count,
        },
      },
    }));
  },

  removePost(id: string) {
    set(s => ({timeline: s.timeline.filter(p => p.id !== id)}));
  },

  toggleLike(id: string) {
    const state = get();
    const cached = state.postCache[id];
    const post = state.timeline.find(p => p.id === id);
    const wasLiked = cached?.is_liked ?? post?.is_liked ?? false;
    const wasCount = cached?.like_count ?? post?.like_count ?? 0;
    const commentCount = cached?.comment_count ?? post?.comment_count ?? 0;
    const newLiked = !wasLiked;
    const newCount = wasCount + (newLiked ? 1 : -1);

    set(s => ({
      timeline: s.timeline.map(p =>
        p.id !== id ? p : {...p, is_liked: newLiked, like_count: newCount},
      ),
      postCache: {
        ...s.postCache,
        [id]: {is_liked: newLiked, like_count: newCount, comment_count: commentCount},
      },
    }));

    const apiCall = newLiked ? api.likePost : api.unlikePost;
    apiCall(id).catch(e => {
      logError('toggleLike', e);
      set(s => ({
        timeline: s.timeline.map(p =>
          p.id !== id ? p : {...p, is_liked: wasLiked, like_count: wasCount},
        ),
        postCache: {
          ...s.postCache,
          [id]: {is_liked: wasLiked, like_count: wasCount, comment_count: commentCount},
        },
      }));
    });
  },

  // Write post metadata to global cache + update timeline if present
  cachePost(id: string, meta: Partial<CachedPostState>) {
    set(s => {
      const prev = s.postCache[id];
      const post = s.timeline.find(p => p.id === id);
      const merged: CachedPostState = {
        is_liked: meta.is_liked ?? prev?.is_liked ?? post?.is_liked ?? false,
        like_count: meta.like_count ?? prev?.like_count ?? post?.like_count ?? 0,
        comment_count: meta.comment_count ?? prev?.comment_count ?? post?.comment_count ?? 0,
      };
      return {
        timeline: s.timeline.map(p =>
          p.id !== id ? p : {...p, ...merged},
        ),
        postCache: {...s.postCache, [id]: merged},
      };
    });
  },

  // Apply cached post states to an array of posts
  applyPostCache(posts: Post[]): Post[] {
    const cache = get().postCache;
    let changed = false;
    const result = posts.map(p => {
      const c = cache[p.id];
      if (!c) return p;
      if (
        c.is_liked !== p.is_liked ||
        c.like_count !== p.like_count ||
        c.comment_count !== p.comment_count
      ) {
        changed = true;
        return {...p, is_liked: c.is_liked, like_count: c.like_count, comment_count: c.comment_count};
      }
      return p;
    });
    return changed ? result : posts;
  },

  updatePost(id: string, updates: Partial<Post>) {
    set(s => ({
      timeline: s.timeline.map(p => (p.id === id ? {...p, ...updates} : p)),
    }));
  },
}));
