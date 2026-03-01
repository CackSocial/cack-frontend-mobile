import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import PostComposer from '../../components/post/PostComposer';
import Avatar from '../../components/common/Avatar';
import {quotePost} from '../../api/posts';
import {usePostsStore} from '../../stores/postsStore';
import {useColors, fonts} from '../../theme';
import {UPLOADS_URL} from '../../config';
import type {ImageAsset, Post} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'QuotePost'>;

export default function QuotePostScreen({route, navigation}: Props) {
  const c = useColors();
  const prependPost = usePostsStore(s => s.prependPost);
  const [loading, setLoading] = useState(false);
  const originalPost: Post = route.params.post;

  const imageUri = originalPost.image_url
    ? originalPost.image_url.startsWith('http')
      ? originalPost.image_url
      : `${UPLOADS_URL}/${originalPost.image_url}`
    : null;

  const handleSubmit = async (content: string, image?: ImageAsset) => {
    setLoading(true);
    try {
      const post = await quotePost(originalPost.id, content, image);
      prependPost(post);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create quote');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: c.bgPrimary}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <PostComposer onSubmit={handleSubmit} loading={loading} placeholder="Add your thoughts..." />
      {/* Quoted post preview */}
      <View style={[styles.quotedPost, {borderColor: c.border, backgroundColor: c.bgSecondary}]}>
        <View style={styles.quotedHeader}>
          <Avatar
            uri={originalPost.author.avatar_url}
            name={originalPost.author.display_name}
            size={24}
          />
          <Text style={[styles.quotedName, {color: c.textPrimary}]}>
            {originalPost.author.display_name}
          </Text>
          <Text style={[styles.quotedMeta, {color: c.textTertiary}]}>
            @{originalPost.author.username}
          </Text>
        </View>
        {originalPost.content ? (
          <Text
            style={[styles.quotedContent, {color: c.textSecondary}]}
            numberOfLines={4}>
            {originalPost.content}
          </Text>
        ) : null}
        {imageUri && (
          <Image
            source={{uri: imageUri}}
            style={styles.quotedImage}
            resizeMode="cover"
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  quotedPost: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  quotedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  quotedName: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
  },
  quotedMeta: {
    fontSize: 13,
    fontFamily: fonts.body,
  },
  quotedContent: {
    fontSize: 14,
    fontFamily: fonts.body,
    lineHeight: 20,
  },
  quotedImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginTop: 8,
  },
});
