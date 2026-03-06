import React, {useState} from 'react';
import {KeyboardAvoidingView, Platform, StyleSheet, Alert, View} from 'react-native';
import PostComposer from '../../components/post/PostComposer';
import {createPost} from '../../api/posts';
import {usePostsStore} from '../../stores/postsStore';
import {useColors, spacing} from '../../theme';
import {getErrorMessage} from '../../utils/log';
import type {ImageAsset} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'CreatePost'>;

export default function CreatePostScreen({navigation}: Props) {
  const c = useColors();
  const prependPost = usePostsStore(s => s.prependPost);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (content: string, image?: ImageAsset) => {
    setLoading(true);
    try {
      const post = await createPost(content, image);
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
      <View style={styles.composerWrap}>
        <PostComposer onSubmit={handleSubmit} loading={loading} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing[4],
  },
  composerWrap: {
    paddingHorizontal: spacing[4],
  },
});
