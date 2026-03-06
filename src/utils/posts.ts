import type {Post} from '../types';

export function resolveActionTarget(post: Post): Post {
  return post.post_type === 'repost' && post.original_post ? post.original_post : post;
}

/** Extract the cacheable interaction fields from a post. */
export function postToCachedState(post: Post) {
  return {
    is_liked: post.is_liked,
    like_count: post.like_count,
    comment_count: post.comment_count,
    is_bookmarked: post.is_bookmarked,
    is_reposted: post.is_reposted,
    repost_count: post.repost_count,
  };
}

export function findPostById(posts: Post[], id: string): Post | undefined {
  return posts.find(post => post.id === id) ?? posts.find(post => post.original_post?.id === id)?.original_post;
}

export function updatePostReference(post: Post, id: string, updates: Partial<Post>): Post {
  if (post.id === id) {
    return {...post, ...updates};
  }

  if (post.original_post?.id === id) {
    return {
      ...post,
      original_post: {
        ...post.original_post,
        ...updates,
      },
    };
  }

  return post;
}

export function updatePostsById(posts: Post[], id: string, updates: Partial<Post>): Post[] {
  let changed = false;
  const nextPosts = posts.map(post => {
    const nextPost = updatePostReference(post, id, updates);
    if (nextPost !== post) {
      changed = true;
    }
    return nextPost;
  });

  return changed ? nextPosts : posts;
}
