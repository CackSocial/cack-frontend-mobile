import React from 'react';
import {TouchableOpacity} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import FollowersScreen from '../screens/profile/FollowersScreen';
import FollowingScreen from '../screens/profile/FollowingScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import BookmarksScreen from '../screens/profile/BookmarksScreen';
import PostDetailScreen from '../screens/post/PostDetailScreen';
import QuotePostScreen from '../screens/post/QuotePostScreen';
import {useColors} from '../theme';
import {useStackScreenOptions} from './useStackScreenOptions';
import type {ProfileStackParamList} from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  const c = useColors();
  const screenOptions = useStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({navigation}) => ({
          title: 'Profile',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              accessibilityLabel="Settings"
              style={{padding: 4}}>
              <Icon name="cog-outline" size={22} color={c.textPrimary} />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{title: 'Edit profile'}}
      />
      <Stack.Screen name="Followers" component={FollowersScreen} options={{title: 'Followers'}} />
      <Stack.Screen name="Following" component={FollowingScreen} options={{title: 'Following'}} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{title: 'Settings'}} />
      <Stack.Screen name="Bookmarks" component={BookmarksScreen} options={{title: 'Bookmarks'}} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{title: 'Post'}} />
      <Stack.Screen
        name="QuotePost"
        component={QuotePostScreen}
        options={{title: 'Quote', presentation: 'modal'}}
      />
    </Stack.Navigator>
  );
}
