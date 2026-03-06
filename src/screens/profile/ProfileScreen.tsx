import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Surface from '../../components/common/Surface';
import PostCard from '../../components/post/PostCard';
import EmptyState from '../../components/common/EmptyState';
import ErrorBanner from '../../components/common/ErrorBanner';
import {getUserLikedPosts} from '../../api/likes';
import {getUser} from '../../api/users';
import {followUser, unfollowUser} from '../../api/follows';
import {usePaginatedFetch} from '../../hooks/usePaginatedFetch';
import {usePostCardActions} from '../../hooks/usePostCardActions';
import {useUserPosts} from '../../hooks/useUserPosts';
import {useSyncLikes} from '../../hooks/useSyncLikes';
import {useOptimisticLike} from '../../hooks/useOptimisticLike';
import {useOptimisticBookmark} from '../../hooks/useOptimisticBookmark';
import {useOptimisticRepost} from '../../hooks/useOptimisticRepost';
import {useAuthStore} from '../../stores/authStore';
import {useColors, fonts, layout, sizes, spacing, typography} from '../../theme';
import {getErrorMessage} from '../../utils/log';
import {navigateToConversation, type MainTabNavigation} from '../../navigation/helpers';
import {formatCount} from '../../utils/format';
import {sharedStyles} from '../../styles/shared';
import type {UserProfile, Post} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '../../navigation/types';
import {applyStateUpdate} from '../../utils/state';
import {syncProfileLikedPosts} from '../../utils/profile';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

