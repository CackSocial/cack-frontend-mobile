import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MessagesScreen from '../screens/messages/MessagesScreen';
import NewConversationScreen from '../screens/messages/NewConversationScreen';
import ConversationScreen from '../screens/messages/ConversationScreen';
import {useStackScreenOptions} from './useStackScreenOptions';
import type {MessagesStackParamList} from './types';

const Stack = createNativeStackNavigator<MessagesStackParamList>();

export default function MessagesStack() {
  const screenOptions = useStackScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Messages" component={MessagesScreen} options={{title: 'Messages'}} />
      <Stack.Screen
        name="NewConversation"
        component={NewConversationScreen}
        options={{title: 'New message'}}
      />
      <Stack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={({route}) => ({title: route.params.displayName})}
      />
    </Stack.Navigator>
  );
}
