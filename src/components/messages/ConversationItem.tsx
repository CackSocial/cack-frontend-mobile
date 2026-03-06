import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import type {ConversationListItem} from '../../types';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import {formatMessageTime} from '../../utils/format';
import {useColors, fonts, radii, spacing, typography, elevation} from '../../theme';

interface Props {
  conversation: ConversationListItem;
  onPress?: () => void;
}

export default React.memo(function ConversationItem({conversation, onPress}: Props) {
  const c = useColors();
  const {user, last_message, unread_count} = conversation;

  const snippet = last_message?.image_url ? 'Image attachment' : last_message?.content || 'Start the conversation';

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
      accessibilityLabel={`Conversation with ${user.display_name}`}>
      <Avatar uri={user.avatar_url} name={user.display_name} size={52} />
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={[styles.name, {color: c.textPrimary}]} numberOfLines={1}>
            {user.display_name}
          </Text>
          {last_message ? (
            <Text style={[styles.time, {color: c.textTertiary}]}>
              {formatMessageTime(last_message.created_at)}
            </Text>
          ) : null}
        </View>
        <View style={styles.row}>
          <Text
            style={[
              styles.snippet,
              {
                color: unread_count > 0 ? c.textPrimary : c.textSecondary,
                fontFamily: unread_count > 0 ? fonts.bodyMedium : fonts.body,
              },
            ]}
            numberOfLines={2}>
            {snippet}
          </Text>
          <Badge count={unread_count} />
        </View>
      </View>
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
  body: {
    flex: 1,
    gap: spacing[1],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  name: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: typography.base,
  },
  time: {
    fontSize: typography.xs,
    fontFamily: fonts.body,
  },
  snippet: {
    flex: 1,
    fontSize: typography.sm,
    lineHeight: 20,
  },
});
