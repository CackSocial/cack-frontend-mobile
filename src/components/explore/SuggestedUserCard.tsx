import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import {useColors, fonts, radii, spacing, typography, elevation, opacity} from '../../theme';
import {formatCount} from '../../utils/format';
import type {SuggestedUser} from '../../types';

interface Props {
  user: SuggestedUser;
  isFollowing: boolean;
  onPress: () => void;
  onFollow: () => void;
  onUnfollow: () => void;
}

export default React.memo(function SuggestedUserCard({
  user,
  isFollowing,
  onPress,
  onFollow,
  onUnfollow,
}: Props) {
  const c = useColors();

  return (
    <TouchableOpacity
      style={[styles.card, elevation.card, {backgroundColor: c.bgElevated, borderColor: c.border}]}
      onPress={onPress}
      activeOpacity={opacity.active}
      accessibilityRole="button"
      accessibilityLabel={`${user.display_name} @${user.username}`}>
      <Avatar uri={user.avatar_url} name={user.display_name} size={52} />
      <Text style={[styles.displayName, {color: c.textPrimary}]} numberOfLines={1}>
        {user.display_name}
      </Text>
      <Text style={[styles.username, {color: c.textSecondary}]} numberOfLines={1}>
        @{user.username}
      </Text>
      {user.bio ? (
        <Text style={[styles.bio, {color: c.textTertiary}]} numberOfLines={2}>
          {user.bio}
        </Text>
      ) : null}
      <View style={styles.stats}>
        <Text style={[styles.statText, {color: c.textSecondary}]}>
          {formatCount(user.follower_count)} followers
        </Text>
        {user.mutual_follower_count > 0 ? (
          <Text style={[styles.mutualText, {color: c.textTertiary}]}>
            {user.mutual_follower_count} mutual
          </Text>
        ) : null}
      </View>
      <Button
        title={isFollowing ? 'Following' : 'Follow'}
        variant={isFollowing ? 'secondary' : 'primary'}
        size="sm"
        onPress={isFollowing ? onUnfollow : onFollow}
        fullWidth
      />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 170,
    borderWidth: 1,
    borderRadius: radii.xxl,
    padding: spacing[4],
    alignItems: 'center',
    gap: spacing[1],
  },
  displayName: {
    fontSize: typography.sm,
    fontFamily: fonts.bodySemiBold,
    marginTop: spacing[2],
    textAlign: 'center',
  },
  username: {
    fontSize: typography.xs,
    fontFamily: fonts.body,
    textAlign: 'center',
  },
  bio: {
    fontSize: typography.xs,
    fontFamily: fonts.body,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: spacing[1],
  },
  stats: {
    alignItems: 'center',
    gap: 2,
    marginTop: spacing[2],
    marginBottom: spacing[2],
  },
  statText: {
    fontSize: typography.xs,
    fontFamily: fonts.bodyMedium,
  },
  mutualText: {
    fontSize: typography.xs,
    fontFamily: fonts.body,
  },
});
