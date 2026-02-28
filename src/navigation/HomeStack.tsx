import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import PostDetailScreen from '../screens/post/PostDetailScreen';
import CreatePostScreen from '../screens/post/CreatePostScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import {useColors} from '../theme';
import type {HomeStackParamList} from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  const c = useColors();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: c.bgPrimary},
        headerTintColor: c.textPrimary,
        headerShadowVisible: false,
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{title: 'Cack'}}
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
