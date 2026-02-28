import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import type {Message} from '../../types';
import {formatMessageTime} from '../../utils/format';
import {UPLOADS_URL} from '../../config';
import {useThemeStore} from '../../stores/themeStore';

interface Props {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({message, isOwn}: Props) {
  const theme = useThemeStore(s => s.theme);
  const isDark = theme === 'dark';

  const imageUri = message.image_url
    ? message.image_url.startsWith('http')
      ? message.image_url
      : `${UPLOADS_URL}/${message.image_url}`
    : null;

  const bubbleBg = isOwn
    ? '#3b82f6'
    : isDark
    ? '#374151'
    : '#f3f4f6';

  const textColor = isOwn ? '#ffffff' : isDark ? '#f3f4f6' : '#111827';

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
              {color: isOwn ? 'rgba(255,255,255,0.7)' : isDark ? '#6b7280' : '#9ca3af'},
            ]}>
            {formatMessageTime(message.created_at)}
          </Text>
          {isOwn && message.read_at && (
            <Text
              style={[
                styles.read,
                {color: 'rgba(255,255,255,0.7)'},
              ]}>
              ✓✓
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

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
