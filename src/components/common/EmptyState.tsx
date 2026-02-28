import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useColors} from '../../theme';

interface Props {
  icon?: string;
  title: string;
  subtitle?: string;
}

export default function EmptyState({icon = 'inbox-outline', title, subtitle}: Props) {
  const c = useColors();

  return (
    <View style={styles.container}>
      <Icon
        name={icon}
        size={56}
        color={c.textMuted}
      />
      <Text style={[styles.title, {color: c.textSecondary}]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, {color: c.textTertiary}]}>
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
