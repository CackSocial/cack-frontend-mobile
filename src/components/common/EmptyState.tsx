import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useColors, fonts, radii, spacing, typography} from '../../theme';

interface Props {
  icon?: string;
  title: string;
  subtitle?: string;
}

export default function EmptyState({icon = 'inbox-outline', title, subtitle}: Props) {
  const c = useColors();

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, {backgroundColor: c.bgSecondary, borderColor: c.border}]}> 
        <Icon name={icon} size={28} color={c.textTertiary} />
      </View>
      <Text style={[styles.title, {color: c.textPrimary}]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, {color: c.textSecondary}]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[12],
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: radii.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  title: {
    fontSize: typography.xl,
    fontFamily: fonts.displayBold,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing[2],
    fontSize: typography.sm,
    fontFamily: fonts.body,
    lineHeight: 20,
    textAlign: 'center',
    maxWidth: 320,
  },
});
