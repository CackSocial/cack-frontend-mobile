import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import type {Comment} from '../../types';
import Avatar from '../common/Avatar';
import RenderTaggedContent from '../../utils/renderTaggedContent';
import {formatRelativeTime} from '../../utils/format';
import {useColors, fonts, radii, spacing, typography, elevation} from '../../theme';

interface Props {
  comment: Comment;
  onAuthorPress?: () => void;
  onMentionPress?: (username: string) => void;
  onTagPress?: (tag: string) => void;
}

export default React.memo(function CommentItem({comment, onAuthorPress, onMentionPress, onTagPress}: Props) {
  const c = useColors();

  return (
    <View style={[styles.container, elevation.card, {backgroundColor: c.bgElevated, borderColor: c.border}]}> 
      <TouchableOpacity onPress={onAuthorPress}>
        <Avatar uri={comment.author.avatar_url} name={comment.author.display_name} size={36} />
      </TouchableOpacity>
      <View style={styles.body}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onAuthorPress}>
            <Text style={[styles.name, {color: c.textPrimary}]}>{comment.author.display_name}</Text>
          </TouchableOpacity>
          <Text style={[styles.time, {color: c.textTertiary}]}>{formatRelativeTime(comment.created_at)}</Text>
        </View>
        <RenderTaggedContent
          content={comment.content}
          style={{color: c.textSecondary, fontSize: typography.sm, lineHeight: 20, fontFamily: fonts.body}}
          tagStyle={{color: c.textPrimary, fontFamily: fonts.bodySemiBold}}
          onMentionPress={onMentionPress}
          onTagPress={onTagPress}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing[3],
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    padding: spacing[4],
    borderWidth: 1,
    borderRadius: radii.xxl,
  },
  body: {
    flex: 1,
    gap: spacing[2],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    fontSize: typography.sm,
  },
  time: {
    fontSize: typography.xs,
    fontFamily: fonts.body,
  },
});
