import {create} from 'zustand';
import type {Post, SuggestedUser} from '../types';
import * as api from '../api';
import {PAGINATION_LIMIT} from '../config';
import {logError} from '../utils/log';

interface ExploreState {
  suggestedUsers: SuggestedUser[];
  isLoadingSuggestions: boolean;

  popularPosts: Post[];
  popularPage: number;
  popularHasMore: boolean;
  isLoadingPopular: boolean;
  isLoadingMorePopular: boolean;

  discoverPosts: Post[];
  discoverPage: number;
  discoverHasMore: boolean;
  isLoadingDiscover: boolean;
  isLoadingMoreDiscover: boolean;

  fetchSuggestedUsers(): Promise<void>;
  fetchPopularPosts(reset?: boolean): Promise<void>;
  fetchDiscoverFeed(reset?: boolean): Promise<void>;
  resetPopular(): void;
  resetDiscover(): void;
}

export const useExploreStore = create<ExploreState>((set, get) => ({
  suggestedUsers: [],
  isLoadingSuggestions: false,

  popularPosts: [],
  popularPage: 1,
  popularHasMore: true,
  isLoadingPopular: false,
  isLoadingMorePopular: false,

  discoverPosts: [],
  discoverPage: 1,
  discoverHasMore: true,
  isLoadingDiscover: false,
  isLoadingMoreDiscover: false,

  async fetchSuggestedUsers() {
    set({isLoadingSuggestions: true});
    try {
      const users = await api.getSuggestedUsers(10);
      set({suggestedUsers: users, isLoadingSuggestions: false});
    } catch (error: unknown) {
      logError('fetchSuggestedUsers', error);
      set({isLoadingSuggestions: false});
    }
  },

  async fetchPopularPosts(reset = false) {
    const state = get();
    if (reset) {
      set({isLoadingPopular: true});
    } else {
      if (state.isLoadingPopular || state.isLoadingMorePopular || !state.popularHasMore) return;
      set({isLoadingMorePopular: true});
    }

    const page = reset ? 1 : state.popularPage;
    try {
      const res = await api.getPopularPosts(page, PAGINATION_LIMIT);
      const posts = res.data ?? [];

      set(current => {
        const existing = reset ? [] : current.popularPosts;
        const existingIds = new Set(existing.map(p => p.id));
        const deduped = posts.filter(p => !existingIds.has(p.id));

        return {
          popularPosts: reset ? posts : [...existing, ...deduped],
          popularPage: page + 1,
          popularHasMore: posts.length === PAGINATION_LIMIT,
          isLoadingPopular: false,
          isLoadingMorePopular: false,
        };
      });
    } catch (error: unknown) {
      logError('fetchPopularPosts', error);
      set({isLoadingPopular: false, isLoadingMorePopular: false});
    }
  },

  async fetchDiscoverFeed(reset = false) {
    const state = get();
    if (reset) {
      set({isLoadingDiscover: true});
    } else {
      if (state.isLoadingDiscover || state.isLoadingMoreDiscover || !state.discoverHasMore) return;
      set({isLoadingMoreDiscover: true});
    }

    const page = reset ? 1 : state.discoverPage;
    try {
      const res = await api.getDiscoverFeed(page, PAGINATION_LIMIT);
      const posts = res.data ?? [];

      set(current => {
        const existing = reset ? [] : current.discoverPosts;
        const existingIds = new Set(existing.map(p => p.id));
        const deduped = posts.filter(p => !existingIds.has(p.id));

        return {
          discoverPosts: reset ? posts : [...existing, ...deduped],
          discoverPage: page + 1,
          discoverHasMore: posts.length === PAGINATION_LIMIT,
          isLoadingDiscover: false,
          isLoadingMoreDiscover: false,
        };
      });
    } catch (error: unknown) {
      logError('fetchDiscoverFeed', error);
      set({isLoadingDiscover: false, isLoadingMoreDiscover: false});
    }
  },

  resetPopular() {
    set({popularPosts: [], popularPage: 1, popularHasMore: true});
  },

  resetDiscover() {
    set({discoverPosts: [], discoverPage: 1, discoverHasMore: true});
  },
}));
