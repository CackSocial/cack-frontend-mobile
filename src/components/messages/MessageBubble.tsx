import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import type {Message} from '../../types';
import {formatMessageTime} from '../../utils/format';
import {resolveImageUri} from '../../utils/resolveImageUri';
import {useColors, fonts, radii, spacing, typography} from '../../theme';

interface Props {
  message: Message;
  isOwn: boolean;
}

export default React.memo(function MessageBubble({message, isOwn}: Props) {
  const c = useColors();
  const imageUri = resolveImageUri(message.image_url || undefined);

  return (
    <View style={[styles.wrapper, {alignItems: isOwn ? 'flex-end' : 'flex-start'}]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: isOwn ? c.accent : c.bgElevated,
            borderColor: isOwn ? c.accent : c.border,
          },
        ]}>
        {imageUri ? (
          <Image source={{uri: imageUri}} style={styles.image} resizeMode="cover" accessibilityLabel="Message image" />
        ) : null}
        {message.content ? (
          <Text style={[styles.text, {color: isOwn ? c.accentText : c.textPrimary}]}>
            {message.content}
          </Text>
        ) : null}
        <View style={styles.meta}>
          <Text style={[styles.time, {color: isOwn ? c.accentText : c.textTertiary}]}> 
            {formatMessageTime(message.created_at)}
          </Text>
          {isOwn && message.read_at ? (
            <Text style={[styles.read, {color: c.accentText}]}>Seen</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing[4],
    marginTop: spacing[2],
  },
  bubble: {
    maxWidth: '84%',
    borderWidth: 1,
    borderRadius: radii.xxl,
    padding: spacing[3],
    gap: spacing[2],
  },
  text: {
    fontSize: typography.base,
    fontFamily: fonts.body,
    lineHeight: 22,
  },
  image: {
    width: 220,
    height: 164,
    borderRadius: radii.xl,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  time: {
    fontSize: typography.xs,
    fontFamily: fonts.body,
  },
  read: {
    fontSize: typography.xs,
    fontFamily: fonts.bodyMedium,
  },
});
