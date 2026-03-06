import type {Post, UserProfile} from '../src/types';
import {syncProfileLikedPosts} from '../src/utils/profile';

function createUser(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: overrides.id ?? 'user-1',
    username: overrides.username ?? 'tester',
    display_name: overrides.display_name ?? 'Tester',
    bio: overrides.bio ?? '',
    avatar_url: overrides.avatar_url ?? '',
    follower_count: overrides.follower_count ?? 0,
    following_count: overrides.following_count ?? 0,
    is_following: overrides.is_following ?? false,
  };
}

function createPost(overrides: Partial<Post> = {}): Post {
  return {
    id: overrides.id ?? 'post-1',
    content: overrides.content ?? 'hello world',
    image_url: overrides.image_url ?? '',
    author: overrides.author ?? createUser(),
    tags: overrides.tags ?? [],
    post_type: overrides.post_type ?? 'original',
    original_post: overrides.original_post,
    repost_count: overrides.repost_count ?? 0,
    is_reposted: overrides.is_reposted ?? false,
    like_count: overrides.like_count ?? 0,
    comment_count: overrides.comment_count ?? 0,
    is_liked: overrides.is_liked ?? false,
    is_bookmarked: overrides.is_bookmarked ?? false,
    created_at: overrides.created_at ?? '2026-01-01T00:00:00Z',
  };
}

describe('syncProfileLikedPosts', () => {
  it('adds newly liked authored posts to own likes list', () => {
    const prevPosts = [createPost({id: 'post-1', is_liked: false})];
    const nextPosts = [createPost({id: 'post-1', is_liked: true, like_count: 1})];

    expect(syncProfileLikedPosts(prevPosts, nextPosts, [], true)).toEqual(
      nextPosts,
    );
  });

  it('removes unliked posts from own likes list', () => {
    const prevPosts = [createPost({id: 'post-1', is_liked: true})];
    const nextPosts = [createPost({id: 'post-1', is_liked: false})];
    const nextLikedPosts = [createPost({id: 'post-1', is_liked: false})];

    expect(syncProfileLikedPosts(prevPosts, nextPosts, nextLikedPosts, true)).toEqual(
      [],
    );
  });

  it('keeps membership unchanged when viewing another profile', () => {
    const prevPosts = [createPost({id: 'post-1', is_liked: false})];
    const nextPosts = [createPost({id: 'post-1', is_liked: true, like_count: 1})];
    const nextLikedPosts = [createPost({id: 'liked-1', is_liked: false})];

    expect(
      syncProfileLikedPosts(prevPosts, nextPosts, nextLikedPosts, false),
    ).toEqual(nextLikedPosts);
  });
});
