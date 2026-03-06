import React, {useEffect, useMemo} from 'react';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ActivityIndicator, View} from 'react-native';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import {useAuthStore} from '../stores/authStore';
import {useNotificationsStore} from '../stores/notificationsStore';
import {useThemeStore} from '../stores/themeStore';
import {useWebSocket} from '../hooks/useWebSocket';
import {useColors} from '../theme';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function NavigationContent() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const fetchUnreadCount = useNotificationsStore(s => s.fetchUnreadCount);
  useWebSocket();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchUnreadCount]);

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
  const theme = useThemeStore(s => s.theme);
  const c = useColors();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Build navigation theme from app colors
  const navTheme = useMemo(
    () =>
      theme === 'dark'
        ? {
            ...DarkTheme,
            colors: {
              ...DarkTheme.colors,
              background: c.bgPrimary,
              card: c.bgPrimary,
              border: c.border,
              text: c.textPrimary,
              primary: c.accent,
            },
          }
        : {
            ...DefaultTheme,
            colors: {
              ...DefaultTheme.colors,
              background: c.bgPrimary,
              card: c.bgPrimary,
              border: c.border,
              text: c.textPrimary,
              primary: c.accent,
            },
          },
    [c, theme],
  );

  if (isLoading) {
    return (
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bgPrimary}}>
        <ActivityIndicator size="large" color={c.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <NavigationContent />
    </NavigationContainer>
  );
}
