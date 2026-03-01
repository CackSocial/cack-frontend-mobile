import React, {useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import {useNotificationsStore} from '../../stores/notificationsStore';
import {useColors, fonts} from '../../theme';
import {formatRelativeTime} from '../../utils/format';
import {sharedStyles} from '../../styles/shared';
import type {Notification} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {NotificationsStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<NotificationsStackParamList, 'Notifications'>;

const NOTIFICATION_ICONS: Record<string, {icon: string; color: string}> = {
  like: {icon: 'heart', color: '#f91880'},
  comment: {icon: 'comment-outline', color: '#1d9bf0'},
  follow: {icon: 'account-plus-outline', color: '#7856ff'},
  mention: {icon: 'at', color: '#ff7a00'},
  repost: {icon: 'repeat', color: '#00ba7c'},
  quote: {icon: 'format-quote-close', color: '#1d9bf0'},
};

function getNotificationText(type: string): string {
  switch (type) {
    case 'like':
      return 'liked your post';
    case 'comment':
      return 'commented on your post';
    case 'follow':
      return 'started following you';
    case 'mention':
      return 'mentioned you';
    case 'repost':
      return 'reposted your post';
    case 'quote':
      return 'quoted your post';
    default:
      return 'interacted with you';
  }
}

export default function NotificationsScreen({navigation}: Props) {
  const c = useColors();
  const {
    notifications,
    isLoading,
    hasMore,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotificationsStore();

  useEffect(() => {
    fetchNotifications(true);
    fetchUnreadCount();
  }, []);

  const handleRefresh = useCallback(() => {
    fetchNotifications(true);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const handlePress = useCallback(
    (item: Notification) => {
      if (!item.actor?.username) return;
      if (!item.is_read) {
        markAsRead(item.id);
      }
      if (item.type === 'follow') {
        navigation.navigate('Profile', {username: item.actor.username});
      } else if (item.reference_id && item.reference_type === 'post') {
        navigation.navigate('PostDetail', {postId: item.reference_id});
      } else if (item.reference_id && item.reference_type === 'comment') {
        navigation.navigate('PostDetail', {postId: item.reference_id});
      }
    },
    [navigation, markAsRead],
  );

  const renderItem = useCallback(
    ({item}: {item: Notification}) => {
      const actor = item.actor;
      if (!actor?.username) return null;

      const iconInfo = NOTIFICATION_ICONS[item.type] || {
        icon: 'bell-outline',
        color: c.textMuted,
      };

      return (
        <TouchableOpacity
          style={[
            styles.item,
            {
              backgroundColor: item.is_read ? c.bgElevated : c.bgSecondary,
              borderBottomColor: c.border,
            },
          ]}
          onPress={() => handlePress(item)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`${actor.display_name} ${getNotificationText(item.type)}`}>
          <View style={styles.iconWrap}>
            <Avatar
              uri={actor.avatar_url}
              name={actor.display_name}
              size={40}
            />
            <View
              style={[
                styles.typeIcon,
                {backgroundColor: iconInfo.color, borderColor: item.is_read ? c.bgElevated : c.bgSecondary},
              ]}>
              <Icon name={iconInfo.icon} size={12} color="#fff" />
            </View>
          </View>
          <View style={styles.textWrap}>
            <Text style={[styles.text, {color: c.textPrimary}]} numberOfLines={2}>
              <Text style={styles.bold}>{actor.display_name}</Text>
              {' '}
              {getNotificationText(item.type)}
            </Text>
            <Text style={[styles.time, {color: c.textTertiary}]}>
              {formatRelativeTime(item.created_at)}
            </Text>
          </View>
          {!item.is_read && (
            <View style={[styles.unreadDot, {backgroundColor: c.accent}]} />
          )}
        </TouchableOpacity>
      );
    },
    [c, handlePress],
  );

  const unreadExists = notifications.some(n => !n.is_read && n.actor?.username);

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}>
      {unreadExists && (
        <TouchableOpacity
          style={[styles.markAllBtn, {borderBottomColor: c.border}]}
          onPress={markAllAsRead}>
          <Icon name="check-all" size={18} color={c.accent} />
          <Text style={[styles.markAllText, {color: c.accent}]}>
            Mark all as read
          </Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && notifications.length > 0}
            onRefresh={handleRefresh}
          />
        }
        onEndReached={() => {
          if (hasMore) fetchNotifications(false);
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="bell-outline"
              title="No notifications"
              subtitle="You're all caught up!"
            />
          ) : null
        }
        ListFooterComponent={
          isLoading && notifications.length > 0 ? (
            <ActivityIndicator style={sharedStyles.listLoader} size="small" />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  markAllText: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  iconWrap: {
    position: 'relative',
  },
  typeIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  textWrap: {
    flex: 1,
  },
  text: {
    fontSize: 14,
    fontFamily: fonts.body,
    lineHeight: 20,
  },
  bold: {
    fontFamily: fonts.bodySemiBold,
  },
  time: {
    fontSize: 12,
    fontFamily: fonts.body,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
