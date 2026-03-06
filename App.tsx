import React, {Component, useEffect} from 'react';
import {StatusBar, View, Text, TouchableOpacity} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import {useThemeStore} from './src/stores/themeStore';

class ErrorBoundary extends Component<
  {children: React.ReactNode},
  {hasError: boolean}
> {
  state = {hasError: false};

  static getDerivedStateFromError() {
    return {hasError: true};
  }

  componentDidCatch(error: Error) {
    if (__DEV__) {
      console.warn('[ErrorBoundary]', error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24}}>
          <Text style={{fontSize: 18, fontWeight: '600', marginBottom: 8}}>
            Something went wrong
          </Text>
          <TouchableOpacity onPress={() => this.setState({hasError: false})}>
            <Text style={{fontSize: 16, color: '#6C5CE7'}}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const theme = useThemeStore(s => s.theme);
  const hydrateTheme = useThemeStore(s => s.hydrate);

  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar
          barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme === 'dark' ? '#0a0a0a' : '#fafafa'}
        />
        <RootNavigator />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
