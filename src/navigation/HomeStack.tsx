import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screens/home/HomeScreen';
import PostDetailScreen from '../screens/post/PostDetailScreen';
import CreatePostScreen from '../screens/post/CreatePostScreen';
import QuotePostScreen from '../screens/post/QuotePostScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import FollowersScreen from '../screens/profile/FollowersScreen';
import FollowingScreen from '../screens/profile/FollowingScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import {useColors, fonts} from '../theme';
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
        headerTitleStyle: {fontFamily: fonts.display},
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{title: 'Cack Social'}}
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
        name="QuotePost"
        component={QuotePostScreen}
        options={{title: 'Quote Post', presentation: 'modal'}}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({route}) => ({title: `@${route.params.username}`})}
      />
      <Stack.Screen
        name="Followers"
        component={FollowersScreen}
        options={{title: 'Followers'}}
      />
      <Stack.Screen
        name="Following"
        component={FollowingScreen}
        options={{title: 'Following'}}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{title: 'Edit Profile'}}
      />
    </Stack.Navigator>
  );
}
