import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useColors, fonts, radii, spacing, typography} from '../../theme';

interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorBanner({message, onRetry}: Props) {
  const c = useColors();

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: c.dangerBg,
          borderColor: c.danger,
        },
      ]}>
      <Icon name="alert-circle-outline" size={18} color={c.danger} />
      <Text style={[styles.text, {color: c.danger}]} numberOfLines={3}>
        {message}
      </Text>
      {onRetry ? (
        <Pressable onPress={onRetry} accessibilityRole="button" accessibilityLabel="Retry">
          <Text style={[styles.retry, {color: c.danger}]}>Retry</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginHorizontal: spacing[4],
    marginTop: spacing[4],
    marginBottom: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  text: {
    flex: 1,
    fontSize: typography.sm,
    fontFamily: fonts.body,
    lineHeight: 20,
  },
  retry: {
    fontSize: typography.sm,
    fontFamily: fonts.bodyBold,
  },
});
