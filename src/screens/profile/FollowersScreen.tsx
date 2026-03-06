import React, {useEffect, useCallback} from 'react';
import {View, FlatList, ActivityIndicator, Alert, StyleSheet} from 'react-native';
import UserListItem from '../../components/user/UserListItem';
import EmptyState from '../../components/common/EmptyState';
import {getFollowers} from '../../api/users';
import {followUser, unfollowUser} from '../../api/follows';
import {useAuthStore} from '../../stores/authStore';
import {useColors} from '../../theme';
import {getErrorMessage, logError} from '../../utils/log';
import {sharedStyles} from '../../styles/shared';
import type {UserProfile} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '../../navigation/types';
import {usePaginatedFetch} from '../../hooks/usePaginatedFetch';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Followers'>;

export default function FollowersScreen({route, navigation}: Props) {
  const {username} = route.params;
  const c = useColors();
  const updateUser = useAuthStore(s => s.updateUser);
  const fetchFollowersPage = useCallback(
    async (page: number, limit: number) => {
      const res = await getFollowers(username, page, limit);
      return res.data ?? [];
    },
    [username],
  );
  const {
    items: users,
    setItems: setUsers,
    loading,
    hasMore,
    refresh,
    loadMore,
  } = usePaginatedFetch<UserProfile>({
    fetchPage: fetchFollowersPage,
    errorContext: 'FollowersScreen:fetch',
  });

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleFollowToggle = useCallback(async (user: UserProfile) => {
    try {
      const wasFollowing = user.is_following;
      if (wasFollowing) {
        await unfollowUser(user.username);
      } else {
        await followUser(user.username);
      }
      setUsers(current =>
        current.map(entry =>
          entry.id === user.id ? {...entry, is_following: !entry.is_following} : entry,
        ),
      );
      const latestUser = useAuthStore.getState().user;
      if (latestUser) {
        updateUser({
          following_count: latestUser.following_count + (wasFollowing ? -1 : 1),
        });
      }
    } catch (error: unknown) {
      logError('FollowersScreen:followToggle', error);
      Alert.alert('Error', getErrorMessage(error));
    }
  }, [setUsers, updateUser]);

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}>
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        contentContainerStyle={sharedStyles.paddedListContent}
        renderItem={({item}) => (
          <UserListItem
            user={item}
            onPress={() => navigation.push('Profile', {username: item.username})}
            onFollowToggle={() => handleFollowToggle(item)}
          />
        )}
        ListEmptyComponent={
          !loading ? <EmptyState icon="account-outline" title="No followers" /> : null
        }
        onEndReached={() => {
          if (hasMore) loadMore();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator style={sharedStyles.listLoader} size="small" /> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
});
