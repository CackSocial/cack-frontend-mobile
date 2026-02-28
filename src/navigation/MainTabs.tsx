import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeStack from './HomeStack';
import ExploreStack from './ExploreStack';
import MessagesStack from './MessagesStack';
import ProfileStack from './ProfileStack';
import {useMessagesStore} from '../stores/messagesStore';
import {useColors, fonts} from '../theme';
import type {MainTabParamList} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  const c = useColors();
  const getUnreadTotal = useMessagesStore(s => s.getUnreadTotal);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
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
        },
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
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color, size}) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreStack}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({color, size}) => (
            <Icon name="compass-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={MessagesStack}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: ({color, size}) => (
            <Icon name="message-outline" size={size} color={color} />
          ),
          tabBarBadge:
            getUnreadTotal() > 0 ? getUnreadTotal() : undefined,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color, size}) => (
            <Icon name="account-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
