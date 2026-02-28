import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ActivityIndicator, View} from 'react-native';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import {useAuthStore} from '../stores/authStore';
import {useWebSocket} from '../hooks/useWebSocket';
import {useColors} from '../theme';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function NavigationContent() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  useWebSocket();

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const isLoading = useAuthStore(s => s.isLoading);
  const hydrate = useAuthStore(s => s.hydrate);
  const c = useColors();

  useEffect(() => {
    hydrate();
  }, []);

  if (isLoading) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <ActivityIndicator size="large" color={c.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <NavigationContent />
    </NavigationContainer>
  );
}
