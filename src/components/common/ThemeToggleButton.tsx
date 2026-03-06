import React from 'react';
import {Pressable, Text, StyleSheet, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useThemeStore} from '../../stores/themeStore';
import {useColors, fonts, radii, spacing, typography} from '../../theme';

export default function ThemeToggleButton() {
  const theme = useThemeStore(s => s.theme);
  const toggleTheme = useThemeStore(s => s.toggleTheme);
  const c = useColors();

  return (
    <Pressable
      onPress={toggleTheme}
      accessibilityRole="button"
      accessibilityLabel="Toggle theme"
      style={({pressed}) => [
        styles.button,
        {
          backgroundColor: c.bgElevated,
          borderColor: c.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={[styles.iconWrap, {backgroundColor: c.bgSecondary}]}>
        <Icon
          name={theme === 'dark' ? 'weather-night' : 'white-balance-sunny'}
          size={16}
          color={c.textPrimary}
        />
      </View>
      <Text style={[styles.label, {color: c.textPrimary}]}>
        {theme === 'dark' ? 'Dark' : 'Light'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    alignSelf: 'flex-start',
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: typography.sm,
    fontFamily: fonts.bodyMedium,
  },
});
