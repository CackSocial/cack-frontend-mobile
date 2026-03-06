import React, {useEffect, useCallback} from 'react';
import {View, FlatList, ActivityIndicator, Alert, StyleSheet} from 'react-native';
import UserListItem from '../../components/user/UserListItem';
import EmptyState from '../../components/common/EmptyState';
import {getFollowing} from '../../api/users';
import {followUser, unfollowUser} from '../../api/follows';
import {useColors} from '../../theme';
import {getErrorMessage, logError} from '../../utils/log';
import {sharedStyles} from '../../styles/shared';
import type {UserProfile} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '../../navigation/types';
import {usePaginatedFetch} from '../../hooks/usePaginatedFetch';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Following'>;

export default function FollowingScreen({route, navigation}: Props) {
  const {username} = route.params;
  const c = useColors();
  const fetchFollowingPage = useCallback(
    async (page: number, limit: number) => {
      const res = await getFollowing(username, page, limit);
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
    fetchPage: fetchFollowingPage,
    errorContext: 'FollowingScreen:fetch',
  });

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleFollowToggle = useCallback(async (user: UserProfile) => {
    try {
      if (user.is_following) {
        await unfollowUser(user.username);
      } else {
        await followUser(user.username);
      }
      setUsers(current =>
        current.map(entry =>
          entry.id === user.id ? {...entry, is_following: !entry.is_following} : entry,
        ),
      );
    } catch (error: unknown) {
      logError('FollowingScreen:followToggle', error);
      Alert.alert('Error', getErrorMessage(error));
    }
  }, [setUsers]);

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
          !loading ? <EmptyState icon="account-outline" title="Not following anyone" /> : null
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
