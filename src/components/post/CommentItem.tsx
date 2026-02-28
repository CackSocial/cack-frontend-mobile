import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import type {Comment} from '../../types';
import Avatar from '../common/Avatar';
import {formatRelativeTime} from '../../utils/format';
import {useColors, fonts} from '../../theme';

interface Props {
  comment: Comment;
  onAuthorPress?: () => void;
}

export default function CommentItem({comment, onAuthorPress}: Props) {
  const c = useColors();

  return (
    <View
      style={[
        styles.container,
        {borderBottomColor: c.border},
      ]}>
      <TouchableOpacity onPress={onAuthorPress}>
        <Avatar
          uri={comment.author.avatar_url}
          name={comment.author.display_name}
          size={32}
        />
      </TouchableOpacity>
      <View style={styles.body}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onAuthorPress}>
            <Text
              style={[
                styles.name,
                {color: c.textPrimary},
              ]}>
              {comment.author.display_name}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.time, {color: c.textTertiary}]}>
            {formatRelativeTime(comment.created_at)}
          </Text>
        </View>
        <Text style={[styles.content, {color: c.textSecondary}]}>
          {comment.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
  },
  body: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  time: {
    fontSize: 12,
    flex: 1,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
});
