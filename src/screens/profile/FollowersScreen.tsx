import React, {useEffect, useState, useCallback} from 'react';
import {View, FlatList, ActivityIndicator, StyleSheet} from 'react-native';
import UserListItem from '../../components/user/UserListItem';
import EmptyState from '../../components/common/EmptyState';
import {getFollowers} from '../../api/users';
import {followUser, unfollowUser} from '../../api/follows';
import {useColors} from '../../theme';
import {PAGINATION_LIMIT} from '../../config';
import type {UserProfile} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Followers'>;

export default function FollowersScreen({route, navigation}: Props) {
  const {username} = route.params;
  const c = useColors();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(
    async (reset = false) => {
      if (loading) return;
      const p = reset ? 1 : page;
      if (!reset && !hasMore) return;

      setLoading(true);
      try {
        const res = await getFollowers(username, p, PAGINATION_LIMIT);
        const data = res.data ?? [];
        setUsers(prev => (reset ? data : [...prev, ...data]));
        setPage(p + 1);
        setHasMore(data.length === PAGINATION_LIMIT);
      } catch {}
      setLoading(false);
    },
    [username, page, hasMore, loading],
  );

  useEffect(() => {
    fetch(true);
  }, []);

  const handleFollowToggle = async (user: UserProfile) => {
    try {
      if (user.is_following) {
        await unfollowUser(user.username);
      } else {
        await followUser(user.username);
      }
      setUsers(prev =>
        prev.map(u =>
          u.id === user.id ? {...u, is_following: !u.is_following} : u,
        ),
      );
    } catch {}
  };

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}>
      <FlatList
        data={users}
        keyExtractor={item => item.id}
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
          if (hasMore) fetch(false);
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator style={{paddingVertical: 20}} size="small" /> : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
});
