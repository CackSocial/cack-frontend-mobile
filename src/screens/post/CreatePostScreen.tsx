import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import PostComposer from '../../components/post/PostComposer';
import {createPost} from '../../api/posts';
import {usePostsStore} from '../../stores/postsStore';
import {useThemeStore} from '../../stores/themeStore';
import type {ImageAsset} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'CreatePost'>;

export default function CreatePostScreen({navigation}: Props) {
  const theme = useThemeStore(s => s.theme);
  const isDark = theme === 'dark';
  const prependPost = usePostsStore(s => s.prependPost);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (content: string, image?: ImageAsset) => {
    setLoading(true);
    try {
      const post = await createPost(content, image);
      prependPost(post);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create post');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: isDark ? '#111827' : '#ffffff'}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <PostComposer onSubmit={handleSubmit} loading={loading} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
