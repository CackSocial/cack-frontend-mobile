import {Alert} from 'react-native';
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
          is_bookmarked: p.is_bookmarked,
          is_reposted: p.is_reposted,
          repost_count: p.repost_count,
        };
      });
      const existing = reset ? [] : state.timeline;
      const existingIds = new Set(existing.map(p => p.id));
      const deduped = posts.filter(p => !existingIds.has(p.id));
      set({
        timeline: reset ? posts : [...existing, ...deduped],
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
      timeline: s.timeline.some(p => p.id === post.id)
        ? s.timeline
        : [post, ...s.timeline],
      postCache: {
        ...s.postCache,
        [post.id]: {
          is_liked: post.is_liked,
          like_count: post.like_count,
          comment_count: post.comment_count,
          is_bookmarked: post.is_bookmarked,
          is_reposted: post.is_reposted,
          repost_count: post.repost_count,
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
    const post = state.timeline.find(p => p.id === id)
      ?? state.timeline.find(p => p.original_post?.id === id)?.original_post;
    const wasLiked = cached?.is_liked ?? post?.is_liked ?? false;
    const wasCount = cached?.like_count ?? post?.like_count ?? 0;
    const commentCount = cached?.comment_count ?? post?.comment_count ?? 0;
    const isBookmarked = cached?.is_bookmarked ?? post?.is_bookmarked ?? false;
    const isReposted = cached?.is_reposted ?? post?.is_reposted ?? false;
    const repostCount = cached?.repost_count ?? post?.repost_count ?? 0;
    const newLiked = !wasLiked;
    const newCount = wasCount + (newLiked ? 1 : -1);

    const newMeta: CachedPostState = {is_liked: newLiked, like_count: newCount, comment_count: commentCount, is_bookmarked: isBookmarked, is_reposted: isReposted, repost_count: repostCount};
    const oldMeta: CachedPostState = {is_liked: wasLiked, like_count: wasCount, comment_count: commentCount, is_bookmarked: isBookmarked, is_reposted: isReposted, repost_count: repostCount};

    set(s => ({
      timeline: s.timeline.map(p => {
        if (p.id === id) return {...p, is_liked: newLiked, like_count: newCount};
        if (p.original_post?.id === id) {
          return {...p, original_post: {...p.original_post, is_liked: newLiked, like_count: newCount}};
        }
        return p;
      }),
      postCache: {...s.postCache, [id]: newMeta},
    }));

    const apiCall = newLiked ? api.likePost : api.unlikePost;
    apiCall(id).catch(e => {
      logError('toggleLike', e);
      set(s => ({
        timeline: s.timeline.map(p => {
          if (p.id === id) return {...p, is_liked: wasLiked, like_count: wasCount};
          if (p.original_post?.id === id) {
            return {...p, original_post: {...p.original_post, is_liked: wasLiked, like_count: wasCount}};
          }
          return p;
        }),
        postCache: {...s.postCache, [id]: oldMeta},
      }));
    });
  },

  toggleBookmark(id: string) {
    const state = get();
    const cached = state.postCache[id];
    const post = state.timeline.find(p => p.id === id)
      ?? state.timeline.find(p => p.original_post?.id === id)?.original_post;
    const wasBookmarked = cached?.is_bookmarked ?? post?.is_bookmarked ?? false;
    const newBookmarked = !wasBookmarked;

    const baseMeta = {
      is_liked: cached?.is_liked ?? post?.is_liked ?? false,
      like_count: cached?.like_count ?? post?.like_count ?? 0,
      comment_count: cached?.comment_count ?? post?.comment_count ?? 0,
      is_reposted: cached?.is_reposted ?? post?.is_reposted ?? false,
      repost_count: cached?.repost_count ?? post?.repost_count ?? 0,
    };

    set(s => ({
      timeline: s.timeline.map(p => {
        if (p.id === id) return {...p, is_bookmarked: newBookmarked};
        if (p.original_post?.id === id) {
          return {...p, original_post: {...p.original_post, is_bookmarked: newBookmarked}};
        }
        return p;
      }),
      postCache: {...s.postCache, [id]: {...baseMeta, is_bookmarked: newBookmarked}},
    }));

    const apiCall = newBookmarked ? api.bookmarkPost : api.unbookmarkPost;
    apiCall(id).catch(e => {
      logError('toggleBookmark', e);
      set(s => ({
        timeline: s.timeline.map(p => {
          if (p.id === id) return {...p, is_bookmarked: wasBookmarked};
          if (p.original_post?.id === id) {
            return {...p, original_post: {...p.original_post, is_bookmarked: wasBookmarked}};
          }
          return p;
        }),
        postCache: {...s.postCache, [id]: {...baseMeta, is_bookmarked: wasBookmarked}},
      }));
    });
  },

  toggleRepost(id: string) {
    const state = get();
    const cached = state.postCache[id];
    const post = state.timeline.find(p => p.id === id)
      ?? state.timeline.find(p => p.original_post?.id === id)?.original_post;
    const wasReposted = cached?.is_reposted ?? post?.is_reposted ?? false;
    const wasCount = cached?.repost_count ?? post?.repost_count ?? 0;
    const newReposted = !wasReposted;
    const newCount = wasCount + (newReposted ? 1 : -1);

    const baseMeta = {
      is_liked: cached?.is_liked ?? post?.is_liked ?? false,
      like_count: cached?.like_count ?? post?.like_count ?? 0,
      comment_count: cached?.comment_count ?? post?.comment_count ?? 0,
      is_bookmarked: cached?.is_bookmarked ?? post?.is_bookmarked ?? false,
    };

    set(s => ({
      timeline: s.timeline.map(p => {
        if (p.id === id) return {...p, is_reposted: newReposted, repost_count: newCount};
        if (p.original_post?.id === id) {
          return {...p, original_post: {...p.original_post, is_reposted: newReposted, repost_count: newCount}};
        }
        return p;
      }),
      postCache: {...s.postCache, [id]: {...baseMeta, is_reposted: newReposted, repost_count: newCount}},
    }));

    const apiCall = newReposted ? api.repost : api.deleteRepost;
    apiCall(id).catch(e => {
      logError('toggleRepost', e);
      Alert.alert('Error', newReposted ? 'Failed to repost.' : 'Failed to remove repost. Please try again.');
      set(s => ({
        timeline: s.timeline.map(p => {
          if (p.id === id) return {...p, is_reposted: wasReposted, repost_count: wasCount};
          if (p.original_post?.id === id) {
            return {...p, original_post: {...p.original_post, is_reposted: wasReposted, repost_count: wasCount}};
          }
          return p;
        }),
        postCache: {...s.postCache, [id]: {...baseMeta, is_reposted: wasReposted, repost_count: wasCount}},
      }));
    });
  },

  // Write post metadata to global cache + update timeline if present
  cachePost(id: string, meta: Partial<CachedPostState>) {
    set(s => {
      const prev = s.postCache[id];
      const post = s.timeline.find(p => p.id === id)
        ?? s.timeline.find(p => p.original_post?.id === id)?.original_post;
      const merged: CachedPostState = {
        is_liked: meta.is_liked ?? prev?.is_liked ?? post?.is_liked ?? false,
        like_count: meta.like_count ?? prev?.like_count ?? post?.like_count ?? 0,
        comment_count: meta.comment_count ?? prev?.comment_count ?? post?.comment_count ?? 0,
        is_bookmarked: meta.is_bookmarked ?? prev?.is_bookmarked ?? post?.is_bookmarked ?? false,
        is_reposted: meta.is_reposted ?? prev?.is_reposted ?? post?.is_reposted ?? false,
        repost_count: meta.repost_count ?? prev?.repost_count ?? post?.repost_count ?? 0,
      };
      return {
        timeline: s.timeline.map(p => {
          if (p.id === id) return {...p, ...merged};
          if (p.original_post?.id === id) {
            return {...p, original_post: {...p.original_post, ...merged}};
          }
          return p;
        }),
        postCache: {...s.postCache, [id]: merged},
      };
    });
  },

  // Apply cached post states to an array of posts
  applyPostCache(posts: Post[]): Post[] {
    const cache = get().postCache;
    let changed = false;
    const result = posts.map(p => {
      let updated = p;
      const c = cache[p.id];
      if (c && (
        c.is_liked !== p.is_liked ||
        c.like_count !== p.like_count ||
        c.comment_count !== p.comment_count ||
        c.is_bookmarked !== p.is_bookmarked ||
        c.is_reposted !== p.is_reposted ||
        c.repost_count !== p.repost_count
      )) {
        changed = true;
        updated = {...updated, ...c};
      }
      // Also apply cache to nested original_post
      if (p.original_post) {
        const oc = cache[p.original_post.id];
        if (oc && (
          oc.is_liked !== p.original_post.is_liked ||
          oc.like_count !== p.original_post.like_count ||
          oc.comment_count !== p.original_post.comment_count ||
          oc.is_bookmarked !== p.original_post.is_bookmarked ||
          oc.is_reposted !== p.original_post.is_reposted ||
          oc.repost_count !== p.original_post.repost_count
        )) {
          changed = true;
          updated = {...updated, original_post: {...p.original_post, ...oc}};
        }
      }
      return updated;
    });
    return changed ? result : posts;
  },

  updatePost(id: string, updates: Partial<Post>) {
    set(s => ({
      timeline: s.timeline.map(p => (p.id === id ? {...p, ...updates} : p)),
    }));
  },
}));
