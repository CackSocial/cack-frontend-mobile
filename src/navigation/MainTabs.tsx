import React, {useMemo, useCallback} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeStack from './HomeStack';
import ExploreStack from './ExploreStack';
import NotificationsStack from './NotificationsStack';
import MessagesStack from './MessagesStack';
import ProfileStack from './ProfileStack';
import {useMessagesStore} from '../stores/messagesStore';
import {useNotificationsStore} from '../stores/notificationsStore';
import {useColors, fonts} from '../theme';
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
      <Text style={badgeStyles.text}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  text: {
    color: '#fff',
    fontSize: 11,
    fontFamily: fonts.bodySemiBold,
    lineHeight: 14,
  },
});

export default function MainTabs() {
  const c = useColors();
  const conversations = useMessagesStore(s => s.conversations);
  const unreadTotal = useMemo(
    () => conversations.reduce((sum: number, cv: ConversationListItem) => sum + cv.unread_count, 0),
    [conversations],
  );
  const notifUnread = useNotificationsStore(s => s.unreadCount);

  const visibleStyle = useMemo(
    () => ({
      backgroundColor: c.bgPrimary,
      borderTopColor: c.border,
      borderTopWidth: StyleSheet.hairlineWidth,
      height: 52,
      elevation: 0,
      shadowOpacity: 0,
    }),
    [c],
  );

  const getTabBarStyle = useCallback(
    (route: any, tabName: string) => {
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
        tabBarShowLabel: false,
        tabBarActiveTintColor: c.textPrimary,
        tabBarInactiveTintColor: c.textMuted,
      }}
      screenListeners={({navigation, route}) => ({
        tabPress: () => {
          const root = TAB_ROOT[route.name];
          if (root) {
            navigation.navigate(route.name as any, {screen: root});
          }
        },
      })}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={({route}) => ({
          tabBarIcon: ({color, focused}) => (
            <Icon name={focused ? 'home' : 'home-outline'} size={26} color={color} />
          ),
          tabBarStyle: getTabBarStyle(route, 'HomeTab'),
        })}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStack}
        options={({route}) => ({
          tabBarIcon: ({color}) => (
            <Icon name="magnify" size={26} color={color} />
          ),
          tabBarStyle: getTabBarStyle(route, 'ExploreTab'),
        })}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsStack}
        options={({route}) => ({
          tabBarIcon: ({color, focused}) => (
            <View>
              <Icon name={focused ? 'bell' : 'bell-outline'} size={26} color={color} />
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
          tabBarIcon: ({color, focused}) => (
            <View>
              <Icon name={focused ? 'email' : 'email-outline'} size={26} color={color} />
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
          tabBarIcon: ({color, focused}) => (
            <Icon name={focused ? 'account' : 'account-outline'} size={26} color={color} />
          ),
          tabBarStyle: getTabBarStyle(route, 'ProfileTab'),
        })}
      />
    </Tab.Navigator>
  );
}
