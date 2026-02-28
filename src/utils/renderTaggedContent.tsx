import React from 'react';
import {Text, StyleSheet} from 'react-native';
import type {TextStyle} from 'react-native';

const TAG_REGEX = /#(\w+)/g;

interface Props {
  content: string;
  style?: TextStyle;
  tagStyle?: TextStyle;
  onTagPress?: (tag: string) => void;
}

export default function RenderTaggedContent({
  content,
  style,
  tagStyle,
  onTagPress,
}: Props) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(TAG_REGEX.source, 'g');
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <Text key={`t-${lastIndex}`} style={style}>
          {content.slice(lastIndex, match.index)}
        </Text>,
      );
    }
    const tag = match[1];
    parts.push(
      <Text
        key={`tag-${match.index}`}
        style={[styles.tag, tagStyle]}
        onPress={() => onTagPress?.(tag)}>
        #{tag}
      </Text>,
    );
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
    color: '#3b82f6',
    fontWeight: '600',
  },
});
