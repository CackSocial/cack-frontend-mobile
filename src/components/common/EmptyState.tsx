import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useThemeStore} from '../../stores/themeStore';

interface Props {
  icon?: string;
  title: string;
  subtitle?: string;
}

export default function EmptyState({icon = 'inbox-outline', title, subtitle}: Props) {
  const theme = useThemeStore(s => s.theme);
  const isDark = theme === 'dark';

  return (
    <View style={styles.container}>
      <Icon
        name={icon}
        size={56}
        color={isDark ? '#4b5563' : '#9ca3af'}
      />
      <Text style={[styles.title, {color: isDark ? '#d1d5db' : '#374151'}]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, {color: isDark ? '#6b7280' : '#9ca3af'}]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
});
