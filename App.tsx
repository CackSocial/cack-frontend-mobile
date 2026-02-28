import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import {useThemeStore} from './src/stores/themeStore';

export default function App() {
  const theme = useThemeStore(s => s.theme);
  const hydrateTheme = useThemeStore(s => s.hydrate);

  useEffect(() => {
    hydrateTheme();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme === 'dark' ? '#111827' : '#ffffff'}
      />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
