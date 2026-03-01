import React from 'react';
import {Text, StyleSheet} from 'react-native';
import type {TextStyle} from 'react-native';
import {useColors, fonts} from '../theme';

const TAGGED_REGEX = /#(\w+)|@(\w+)/g;

interface Props {
  content: string;
  style?: TextStyle;
  tagStyle?: TextStyle;
  onTagPress?: (tag: string) => void;
  onMentionPress?: (username: string) => void;
}

export default function RenderTaggedContent({
  content,
  style,
  tagStyle,
  onTagPress,
  onMentionPress,
}: Props) {
  const c = useColors();
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(TAGGED_REGEX.source, 'g');
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <Text key={`t-${lastIndex}`} style={style}>
          {content.slice(lastIndex, match.index)}
        </Text>,
      );
    }
    if (match[1]) {
      // Hashtag
      const tag = match[1];
      parts.push(
        <Text
          key={`tag-${match.index}`}
          style={[styles.tag, {color: c.accent}, tagStyle]}
          onPress={() => onTagPress?.(tag)}>
          #{tag}
        </Text>,
      );
    } else if (match[2]) {
      // @mention
      const username = match[2];
      parts.push(
        <Text
          key={`mention-${match.index}`}
          style={[styles.tag, {color: c.accent}, tagStyle]}
          onPress={() => onMentionPress?.(username)}>
          @{username}
        </Text>,
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push(
      <Text key={`t-${lastIndex}`} style={style}>
        {content.slice(lastIndex)}
      </Text>,
    );
  }

  return <Text style={style}>{parts}</Text>;
}

const styles = StyleSheet.create({
  tag: {
    fontFamily: fonts.bodySemiBold,
  },
});
