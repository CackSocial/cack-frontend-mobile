import React, {useEffect, useState, useCallback, useMemo} from 'react';
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
import {getUser} from '../../api/users';
import {followUser, unfollowUser} from '../../api/follows';
import {useUserPosts} from '../../hooks/useUserPosts';
import {useSyncLikes} from '../../hooks/useSyncLikes';
import {useOptimisticLike} from '../../hooks/useOptimisticLike';
import {useOptimisticBookmark} from '../../hooks/useOptimisticBookmark';
import {useOptimisticRepost} from '../../hooks/useOptimisticRepost';
import {useAuthStore} from '../../stores/authStore';
import {useColors, fonts, layout, radii, spacing, typography} from '../../theme';
import {getErrorMessage} from '../../utils/log';
import {formatCount} from '../../utils/format';
import {sharedStyles} from '../../styles/shared';
import type {UserProfile, Post} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '../../navigation/types';

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

  const {posts, setPosts, loading: postsLoading, hasMore, refresh, loadMore} = useUserPosts(username);

  const handleToggleLike = useOptimisticLike(setPosts);
  const handleToggleBookmark = useOptimisticBookmark(setPosts);
  const handleToggleRepost = useOptimisticRepost(setPosts);

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    setError(null);
    try {
      const data = await getUser(username);
      setProfile(data);
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
    setLoadingProfile(false);
  }, [username]);

  useEffect(() => {
    loadProfile();
    refresh();
  }, [loadProfile, refresh]);

  useSyncLikes(setPosts);

  const handleFollowToggle = useCallback(async () => {
    if (!profile || followLoading) return;
    setFollowLoading(true);
    try {
      if (profile.is_following) {
        await unfollowUser(profile.username);
        setProfile(prev => (prev ? {...prev, is_following: false, follower_count: prev.follower_count - 1} : prev));
      } else {
        await followUser(profile.username);
        setProfile(prev => (prev ? {...prev, is_following: true, follower_count: prev.follower_count + 1} : prev));
      }
    } catch (e: unknown) {
      Alert.alert('Error', getErrorMessage(e));
    }
    setFollowLoading(false);
  }, [profile, followLoading]);

  const likedPosts = useMemo(() => posts.filter(p => p.is_liked), [posts]);
  const displayPosts = activeTab === 'posts' ? posts : likedPosts;

  const renderHeader = useCallback(() => {
    if (!profile) return null;
    return (
      <View style={styles.headerWrap}>
        <Surface elevated style={styles.profileCard}>
          <View style={styles.heroRow}>
            <Avatar uri={profile.avatar_url} name={profile.display_name} size={84} />
            <View style={styles.heroBody}>
              <Text style={[styles.displayName, {color: c.textPrimary}]}>{profile.display_name}</Text>
              <Text style={[styles.username, {color: c.textTertiary}]}>@{profile.username}</Text>
            </View>
          </View>

          {profile.bio ? <Text style={[styles.bio, {color: c.textSecondary}]}>{profile.bio}</Text> : null}

          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.stat} onPress={() => navigation.navigate('Followers', {username: profile.username})}>
              <Text style={[styles.statValue, {color: c.textPrimary}]}>{formatCount(profile.follower_count)}</Text>
              <Text style={[styles.statLabel, {color: c.textTertiary}]}>Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stat} onPress={() => navigation.navigate('Following', {username: profile.username})}>
              <Text style={[styles.statValue, {color: c.textPrimary}]}>{formatCount(profile.following_count)}</Text>
              <Text style={[styles.statLabel, {color: c.textTertiary}]}>Following</Text>
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
                  onPress={() =>
                    navigation.getParent()?.navigate('MessagesTab', {
                      screen: 'Conversation',
                      params: {
                        username: profile.username,
                        userId: profile.id,
                        displayName: profile.display_name,
                      },
                      initial: false,
                    })
                  }>
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
                style={[styles.tab, selected ? {borderBottomColor: c.accent} : null]}
                onPress={() => setActiveTab(tab)}
                accessibilityRole="tab"
                accessibilityState={{selected}}>
                <Text style={[styles.tabText, {color: selected ? c.textPrimary : c.textTertiary}]}> 
                  {tab === 'posts' ? 'Posts' : 'Likes'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }, [profile, c, activeTab, isOwnProfile, followLoading, navigation, handleFollowToggle]);

  const renderPost = useCallback(
    ({item}: {item: Post}) => {
      const actionTarget = item.post_type === 'repost' && item.original_post ? item.original_post : item;
      return (
        <PostCard
          post={item}
          onPress={() => navigation.navigate('PostDetail', {postId: actionTarget.id})}
          onAuthorPress={() => navigation.push('Profile', {username: actionTarget.author.username})}
          onLike={() => handleToggleLike(item)}
          onComment={() => navigation.navigate('PostDetail', {postId: actionTarget.id})}
          onBookmark={() => handleToggleBookmark(item)}
          onRepost={() => handleToggleRepost(item)}
          onQuote={() => navigation.navigate('QuotePost', {post: actionTarget})}
          onMentionPress={profileUsername => navigation.push('Profile', {username: profileUsername})}
          onOriginalPostPress={item.original_post ? () => navigation.navigate('PostDetail', {postId: item.original_post!.id}) : undefined}
        />
      );
    },
    [navigation, handleToggleLike, handleToggleBookmark, handleToggleRepost],
  );

  const handleEndReached = useCallback(() => {
    if (hasMore && activeTab === 'posts') loadMore();
  }, [hasMore, activeTab, loadMore]);

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
          !postsLoading ? (
            <EmptyState
              icon={activeTab === 'posts' ? 'text-box-outline' : 'heart-outline'}
              title={activeTab === 'posts' ? 'No posts yet' : 'No liked posts'}
            />
          ) : null
        }
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={postsLoading ? <ActivityIndicator style={sharedStyles.listLoader} size="small" /> : null}
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
    width: 42,
    height: 42,
    borderRadius: 21,
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
