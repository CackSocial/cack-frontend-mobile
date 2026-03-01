import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import type {Comment} from '../../types';
import Avatar from '../common/Avatar';
import RenderTaggedContent from '../../utils/renderTaggedContent';
import {formatRelativeTime} from '../../utils/format';
import {useColors, fonts} from '../../theme';

interface Props {
  comment: Comment;
  onAuthorPress?: () => void;
  onMentionPress?: (username: string) => void;
  onTagPress?: (tag: string) => void;
}

// REFACTORED: Wrapped in React.memo — rendered in comment lists
export default React.memo(function CommentItem({comment, onAuthorPress, onMentionPress, onTagPress}: Props) {
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
        <RenderTaggedContent
          content={comment.content}
          style={{color: c.textSecondary, fontSize: 14, lineHeight: 20, fontFamily: fonts.body}}
          tagStyle={{color: c.accent, fontFamily: fonts.bodySemiBold}}
          onMentionPress={onMentionPress}
          onTagPress={onTagPress}
        />
      </View>
    </View>
  );
});const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
});
