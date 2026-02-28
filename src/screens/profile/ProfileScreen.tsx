import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import PostCard from '../../components/post/PostCard';
import EmptyState from '../../components/common/EmptyState';
import {getUser} from '../../api/users';
import {followUser, unfollowUser} from '../../api/follows';
import {useUserPosts} from '../../hooks/useUserPosts';
import {usePostsStore} from '../../stores/postsStore';
import {useAuthStore} from '../../stores/authStore';
import {useColors} from '../../theme';
import {formatCount} from '../../utils/format';
import type {UserProfile, Post} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

export default function ProfileScreen({route, navigation}: Props) {
  const paramUsername = route.params?.username;
  const c = useColors();
  const currentUser = useAuthStore(s => s.user);
  const toggleTimelineLike = usePostsStore(s => s.toggleLike);

  const username = paramUsername || currentUser?.username || '';
  const isOwnProfile = !paramUsername || paramUsername === currentUser?.username;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const {posts, loading: postsLoading, hasMore, refresh, loadMore} =
    useUserPosts(username);

  useEffect(() => {
    loadProfile();
    refresh();
  }, [username]);

  const loadProfile = async () => {
    setLoadingProfile(true);
    try {
      const data = await getUser(username);
      setProfile(data);
    } catch {}
    setLoadingProfile(false);
  };

  const handleFollowToggle = async () => {
    if (!profile || followLoading) return;
    setFollowLoading(true);
    try {
      if (profile.is_following) {
        await unfollowUser(profile.username);
        setProfile({
          ...profile,
          is_following: false,
          follower_count: profile.follower_count - 1,
        });
      } else {
        await followUser(profile.username);
        setProfile({
          ...profile,
          is_following: true,
          follower_count: profile.follower_count + 1,
        });
      }
    } catch {}
    setFollowLoading(false);
  };

  const renderHeader = () => {
    if (!profile) return null;
    return (
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
                  (navigation as any).navigate('MessagesTab', {
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
    );
  };

  const renderPost = ({item}: {item: Post}) => (
    <PostCard
      post={item}
      onPress={() =>
        (navigation as any).navigate('PostDetail', {postId: item.id})
      }
      onAuthorPress={() => {}}
      onLike={() => toggleTimelineLike(item.id)}
      onComment={() =>
        (navigation as any).navigate('PostDetail', {postId: item.id})
      }
    />
  );

  if (loadingProfile && !profile) {
    return (
      <View style={[styles.center, {backgroundColor: c.bgPrimary}]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}>
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !postsLoading ? (
            <EmptyState icon="text-box-outline" title="No posts yet" />
          ) : null
        }
        onEndReached={() => {
          if (hasMore) loadMore();
        }}
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
    fontWeight: '800',
    marginTop: 12,
  },
  username: {
    fontSize: 15,
    marginTop: 2,
  },
  bio: {
    fontSize: 14,
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
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    width: '100%',
    paddingHorizontal: 20,
  },
  msgBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
