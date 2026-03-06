import {useMemo} from 'react';
import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import {useColors, fonts} from '../theme';

export function useStackScreenOptions(): NativeStackNavigationOptions {
  const c = useColors();

  return useMemo(
    () => ({
      headerStyle: {backgroundColor: c.bgPrimary},
      contentStyle: {backgroundColor: c.bgPrimary},
      headerTintColor: c.textPrimary,
      headerShadowVisible: false,
      headerBackTitleVisible: false,
      headerTitleAlign: 'center',
      headerTitleStyle: {
        fontFamily: fonts.displayBold,
        fontSize: 18,
        color: c.textPrimary,
      },
    }),
    [c],
  );
}
