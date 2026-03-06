import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import PostDetailScreen from '../screens/post/PostDetailScreen';
import {useStackScreenOptions} from './useStackScreenOptions';
import type {NotificationsStackParamList} from './types';

const Stack = createNativeStackNavigator<NotificationsStackParamList>();

export default function NotificationsStack() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{title: 'Notifications'}}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({route}) => ({title: `@${route.params.username}`})}
      />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{title: 'Post'}} />
    </Stack.Navigator>
  );
}
