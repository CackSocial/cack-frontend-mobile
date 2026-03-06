import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import type {UserProfile} from '../../types';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import {useColors, fonts, radii, spacing, typography, elevation} from '../../theme';
import {useAuthStore} from '../../stores/authStore';

interface Props {
  user: UserProfile;
  onPress?: () => void;
  onFollowToggle?: () => void;
}

export default React.memo(function UserListItem({user, onPress, onFollowToggle}: Props) {
  const c = useColors();
  const currentUser = useAuthStore(s => s.user);
  const isOwnProfile = currentUser?.id === user.id;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        elevation.card,
        {
          backgroundColor: c.bgElevated,
          borderColor: c.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.84}
      accessibilityRole="button"
      accessibilityLabel={`${user.display_name} @${user.username}`}>
      <Avatar uri={user.avatar_url} name={user.display_name} size={48} />
      <View style={styles.info}>
        <Text style={[styles.name, {color: c.textPrimary}]}>{user.display_name}</Text>
        <Text style={[styles.username, {color: c.textTertiary}]}>@{user.username}</Text>
        {user.bio ? (
          <Text style={[styles.bio, {color: c.textSecondary}]} numberOfLines={2}>
            {user.bio}
          </Text>
        ) : null}
      </View>
      {!isOwnProfile && onFollowToggle ? (
        <Button
          title={user.is_following ? 'Following' : 'Follow'}
          variant={user.is_following ? 'secondary' : 'primary'}
          size="sm"
          onPress={onFollowToggle}
        />
      ) : null}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    padding: spacing[4],
    borderWidth: 1,
    borderRadius: radii.xxl,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    fontSize: typography.base,
  },
  username: {
    fontSize: typography.sm,
    fontFamily: fonts.body,
  },
  bio: {
    marginTop: spacing[1],
    fontSize: typography.sm,
    fontFamily: fonts.body,
    lineHeight: 20,
  },
});
