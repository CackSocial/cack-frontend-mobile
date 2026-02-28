import React, {useMemo, useCallback} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeStack from './HomeStack';
import ExploreStack from './ExploreStack';
import MessagesStack from './MessagesStack';
import ProfileStack from './ProfileStack';
import {useMessagesStore} from '../stores/messagesStore';
import {useColors, fonts} from '../theme';
import type {ConversationListItem} from '../types';
import type {MainTabParamList} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ROOT: Record<string, string> = {
  HomeTab: 'Home',
  ExploreTab: 'Explore',
  MessagesTab: 'Messages',
  ProfileTab: 'Profile',
};

export default function MainTabs() {
  const c = useColors();
  const conversations = useMessagesStore(s => s.conversations);
  const unreadTotal = useMemo(
    () => conversations.reduce((sum: number, c: ConversationListItem) => sum + c.unread_count, 0),
    [conversations],
  );

  const baseTabBarStyle = useMemo(
    () => ({
      position: 'absolute' as const,
      left: 12,
      right: 12,
      bottom: 12,
      height: 64,
      borderRadius: 18,
      backgroundColor: c.bgElevated,
      borderTopColor: c.border,
      borderTopWidth: 1,
      paddingTop: 8,
      paddingBottom: 8,
    }),
    [c],
  );

  const getTabBarStyle = useCallback(
    (route: any, tabName: string) => {
      const routeName = getFocusedRouteNameFromRoute(route);
      // undefined or root screen name → show tab bar
      if (!routeName || routeName === TAB_ROOT[tabName]) {
        return baseTabBarStyle;
      }
      // Nested screen → hide tab bar
      return {display: 'none' as const};
    },
    [baseTabBarStyle],
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: {borderRadius: 12},
        tabBarLabelStyle: {
          fontFamily: fonts.bodySemiBold,
          fontSize: 11,
        },
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.textMuted,
        tabBarActiveBackgroundColor: c.bgSecondary,
        tabBarBadgeStyle: {
          backgroundColor: c.accent,
          color: c.accentText,
          fontFamily: fonts.bodySemiBold,
        },
      }}
      screenListeners={({navigation, route}) => ({
        tabPress: () => {
          // Pop nested stacks to their root when tab is pressed
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
          tabBarLabel: 'Home',
          tabBarIcon: ({color, size}) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
          tabBarStyle: getTabBarStyle(route, 'HomeTab'),
        })}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStack}
        options={({route}) => ({
          tabBarLabel: 'Explore',
          tabBarIcon: ({color, size}) => (
            <Icon name="compass-outline" size={size} color={color} />
          ),
          tabBarStyle: getTabBarStyle(route, 'ExploreTab'),
        })}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessagesStack}
        options={({route}) => ({
          tabBarLabel: 'Messages',
          tabBarIcon: ({color, size}) => (
            <Icon name="message-outline" size={size} color={color} />
          ),
          tabBarBadge:
            unreadTotal > 0 ? unreadTotal : undefined,
          tabBarStyle: getTabBarStyle(route, 'MessagesTab'),
        })}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={({route}) => ({
          tabBarLabel: 'Profile',
          tabBarIcon: ({color, size}) => (
            <Icon name="account-outline" size={size} color={color} />
          ),
          tabBarStyle: getTabBarStyle(route, 'ProfileTab'),
        })}
      />
    </Tab.Navigator>
  );
}
