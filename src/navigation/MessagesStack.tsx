import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MessagesScreen from '../screens/messages/MessagesScreen';
import ConversationScreen from '../screens/messages/ConversationScreen';
import {useThemeStore} from '../stores/themeStore';
import type {MessagesStackParamList} from './types';

const Stack = createNativeStackNavigator<MessagesStackParamList>();

export default function MessagesStack() {
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
        name="Messages"
        component={MessagesScreen}
        options={{title: 'Messages'}}
      />
      <Stack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={({route}) => ({title: route.params.displayName})}
      />
    </Stack.Navigator>
  );
}
