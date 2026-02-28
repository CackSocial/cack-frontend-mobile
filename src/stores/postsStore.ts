import {create} from 'zustand';
import type {Post} from '../types';
import * as api from '../api';
import {PAGINATION_LIMIT} from '../config';

interface PostsState {
  timeline: Post[];
  timelinePage: number;
  timelineHasMore: boolean;
  isLoading: boolean;
  fetchTimeline(reset?: boolean): Promise<void>;
  prependPost(post: Post): void;
  removePost(id: string): void;
  toggleLike(id: string): void;
  updatePost(id: string, updates: Partial<Post>): void;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  timeline: [],
  timelinePage: 1,
  timelineHasMore: true,
  isLoading: false,

  async fetchTimeline(reset = false) {
    const state = get();
    if (state.isLoading) return;
    if (!reset && !state.timelineHasMore) return;

    const page = reset ? 1 : state.timelinePage;
    set({isLoading: true});

    try {
      const res = await api.getTimeline(page, PAGINATION_LIMIT);
      const posts = res.data ?? [];
      set({
        timeline: reset ? posts : [...state.timeline, ...posts],
        timelinePage: page + 1,
        timelineHasMore: posts.length === PAGINATION_LIMIT,
        isLoading: false,
      });
    } catch {
      set({isLoading: false});
    }
  },

  prependPost(post: Post) {
    set(s => ({timeline: [post, ...s.timeline]}));
  },

  removePost(id: string) {
    set(s => ({timeline: s.timeline.filter(p => p.id !== id)}));
  },

  toggleLike(id: string) {
    set(s => ({
      timeline: s.timeline.map(p => {
        if (p.id !== id) return p;
        const liked = !p.is_liked;
        return {
          ...p,
          is_liked: liked,
          like_count: p.like_count + (liked ? 1 : -1),
        };
      }),
    }));

    // Fire-and-forget API call; revert on error
    const post = get().timeline.find(p => p.id === id);
    if (!post) return;
    const apiCall = post.is_liked ? api.likePost : api.unlikePost;
    apiCall(id).catch(() => {
      // Revert optimistic update
      set(s => ({
        timeline: s.timeline.map(p => {
          if (p.id !== id) return p;
          const reverted = !p.is_liked;
          return {
            ...p,
            is_liked: reverted,
            like_count: p.like_count + (reverted ? 1 : -1),
          };
        }),
      }));
    });
  },

  updatePost(id: string, updates: Partial<Post>) {
    set(s => ({
      timeline: s.timeline.map(p => (p.id === id ? {...p, ...updates} : p)),
    }));
  },
}));
