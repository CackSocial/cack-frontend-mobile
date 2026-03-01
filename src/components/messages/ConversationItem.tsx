import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import type {ConversationListItem} from '../../types';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import {formatMessageTime} from '../../utils/format';
import {useColors, fonts} from '../../theme';

interface Props {
  conversation: ConversationListItem;
  onPress?: () => void;
}

export default function ConversationItem({conversation, onPress}: Props) {
  const c = useColors();
  const {user, last_message, unread_count} = conversation;

  const snippet = last_message?.image_url
    ? '📷 Image'
    : last_message?.content || '';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {borderBottomColor: c.border},
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Conversation with ${user.display_name}`}>
      <Avatar uri={user.avatar_url} name={user.display_name} size={48} />
      <View style={styles.body}>
        <View style={styles.row}>
          <Text
            style={[
              styles.name,
              {color: c.textPrimary},
            ]}
            numberOfLines={1}>
            {user.display_name}
          </Text>
          {last_message && (
            <Text style={[styles.time, {color: c.textTertiary}]}>
              {formatMessageTime(last_message.created_at)}
            </Text>
          )}
        </View>
        <View style={styles.row}>
          <Text
            style={[
              styles.snippet,
              {
                color: c.textSecondary,
                fontFamily: unread_count > 0 ? fonts.bodySemiBold : fonts.body,
              },
            ]}
            numberOfLines={1}>
            {snippet}
          </Text>
          <Badge count={unread_count} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    flex: 1,
  },
  time: {
    fontSize: 12,
  },
  snippet: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
});
