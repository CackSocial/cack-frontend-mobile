import type {Post, UserProfile} from '../src/types';
import {
  resolveActionTarget,
  updatePostReference,
} from '../src/utils/posts';

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

describe('resolveActionTarget', () => {
  it('returns the original post for reposts', () => {
    const originalPost = createPost({id: 'original-1'});
    const repost = createPost({
      id: 'repost-1',
      post_type: 'repost',
      original_post: originalPost,
    });

    expect(resolveActionTarget(repost)).toBe(originalPost);
  });

  it('returns the post itself for non-reposts', () => {
    const post = createPost();

    expect(resolveActionTarget(post)).toBe(post);
  });
});

describe('updatePostReference', () => {
  it('updates the top-level post when ids match', () => {
    const post = createPost({id: 'post-1', like_count: 1});

    expect(updatePostReference(post, 'post-1', {like_count: 2})).toMatchObject({
      id: 'post-1',
      like_count: 2,
    });
  });

  it('updates nested original posts when ids match', () => {
    const originalPost = createPost({id: 'original-1', like_count: 1});
    const repost = createPost({
      id: 'repost-1',
      post_type: 'repost',
      original_post: originalPost,
    });

    expect(updatePostReference(repost, 'original-1', {like_count: 2})).toMatchObject({
      original_post: {
        id: 'original-1',
        like_count: 2,
      },
    });
  });
});
