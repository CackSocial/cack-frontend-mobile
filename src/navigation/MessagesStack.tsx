import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MessagesScreen from '../screens/messages/MessagesScreen';
import ConversationScreen from '../screens/messages/ConversationScreen';
import {useColors, fonts} from '../theme';
import type {MessagesStackParamList} from './types';

const Stack = createNativeStackNavigator<MessagesStackParamList>();

export default function MessagesStack() {
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
