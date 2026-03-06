import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ExploreScreen from '../screens/explore/ExploreScreen';
import TagPostsScreen from '../screens/explore/TagPostsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import PostDetailScreen from '../screens/post/PostDetailScreen';
import QuotePostScreen from '../screens/post/QuotePostScreen';
import FollowersScreen from '../screens/profile/FollowersScreen';
import FollowingScreen from '../screens/profile/FollowingScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import {useStackScreenOptions} from './useStackScreenOptions';
import type {ExploreStackParamList} from './types';

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export default function ExploreStack() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Explore" component={ExploreScreen} options={{title: 'Explore'}} />
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
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{title: 'Post'}} />
      <Stack.Screen name="Followers" component={FollowersScreen} options={{title: 'Followers'}} />
      <Stack.Screen name="Following" component={FollowingScreen} options={{title: 'Following'}} />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{title: 'Edit profile'}}
      />
      <Stack.Screen
        name="QuotePost"
        component={QuotePostScreen}
        options={{title: 'Quote', presentation: 'modal'}}
      />
    </Stack.Navigator>
  );
}
