import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ExploreScreen from '../screens/explore/ExploreScreen';
import TagPostsScreen from '../screens/explore/TagPostsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import {useColors, fonts} from '../theme';
import type {ExploreStackParamList} from './types';

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export default function ExploreStack() {
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
