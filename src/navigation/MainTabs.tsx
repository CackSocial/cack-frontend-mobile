import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeStack from './HomeStack';
import ExploreStack from './ExploreStack';
import MessagesStack from './MessagesStack';
import ProfileStack from './ProfileStack';
import Badge from '../components/common/Badge';
import {useMessagesStore} from '../stores/messagesStore';
import {useColors} from '../theme';
import type {MainTabParamList} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  const c = useColors();
  const getUnreadTotal = useMessagesStore(s => s.getUnreadTotal);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: c.bgPrimary,
          borderTopColor: c.border,
        },
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.textMuted,
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
