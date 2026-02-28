import React from 'react';
import {TouchableOpacity} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import FollowersScreen from '../screens/profile/FollowersScreen';
import FollowingScreen from '../screens/profile/FollowingScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import {useThemeStore} from '../stores/themeStore';
import type {ProfileStackParamList} from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
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
        name="Profile"
        component={ProfileScreen}
        options={({navigation: nav}) => ({
          title: 'Profile',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => nav.navigate('Settings')}
              accessibilityLabel="Settings">
              <Icon
                name="cog-outline"
                size={24}
                color={isDark ? '#f3f4f6' : '#111827'}
              />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{title: 'Edit Profile'}}
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
        name="Settings"
        component={SettingsScreen}
        options={{title: 'Settings'}}
      />
    </Stack.Navigator>
  );
}
