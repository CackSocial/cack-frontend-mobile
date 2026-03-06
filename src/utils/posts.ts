import type {Post} from '../types';

export function resolveActionTarget(post: Post): Post {
  return post.post_type === 'repost' && post.original_post ? post.original_post : post;
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
