import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MessagesScreen from '../screens/messages/MessagesScreen';
import NewConversationScreen from '../screens/messages/NewConversationScreen';
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
        headerTitleStyle: {fontFamily: fonts.bodySemiBold, fontSize: 18},
      }}>
      <Stack.Screen
        name="Messages"
        component={MessagesScreen}
        options={{title: 'Messages'}}
      />
      <Stack.Screen
        name="NewConversation"
        component={NewConversationScreen}
        options={{title: 'New Message'}}
      />
      <Stack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={({route}) => ({title: route.params.displayName})}
      />
    </Stack.Navigator>
  );
}
