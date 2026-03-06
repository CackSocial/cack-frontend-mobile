import {useCallback} from 'react';
import type {Post} from '../types';
import {resolveActionTarget} from '../utils/posts';

type PostCardNavigation = {
  navigate(screen: 'PostDetail', params: {postId: string}): void;
  navigate(screen: 'QuotePost', params: {post: Post}): void;
  navigate(screen: 'Profile', params: {username: string}): void;
  push?: (screen: 'Profile', params: {username: string}) => void;
};

interface UsePostCardActionsOptions {
  navigation: PostCardNavigation;
  onLike: (post: Post, actionTarget: Post) => void;
  onBookmark: (post: Post, actionTarget: Post) => void;
  onRepost: (post: Post, actionTarget: Post) => void;
  onTagPress?: (tag: string) => void;
  usePushForProfile?: boolean;
}

export function usePostCardActions({
  navigation,
  onLike,
  onBookmark,
  onRepost,
  onTagPress,
  usePushForProfile = false,
}: UsePostCardActionsOptions) {
  const navigateToProfile = useCallback(
    (username: string) => {
      if (usePushForProfile && navigation.push) {
        navigation.push('Profile', {username});
        return;
      }

      navigation.navigate('Profile', {username});
    },
    [navigation, usePushForProfile],
  );

  return useCallback(
    (post: Post) => {
      const actionTarget = resolveActionTarget(post);

      return {
        onPress: () =>
          navigation.navigate('PostDetail', {postId: actionTarget.id}),
        onAuthorPress: () => navigateToProfile(actionTarget.author.username),
        onLike: () => onLike(post, actionTarget),
        onComment: () =>
          navigation.navigate('PostDetail', {postId: actionTarget.id}),
        onBookmark: () => onBookmark(post, actionTarget),
        onRepost: () => onRepost(post, actionTarget),
        onQuote: () => navigation.navigate('QuotePost', {post: actionTarget}),
        onTagPress,
        onMentionPress: navigateToProfile,
        onOriginalPostPress: post.original_post
          ? () =>
              navigation.navigate('PostDetail', {
                postId: post.original_post!.id,
              })
          : undefined,
      };
    },
    [navigateToProfile, navigation, onBookmark, onLike, onRepost, onTagPress],
  );
}
