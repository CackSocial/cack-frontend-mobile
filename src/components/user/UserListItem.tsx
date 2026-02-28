import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import type {UserProfile} from '../../types';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import {useThemeStore} from '../../stores/themeStore';
import {useAuthStore} from '../../stores/authStore';

interface Props {
  user: UserProfile;
  onPress?: () => void;
  onFollowToggle?: () => void;
}

export default function UserListItem({user, onPress, onFollowToggle}: Props) {
  const theme = useThemeStore(s => s.theme);
  const currentUser = useAuthStore(s => s.user);
  const isDark = theme === 'dark';
  const isOwnProfile = currentUser?.id === user.id;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {borderBottomColor: isDark ? '#374151' : '#f3f4f6'},
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${user.display_name} @${user.username}`}>
      <Avatar uri={user.avatar_url} name={user.display_name} size={44} />
      <View style={styles.info}>
        <Text style={[styles.name, {color: isDark ? '#f3f4f6' : '#111827'}]}>
          {user.display_name}
        </Text>
        <Text style={[styles.username, {color: isDark ? '#6b7280' : '#9ca3af'}]}>
          @{user.username}
        </Text>
      </View>
      {!isOwnProfile && onFollowToggle && (
        <Button
          title={user.is_following ? 'Unfollow' : 'Follow'}
          variant={user.is_following ? 'secondary' : 'primary'}
          size="sm"
          onPress={onFollowToggle}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: '700',
    fontSize: 15,
  },
  username: {
    fontSize: 13,
  },
});
