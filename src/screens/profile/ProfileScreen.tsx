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
import PostCard from '../../components/post/PostCard';
import EmptyState from '../../components/common/EmptyState';
import ErrorBanner from '../../components/common/ErrorBanner';
import {getUser} from '../../api/users';
import {followUser, unfollowUser} from '../../api/follows';
import {useUserPosts} from '../../hooks/useUserPosts';
import {useSyncLikes} from '../../hooks/useSyncLikes';
import {useOptimisticLike} from '../../hooks/useOptimisticLike';
import {usePostsStore} from '../../stores/postsStore';
import {useAuthStore} from '../../stores/authStore';
import {useColors, fonts} from '../../theme';
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
  const toggleBookmark = usePostsStore(s => s.toggleBookmark);
  const toggleRepost = usePostsStore(s => s.toggleRepost);

  const username = paramUsername || currentUser?.username || '';
  const isOwnProfile = !paramUsername || paramUsername === currentUser?.username;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts');
  const [error, setError] = useState<string | null>(null);

  const {posts, setPosts, loading: postsLoading, hasMore, refresh, loadMore} =
    useUserPosts(username);

  // REFACTORED: Uses shared useOptimisticLike hook instead of inline implementation
  const handleToggleLike = useOptimisticLike(setPosts);

  useEffect(() => {
    loadProfile();
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  // Sync like states from global cache when screen gains focus
  useSyncLikes(setPosts);

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

  const handleFollowToggle = useCallback(async () => {
    if (!profile || followLoading) return;
    setFollowLoading(true);
    try {
      if (profile.is_following) {
        await unfollowUser(profile.username);
        setProfile(prev =>
          prev ? {...prev, is_following: false, follower_count: prev.follower_count - 1} : prev,
        );
      } else {
        await followUser(profile.username);
        setProfile(prev =>
          prev ? {...prev, is_following: true, follower_count: prev.follower_count + 1} : prev,
        );
      }
    } catch (e: unknown) {
      Alert.alert('Error', getErrorMessage(e));
    }
    setFollowLoading(false);
  }, [profile, followLoading]);

  const renderHeader = useCallback(() => {
    if (!profile) return null;
    return (
      <View>
        <View style={styles.profileHeader}>
          <View style={styles.topRow}>
            <Avatar
              uri={profile.avatar_url}
              name={profile.display_name}
              size={72}
            />
            <View style={styles.actionRow}>
              {isOwnProfile ? (
                <Button
                  title="Edit profile"
                  variant="secondary"
                  size="sm"
                  onPress={() => navigation.navigate('EditProfile')}
                />
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.msgBtn, {borderColor: c.borderStrong}]}
                    onPress={() =>
                      navigation.getParent()?.navigate('MessagesTab', {
                        screen: 'Conversation',
                        params: {
                          username: profile.username,
                          userId: profile.id,
                          displayName: profile.display_name,
                        },
                      })
                    }
                    accessibilityLabel="Send message">
                    <Icon name="email-outline" size={18} color={c.textPrimary} />
                  </TouchableOpacity>
                  <Button
                    title={profile.is_following ? 'Following' : 'Follow'}
                    variant={profile.is_following ? 'secondary' : 'primary'}
                    size="sm"
                    loading={followLoading}
                    onPress={handleFollowToggle}
                  />
                </>
              )}
            </View>
          </View>
          <Text style={[styles.displayName, {color: c.textPrimary}]}>
            {profile.display_name}
          </Text>
          <Text style={[styles.username, {color: c.textSecondary}]}>
            @{profile.username}
          </Text>
          {profile.bio ? (
            <Text style={[styles.bio, {color: c.textPrimary}]}>
              {profile.bio}
            </Text>
          ) : null}

          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.stat}
              onPress={() =>
                navigation.navigate('Following', {username: profile.username})
              }
              accessibilityLabel={`${profile.following_count} following`}>
              <Text style={[styles.statNum, {color: c.textPrimary}]}>
                {formatCount(profile.following_count)}
              </Text>
              <Text style={[styles.statLabel, {color: c.textSecondary}]}>
                Following
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stat}
              onPress={() =>
                navigation.navigate('Followers', {username: profile.username})
              }
              accessibilityLabel={`${profile.follower_count} followers`}>
              <Text style={[styles.statNum, {color: c.textPrimary}]}>
                {formatCount(profile.follower_count)}
              </Text>
              <Text style={[styles.statLabel, {color: c.textSecondary}]}>
                Followers
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Posts / Likes tabs */}
        <View style={[styles.tabBar, {borderBottomColor: c.border}]}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('posts')}
            accessibilityRole="tab"
            accessibilityState={{selected: activeTab === 'posts'}}>
            <Text
              style={[
                styles.tabText,
                {color: activeTab === 'posts' ? c.textPrimary : c.textMuted},
              ]}>
              Posts
            </Text>
            {activeTab === 'posts' && (
              <View style={[styles.tabIndicator, {backgroundColor: c.accent}]} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => setActiveTab('likes')}
            accessibilityRole="tab"
            accessibilityState={{selected: activeTab === 'likes'}}>
            <Text
              style={[
                styles.tabText,
                {color: activeTab === 'likes' ? c.textPrimary : c.textMuted},
              ]}>
              Likes
            </Text>
            {activeTab === 'likes' && (
              <View style={[styles.tabIndicator, {backgroundColor: c.accent}]} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [profile, c, posts.length, activeTab, isOwnProfile, followLoading, navigation, handleFollowToggle]);

  const likedPosts = useMemo(() => posts.filter(p => p.is_liked), [posts]);
  const displayPosts = activeTab === 'posts' ? posts : likedPosts;

  const renderPost = useCallback(
    ({item}: {item: Post}) => (
      <PostCard
        post={item}
        onPress={() =>
          navigation.navigate('PostDetail', {postId: item.id})
        }
        onAuthorPress={() =>
          navigation.push('Profile', {username: item.author.username})
        }
        onLike={() => handleToggleLike(item)}
        onComment={() =>
          navigation.navigate('PostDetail', {postId: item.id})
        }
        onBookmark={() => toggleBookmark(item.id)}
        onRepost={() => toggleRepost(item.id)}
        onQuote={() => navigation.navigate('QuotePost', {post: item})}
        onMentionPress={username =>
          navigation.push('Profile', {username})
        }
        onOriginalPostPress={
          item.original_post
            ? () => navigation.navigate('PostDetail', {postId: item.original_post!.id})
            : undefined
        }
      />
    ),
    [navigation, handleToggleLike, toggleBookmark, toggleRepost],
  );

  const handleEndReached = useCallback(() => {
    if (hasMore && activeTab === 'posts') loadMore();
  }, [hasMore, activeTab, loadMore]);

  if (loadingProfile && !profile) {
    return (
      <View style={[styles.center, {backgroundColor: c.bgPrimary}]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}>
      {error && <ErrorBanner message={error} onRetry={loadProfile} />}
      <FlatList
        data={displayPosts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        ListHeaderComponent={renderHeader}
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
        ListFooterComponent={
          postsLoading ? (
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
  profileHeader: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  displayName: {
    fontSize: 22,
    fontFamily: fonts.bodyBold,
  },
  username: {
    fontSize: 15,
    fontFamily: fonts.body,
    marginTop: 1,
  },
  bio: {
    fontSize: 15,
    fontFamily: fonts.body,
    marginTop: 10,
    lineHeight: 21,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 14,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statNum: {
    fontSize: 14,
    fontFamily: fonts.bodyBold,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: fonts.body,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  editBtn: {
    flex: 1,
  },
  msgBtn: {
    width: 42,
    height: 42,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    position: 'relative',
  },
  tabText: {
    fontSize: 15,
    fontFamily: fonts.bodySemiBold,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: 56,
    borderRadius: 3,
  },
});
