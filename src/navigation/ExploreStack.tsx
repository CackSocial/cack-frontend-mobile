import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ExploreScreen from '../screens/explore/ExploreScreen';
import TagPostsScreen from '../screens/explore/TagPostsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import {useThemeStore} from '../stores/themeStore';
import type {ExploreStackParamList} from './types';

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export default function ExploreStack() {
  const theme = useThemeStore(s => s.theme);
  const isDark = theme === 'dark';

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: isDark ? '#111827' : '#ffffff'},
        headerTintColor: isDark ? '#f3f4f6' : '#111827',
        headerShadowVisible: false,
      }}>
      <Stack.Screen
        name="Explore"
        component={ExploreScreen}
        options={{title: 'Explore'}}
      />
      <Stack.Screen
        name="TagPosts"
        component={TagPostsScreen}
        options={({route}) => ({title: `#${route.params.tagName}`})}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({route}) => ({title: `@${route.params.username}`})}
      />
    </Stack.Navigator>
  );
}
