import React, {useMemo, useCallback} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {Route} from '@react-navigation/routers';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeStack from './HomeStack';
import ExploreStack from './ExploreStack';
import NotificationsStack from './NotificationsStack';
import MessagesStack from './MessagesStack';
import ProfileStack from './ProfileStack';
import {useMessagesStore} from '../stores/messagesStore';
import {useNotificationsStore} from '../stores/notificationsStore';
import {useColors, fonts, layout, spacing, typography} from '../theme';
import type {ConversationListItem} from '../types';
import type {MainTabParamList} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ROOT: Record<string, string> = {
  HomeTab: 'Home',
  ExploreTab: 'Explore',
  NotificationsTab: 'Notifications',
  MessagesTab: 'Messages',
  ProfileTab: 'Profile',
};

function TabBadge({count, color}: {count: number; color: string}) {
  if (count <= 0) return null;
  return (
    <View style={[badgeStyles.badge, {backgroundColor: color}]}> 
      <Text style={badgeStyles.text}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -12,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  text: {
    color: '#fff',
    fontSize: typography.xs,
    fontFamily: fonts.bodySemiBold,
    lineHeight: 14,
    includeFontPadding: false,
  },
});

export default function MainTabs() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const conversations = useMessagesStore(s => s.conversations);
  const unreadTotal = useMemo(
    () =>
      conversations.reduce(
        (sum: number, cv: ConversationListItem) => sum + cv.unread_count,
        0,
      ),
    [conversations],
  );
  const notifUnread = useNotificationsStore(s => s.unreadCount);

  const visibleStyle = useMemo(
    () => ({
      backgroundColor: c.bgElevated,
      borderTopColor: c.border,
      borderTopWidth: StyleSheet.hairlineWidth,
      height: layout.tabBarHeight + insets.bottom,
      paddingTop: spacing[2],
      paddingBottom: Math.max(insets.bottom, spacing[2]),
      elevation: 0,
      shadowOpacity: 0,
    }),
    [c, insets.bottom],
  );

  const getTabBarStyle = useCallback(
    (route: Partial<Route<string>>, tabName: string) => {
      const routeName = getFocusedRouteNameFromRoute(route);
      if (!routeName || routeName === TAB_ROOT[tabName]) {
        return visibleStyle;
      }
      return {display: 'none' as const};
    },
    [visibleStyle],
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
        tabBarActiveTintColor: c.textPrimary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarLabelStyle: {
          fontFamily: fonts.bodyMedium,
          fontSize: 11,
          marginBottom: 2,
        },
      }}
      screenListeners={({navigation, route}) => ({
        tabPress: () => {
          switch (route.name) {
            case 'HomeTab':
              navigation.navigate('HomeTab', {screen: 'Home'});
              break;
            case 'ExploreTab':
              navigation.navigate('ExploreTab', {screen: 'Explore'});
              break;
            case 'NotificationsTab':
              navigation.navigate('NotificationsTab', {screen: 'Notifications'});
              break;
            case 'MessagesTab':
              navigation.navigate('MessagesTab', {screen: 'Messages'});
              break;
            case 'ProfileTab':
              navigation.navigate('ProfileTab', {screen: 'Profile'});
              break;
          }
        },
      })}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={({route}) => ({
          title: 'Home',
          tabBarIcon: ({color, focused}) => (
            <Icon name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
          tabBarStyle: getTabBarStyle(route, 'HomeTab'),
        })}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStack}
        options={({route}) => ({
          title: 'Explore',
          tabBarIcon: ({color}) => <Icon name="magnify" size={22} color={color} />,
          tabBarStyle: getTabBarStyle(route, 'ExploreTab'),
        })}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsStack}
        options={({route}) => ({
          title: 'Alerts',
          tabBarIcon: ({color, focused}) => (
            <View>
              <Icon name={focused ? 'bell' : 'bell-outline'} size={22} color={color} />
              <TabBadge count={notifUnread} color={c.accent} />
            </View>
          ),
          tabBarStyle: getTabBarStyle(route, 'NotificationsTab'),
        })}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessagesStack}
        options={({route}) => ({
          title: 'Messages',
          tabBarIcon: ({color, focused}) => (
            <View>
              <Icon name={focused ? 'email' : 'email-outline'} size={22} color={color} />
              <TabBadge count={unreadTotal} color={c.accent} />
            </View>
          ),
          tabBarStyle: getTabBarStyle(route, 'MessagesTab'),
        })}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={({route}) => ({
          title: 'Profile',
          tabBarIcon: ({color, focused}) => (
            <Icon name={focused ? 'account' : 'account-outline'} size={22} color={color} />
          ),
          tabBarStyle: getTabBarStyle(route, 'ProfileTab'),
        })}
      />
    </Tab.Navigator>
  );
}
