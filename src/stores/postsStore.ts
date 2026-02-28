import {create} from 'zustand';
import type {Post} from '../types';
import * as api from '../api';
import {PAGINATION_LIMIT} from '../config';

interface LikeState {
  is_liked: boolean;
  like_count: number;
}

interface PostsState {
  timeline: Post[];
  timelinePage: number;
  timelineHasMore: boolean;
  isLoading: boolean;
  likeCache: Record<string, LikeState>;
  fetchTimeline(reset?: boolean): Promise<void>;
  prependPost(post: Post): void;
  removePost(id: string): void;
  toggleLike(id: string): void;
  cacheLike(id: string, is_liked: boolean, like_count: number): void;
  applyLikeCache(posts: Post[]): Post[];
  updatePost(id: string, updates: Partial<Post>): void;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  timeline: [],
  timelinePage: 1,
  timelineHasMore: true,
  isLoading: false,
  likeCache: {},

  async fetchTimeline(reset = false) {
    const state = get();
    if (state.isLoading) return;
    if (!reset && !state.timelineHasMore) return;

    const page = reset ? 1 : state.timelinePage;
    set({isLoading: true});

    try {
      const res = await api.getTimeline(page, PAGINATION_LIMIT);
      const posts = res.data ?? [];
      // Populate likeCache from fetched posts
      const newCache = {...get().likeCache};
      posts.forEach(p => {
        newCache[p.id] = {is_liked: p.is_liked, like_count: p.like_count};
      });
      set({
        timeline: reset ? posts : [...state.timeline, ...posts],
        timelinePage: page + 1,
        timelineHasMore: posts.length === PAGINATION_LIMIT,
        isLoading: false,
        likeCache: newCache,
      });
    } catch {
      set({isLoading: false});
    }
  },

  prependPost(post: Post) {
    set(s => ({
      timeline: [post, ...s.timeline],
      likeCache: {
        ...s.likeCache,
        [post.id]: {is_liked: post.is_liked, like_count: post.like_count},
      },
    }));
  },

  removePost(id: string) {
    set(s => ({timeline: s.timeline.filter(p => p.id !== id)}));
  },

  toggleLike(id: string) {
    const state = get();
    const cached = state.likeCache[id];
    const wasLiked = cached ? cached.is_liked : state.timeline.find(p => p.id === id)?.is_liked ?? false;
    const wasCount = cached ? cached.like_count : state.timeline.find(p => p.id === id)?.like_count ?? 0;
    const newLiked = !wasLiked;
    const newCount = wasCount + (newLiked ? 1 : -1);

    // Update timeline + cache
    set(s => ({
      timeline: s.timeline.map(p =>
        p.id !== id ? p : {...p, is_liked: newLiked, like_count: newCount},
      ),
      likeCache: {...s.likeCache, [id]: {is_liked: newLiked, like_count: newCount}},
    }));

    // Fire-and-forget API call; revert on error
    const apiCall = newLiked ? api.likePost : api.unlikePost;
    apiCall(id).catch(() => {
      set(s => ({
        timeline: s.timeline.map(p =>
          p.id !== id ? p : {...p, is_liked: wasLiked, like_count: wasCount},
        ),
        likeCache: {...s.likeCache, [id]: {is_liked: wasLiked, like_count: wasCount}},
      }));
    });
  },

  // Write like state to global cache + update timeline if present
  cacheLike(id: string, is_liked: boolean, like_count: number) {
    set(s => ({
      timeline: s.timeline.map(p =>
        p.id !== id ? p : {...p, is_liked, like_count},
      ),
      likeCache: {...s.likeCache, [id]: {is_liked, like_count}},
    }));
  },

  // Apply cached like states to an array of posts
  applyLikeCache(posts: Post[]): Post[] {
    const cache = get().likeCache;
    let changed = false;
    const result = posts.map(p => {
      const c = cache[p.id];
      if (c && (c.is_liked !== p.is_liked || c.like_count !== p.like_count)) {
        changed = true;
        return {...p, ...c};
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
