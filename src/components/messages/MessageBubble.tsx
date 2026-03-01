import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import type {Message} from '../../types';
import {formatMessageTime} from '../../utils/format';
import {resolveImageUri} from '../../utils/resolveImageUri';
import {useColors} from '../../theme';

interface Props {
  message: Message;
  isOwn: boolean;
}

// REFACTORED: Wrapped in React.memo — rendered in message lists
export default React.memo(function MessageBubble({message, isOwn}: Props) {
  const c = useColors();

  const imageUri = resolveImageUri(message.image_url || undefined);

  const bubbleBg = isOwn ? c.accent : c.bgSecondary;
  const textColor = isOwn ? c.accentText : c.textPrimary;

  return (
    <View
      style={[
        styles.wrapper,
        {alignItems: isOwn ? 'flex-end' : 'flex-start'},
      ]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: bubbleBg,
            borderBottomRightRadius: isOwn ? 4 : 16,
            borderBottomLeftRadius: isOwn ? 16 : 4,
          },
        ]}>
        {imageUri && (
          <Image
            source={{uri: imageUri}}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel="Message image"
          />
        )}
        {message.content ? (
          <Text style={[styles.text, {color: textColor}]}>
            {message.content}
          </Text>
        ) : null}
        <View style={styles.meta}>
          <Text
            style={[
              styles.time,
              {color: isOwn ? c.accentText : c.textMuted, opacity: isOwn ? 0.6 : 1},
            ]}>
            {formatMessageTime(message.created_at)}
          </Text>
          {isOwn && message.read_at && (
            <Text
              style={[
                styles.read,
                {color: c.accentText, opacity: 0.6},
              ]}>
              ✓✓
            </Text>
          )}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    marginVertical: 2,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 10,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 2,
  },
  time: {
    fontSize: 11,
  },
  read: {
    fontSize: 11,
  },
});