export default function ProfileScreen({route, navigation}: Props) {
  const paramUsername = route.params?.username;
  const c = useColors();
  const currentUser = useAuthStore(s => s.user);

  const username = paramUsername || currentUser?.username || '';
  const isOwnProfile = !paramUsername || paramUsername === currentUser?.username;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts');
  const [error, setError] = useState<string | null>(null);

  const {
    posts,
    setPosts,
    loading: postsLoading,
    hasMore,
    refresh,
    loadMore,
  } = useUserPosts(username);
  const fetchLikedPostsPage = useCallback(
    async (page: number, limit: number) => {
      const res = await getUserLikedPosts(username, page, limit);
      return res.data ?? [];
    },
    [username],
  );
  const {
    items: likedPosts,
    setItems: setLikedPosts,
    loading: likedPostsLoading,
    hasMore: likedPostsHasMore,
    refresh: refreshLikedPosts,
    loadMore: loadMoreLikedPosts,
  } = usePaginatedFetch<Post>({
    fetchPage: fetchLikedPostsPage,
    errorContext: 'ProfileScreen:fetchLikedPosts',
  });
  const postsRef = useRef(posts);
  const likedPostsRef = useRef(likedPosts);

  useLayoutEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  useLayoutEffect(() => {
    likedPostsRef.current = likedPosts;
  }, [likedPosts]);

  const applyPostsUpdate = useCallback(
    (updater: React.SetStateAction<Post[]>) => {
      const nextPosts = applyStateUpdate(postsRef.current, updater);
      postsRef.current = nextPosts;
      setPosts(nextPosts);
      return nextPosts;
    },
    [setPosts],
  );

  const applyLikedPostsUpdate = useCallback(
    (updater: React.SetStateAction<Post[]>) => {
      const nextLikedPosts = applyStateUpdate(likedPostsRef.current, updater);
      likedPostsRef.current = nextLikedPosts;
      setLikedPosts(nextLikedPosts);
      return nextLikedPosts;
    },
    [setLikedPosts],
  );

  const setProfilePosts = useCallback<React.Dispatch<React.SetStateAction<Post[]>>>(
    updater => {
      applyPostsUpdate(updater);
    },
    [applyPostsUpdate],
  );

  const setProfileLikedPosts = useCallback<
    React.Dispatch<React.SetStateAction<Post[]>>
  >(
    updater => {
      applyLikedPostsUpdate(updater);
    },
    [applyLikedPostsUpdate],
  );

  const setAllProfilePosts = useCallback(
    (updater: React.SetStateAction<Post[]>) => {
      setProfilePosts(updater);
      setProfileLikedPosts(updater);
    },
    [setProfileLikedPosts, setProfilePosts],
  );

  const setLikeAwarePosts = useCallback(
    (updater: React.SetStateAction<Post[]>) => {
      const previousPosts = postsRef.current;
      const nextPosts = applyPostsUpdate(updater);

      applyLikedPostsUpdate(currentLikedPosts =>
        syncProfileLikedPosts(
          previousPosts,
          nextPosts,
          applyStateUpdate(currentLikedPosts, updater),
          isOwnProfile,
        ),
      );
    },
    [applyLikedPostsUpdate, applyPostsUpdate, isOwnProfile],
  );

  const handleToggleLike = useOptimisticLike(setLikeAwarePosts);
  const handleToggleBookmark = useOptimisticBookmark(setAllProfilePosts);
  const handleToggleRepost = useOptimisticRepost(setAllProfilePosts);
  const getPostCardActions = usePostCardActions({
    navigation,
    onLike: post => handleToggleLike(post),
    onBookmark: post => handleToggleBookmark(post),
    onRepost: post => handleToggleRepost(post),
    usePushForProfile: true,
  });

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    setError(null);
    try {
      const data = await getUser(username);
      setProfile(data);
    } catch (fetchError: unknown) {
      setError(getErrorMessage(fetchError));
    } finally {
      setLoadingProfile(false);
    }
  }, [username]);

  useEffect(() => {
    loadProfile();
    refresh();
    refreshLikedPosts();
  }, [loadProfile, refresh, refreshLikedPosts]);

  useSyncLikes(setProfilePosts);
  useSyncLikes(setProfileLikedPosts);

  const handleFollowToggle = useCallback(async () => {
    if (!profile || followLoading) return;
    setFollowLoading(true);
    try {
      if (profile.is_following) {
        await unfollowUser(profile.username);
        setProfile(current =>
          current
            ? {
                ...current,
                is_following: false,
                follower_count: current.follower_count - 1,
              }
            : current,
        );
      } else {
        await followUser(profile.username);
        setProfile(current =>
          current
            ? {
                ...current,
                is_following: true,
                follower_count: current.follower_count + 1,
              }
            : current,
        );
      }
    } catch (toggleError: unknown) {
      Alert.alert('Error', getErrorMessage(toggleError));
    } finally {
      setFollowLoading(false);
    }
  }, [followLoading, profile]);

  const displayPosts = useMemo(
    () => (activeTab === 'posts' ? posts : likedPosts),
    [activeTab, likedPosts, posts],
  );
  const displayLoading = activeTab === 'posts' ? postsLoading : likedPostsLoading;
  const displayHasMore = activeTab === 'posts' ? hasMore : likedPostsHasMore;

  const renderHeader = useCallback(() => {
    if (!profile) return null;
    return (
      <View style={styles.headerWrap}>
        <Surface elevated style={styles.profileCard}>
          <View style={styles.heroRow}>
            <Avatar
              uri={profile.avatar_url}
              name={profile.display_name}
              size={sizes.avatar.profile}
            />
            <View style={styles.heroBody}>
              <Text style={[styles.displayName, {color: c.textPrimary}]}>
                {profile.display_name}
              </Text>
              <Text style={[styles.username, {color: c.textTertiary}]}>
                @{profile.username}
              </Text>
            </View>
          </View>

          {profile.bio ? (
            <Text style={[styles.bio, {color: c.textSecondary}]}>
              {profile.bio}
            </Text>
          ) : null}

          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.stat}
              onPress={() =>
                navigation.navigate('Followers', {username: profile.username})
              }>
              <Text style={[styles.statValue, {color: c.textPrimary}]}>
                {formatCount(profile.follower_count)}
              </Text>
              <Text style={[styles.statLabel, {color: c.textTertiary}]}>
                Followers
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stat}
              onPress={() =>
                navigation.navigate('Following', {username: profile.username})
              }>
              <Text style={[styles.statValue, {color: c.textPrimary}]}>
                {formatCount(profile.following_count)}
              </Text>
              <Text style={[styles.statLabel, {color: c.textTertiary}]}>
                Following
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            {isOwnProfile ? (
              <Button
                title="Edit profile"
                variant="secondary"
                onPress={() => navigation.navigate('EditProfile')}
                style={styles.editProfileButton}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.messageButton, {borderColor: c.borderStrong}]}
                  onPress={() => {
                    const parentNavigation =
                      navigation.getParent<MainTabNavigation>();
                    if (parentNavigation) {
                      navigateToConversation(parentNavigation, {
                        username: profile.username,
                        userId: profile.id,
                        displayName: profile.display_name,
                      });
                    }
                  }}>
                  <Icon name="email-outline" size={18} color={c.textPrimary} />
                </TouchableOpacity>
                <Button
                  title={profile.is_following ? 'Following' : 'Follow'}
                  variant={profile.is_following ? 'secondary' : 'primary'}
                  loading={followLoading}
                  onPress={handleFollowToggle}
                />
              </>
            )}
          </View>
        </Surface>

        <View style={[styles.tabBar, {borderColor: c.border}]}>
          {(['posts', 'likes'] as const).map(tab => {
            const selected = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tab,
                  selected ? {borderBottomColor: c.accent} : null,
                ]}
                onPress={() => setActiveTab(tab)}
                accessibilityRole="tab"
                accessibilityState={{selected}}>
                <Text
                  style={[
                    styles.tabText,
                    {color: selected ? c.textPrimary : c.textTertiary},
                  ]}>
                  {tab === 'posts' ? 'Posts' : 'Likes'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }, [
    activeTab,
    c,
    followLoading,
    handleFollowToggle,
    isOwnProfile,
    navigation,
    profile,
  ]);

  const renderPost = useCallback(
    ({item}: {item: Post}) => {
      return (
        <PostCard post={item} {...getPostCardActions(item)} />
      );
    },
    [getPostCardActions],
  );

  const handleEndReached = useCallback(() => {
    if (!displayHasMore) return;
    if (activeTab === 'posts') {
      loadMore();
      return;
    }
    loadMoreLikedPosts();
  }, [activeTab, displayHasMore, loadMore, loadMoreLikedPosts]);

  if (loadingProfile && !profile) {
    return (
      <View style={[styles.center, {backgroundColor: c.bgPrimary}]}>
        <ActivityIndicator size="large" color={c.textPrimary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}>
      {error ? <ErrorBanner message={error} onRetry={loadProfile} /> : null}
      <FlatList
        data={displayPosts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={sharedStyles.paddedListContent}
        ListEmptyComponent={
          !displayLoading ? (
            <EmptyState
              icon={activeTab === 'posts' ? 'text-box-outline' : 'heart-outline'}
              title={activeTab === 'posts' ? 'No posts yet' : 'No liked posts'}
            />
          ) : null
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          displayLoading ? (
            <ActivityIndicator style={sharedStyles.listLoader} size="small" />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  headerWrap: {
    gap: spacing[4],
  },
  profileCard: {
    marginHorizontal: layout.screenPadding,
    gap: spacing[4],
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  heroBody: {
    flex: 1,
    gap: spacing[1],
  },
  displayName: {
    fontSize: typography.xxl,
    fontFamily: fonts.displayBold,
  },
  username: {
    fontSize: typography.sm,
    fontFamily: fonts.body,
  },
  bio: {
    fontSize: typography.sm,
    fontFamily: fonts.body,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: typography.lg,
    fontFamily: fonts.bodySemiBold,
  },
  statLabel: {
    fontSize: typography.xs,
    fontFamily: fonts.body,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
  editProfileButton: {
    minWidth: 160,
  },
  messageButton: {
    width: sizes.iconButton.xl,
    height: sizes.iconButton.xl,
    borderRadius: sizes.iconButton.xl / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: layout.screenPadding,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: typography.sm,
    fontFamily: fonts.bodySemiBold,
  },
});
