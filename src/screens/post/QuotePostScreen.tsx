import React, {useState} from 'react';
import {View, Text, Image, KeyboardAvoidingView, Platform, StyleSheet, Alert} from 'react-native';
import PostComposer from '../../components/post/PostComposer';
import Avatar from '../../components/common/Avatar';
import Surface from '../../components/common/Surface';
import {quotePost} from '../../api/posts';
import {usePostsStore} from '../../stores/postsStore';
import {useColors, fonts, radii, spacing, typography} from '../../theme';
import {getErrorMessage} from '../../utils/log';
import {resolveImageUri} from '../../utils/resolveImageUri';
import type {ImageAsset, Post} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'QuotePost'>;

export default function QuotePostScreen({route, navigation}: Props) {
  const c = useColors();
  const prependPost = usePostsStore(s => s.prependPost);
  const [loading, setLoading] = useState(false);
  const originalPost: Post = route.params.post;

  const imageUri = resolveImageUri(originalPost.image_url || undefined);

  const handleSubmit = async (content: string, image?: ImageAsset) => {
    setLoading(true);
    try {
      const post = await quotePost(originalPost.id, content, image);
      prependPost(post);
      navigation.goBack();
    } catch (e: unknown) {
      Alert.alert('Error', getErrorMessage(e));
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: c.bgPrimary}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <Text style={[styles.title, {color: c.textPrimary}]}>Quote post</Text>
        <PostComposer
          onSubmit={handleSubmit}
          loading={loading}
          placeholder="Add your perspective..."
          submitLabel="Quote"
        />
        <Surface style={styles.preview}>
          <View style={styles.quotedHeader}>
            <Avatar uri={originalPost.author.avatar_url} name={originalPost.author.display_name} size={28} />
            <View style={styles.quotedMetaWrap}>
              <Text style={[styles.quotedName, {color: c.textPrimary}]}>{originalPost.author.display_name}</Text>
              <Text style={[styles.quotedMeta, {color: c.textTertiary}]}>@{originalPost.author.username}</Text>
            </View>
          </View>
          {originalPost.content ? (
            <Text style={[styles.quotedContent, {color: c.textSecondary}]} numberOfLines={4}>
              {originalPost.content}
            </Text>
          ) : null}
          {imageUri ? <Image source={{uri: imageUri}} style={styles.quotedImage} resizeMode="cover" /> : null}
        </Surface>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: spacing[4],
    gap: spacing[4],
  },
  title: {
    paddingHorizontal: spacing[4],
    fontSize: typography.xxl,
    fontFamily: fonts.displayBold,
  },
  preview: {
    marginHorizontal: spacing[4],
    gap: spacing[3],
  },
  quotedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  quotedMetaWrap: {
    gap: 2,
  },
  quotedName: {
    fontSize: typography.sm,
    fontFamily: fonts.bodySemiBold,
  },
  quotedMeta: {
    fontSize: typography.sm,
    fontFamily: fonts.body,
  },
  quotedContent: {
    fontSize: typography.sm,
    fontFamily: fonts.body,
    lineHeight: 20,
  },
  quotedImage: {
    width: '100%',
    height: 160,
    borderRadius: radii.xl,
  },
});
