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
import {likePost, unlikePost} from '../../api/likes';
import {useUserPosts} from '../../hooks/useUserPosts';
import {useSyncLikes} from '../../hooks/useSyncLikes';
import {usePostsStore} from '../../stores/postsStore';
import {useAuthStore} from '../../stores/authStore';
import {useColors, fonts} from '../../theme';
import {formatCount} from '../../utils/format';
import type {UserProfile, Post} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

export default function ProfileScreen({route, navigation}: Props) {
  const paramUsername = route.params?.username;
  const c = useColors();
  const currentUser = useAuthStore(s => s.user);
  const cachePost = usePostsStore(s => s.cachePost);
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
    } catch (e: any) {
      setError(e?.message || 'Failed to load profile');
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
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to update follow status');
    }
    setFollowLoading(false);
  }, [profile, followLoading]);

  const handleToggleLike = useCallback(
    async (post: Post) => {
      const was = post.is_liked;
      const newLiked = !was;
      const newCount = post.like_count + (was ? -1 : 1);
      // Optimistic update on local posts
      setPosts(prev =>
        prev.map(p =>
          p.id === post.id
            ? {...p, is_liked: newLiked, like_count: newCount}
            : p,
        ),
      );
      // Update global cache + timeline
      cachePost(post.id, {is_liked: newLiked, like_count: newCount});
      try {
        was ? await unlikePost(post.id) : await likePost(post.id);
      } catch {
        // Revert on error
        setPosts(prev =>
          prev.map(p =>
            p.id === post.id
              ? {...p, is_liked: was, like_count: post.like_count}
              : p,
          ),
        );
        cachePost(post.id, {is_liked: was, like_count: post.like_count});
      }
    },
    [setPosts, cachePost],
  );

  const renderHeader = useCallback(() => {
    if (!profile) return null;
    return (
      <View>
        <View style={styles.profileHeader}>
          <Avatar
            uri={profile.avatar_url}
            name={profile.display_name}
            size={80}
          />
          <Text style={[styles.displayName, {color: c.textPrimary}]}>
            {profile.display_name}
          </Text>
          <Text style={[styles.username, {color: c.textTertiary}]}>
            @{profile.username}
          </Text>
          {profile.bio ? (
            <Text style={[styles.bio, {color: c.textSecondary}]}>
              {profile.bio}
            </Text>
          ) : null}

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statNum, {color: c.textPrimary}]}>
                {formatCount(posts.length)}
              </Text>
              <Text style={[styles.statLabel, {color: c.textTertiary}]}>
                Posts
              </Text>
            </View>
            <TouchableOpacity
              style={styles.stat}
              onPress={() =>
                navigation.navigate('Followers', {username: profile.username})
              }
              accessibilityLabel={`${profile.follower_count} followers`}>
              <Text style={[styles.statNum, {color: c.textPrimary}]}>
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
              }
              accessibilityLabel={`${profile.following_count} following`}>
              <Text style={[styles.statNum, {color: c.textPrimary}]}>
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
                title="Edit Profile"
                variant="secondary"
                onPress={() => navigation.navigate('EditProfile')}
                style={styles.editBtn}
              />
            ) : (
              <>
                <Button
                  title={profile.is_following ? 'Unfollow' : 'Follow'}
                  variant={profile.is_following ? 'secondary' : 'primary'}
                  loading={followLoading}
                  onPress={handleFollowToggle}
                  style={{flex: 1}}
                />
                <TouchableOpacity
                  style={[
                    styles.msgBtn,
                    {backgroundColor: c.bgTertiary},
                  ]}
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
                  <Icon
                    name="message-outline"
                    size={20}
                    color={c.textSecondary}
                  />
                </TouchableOpacity>
              </>
            )}
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
            <ActivityIndicator style={{paddingVertical: 20}} size="small" />
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
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  displayName: {
    fontSize: 22,
    fontFamily: fonts.displayBold,
    marginTop: 12,
  },
  username: {
    fontSize: 15,
    fontFamily: fonts.body,
    marginTop: 2,
  },
  bio: {
    fontSize: 14,
    fontFamily: fonts.body,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontFamily: fonts.bodyBold,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: fonts.body,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  editBtn: {
    minWidth: 160,
  },
  msgBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
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
    height: 2.5,
    width: 48,
    borderRadius: 2,
  },
});
