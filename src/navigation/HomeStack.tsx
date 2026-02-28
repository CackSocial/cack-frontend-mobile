import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import PostDetailScreen from '../screens/post/PostDetailScreen';
import CreatePostScreen from '../screens/post/CreatePostScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import {useThemeStore} from '../stores/themeStore';
import type {HomeStackParamList} from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
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
        name="Home"
        component={HomeScreen}
        options={{title: 'SocialConnect'}}
      />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{title: 'Post'}}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{title: 'New Post', presentation: 'modal'}}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({route}) => ({title: `@${route.params.username}`})}
      />
    </Stack.Navigator>
  );
}
