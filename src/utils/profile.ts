import type {Post} from '../types';
import {resolveActionTarget} from './posts';

function getTargetId(post: Post) {
  return resolveActionTarget(post).id;
}

export function syncProfileLikedPosts(
  prevPosts: Post[],
  nextPosts: Post[],
  nextLikedPosts: Post[],
  isOwnProfile: boolean,
) {
  if (!isOwnProfile) {
    return nextLikedPosts;
  }

  const filteredLikedPosts = nextLikedPosts.filter(
    post => resolveActionTarget(post).is_liked,
  );
  const existingIds = new Set(filteredLikedPosts.map(getTargetId));
  const previousLikeState = new Map(
    prevPosts.map(post => [getTargetId(post), resolveActionTarget(post).is_liked]),
  );
  const newlyLikedPosts = nextPosts.filter(post => {
    const target = resolveActionTarget(post);
    return (
      target.is_liked &&
      previousLikeState.get(target.id) === false &&
      !existingIds.has(target.id)
    );
  });

  return newlyLikedPosts.length > 0
    ? [...newlyLikedPosts, ...filteredLikedPosts]
    : filteredLikedPosts;
}
