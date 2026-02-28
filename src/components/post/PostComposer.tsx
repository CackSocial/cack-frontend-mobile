import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import type {ImageAsset} from '../../types';
import Button from '../common/Button';
import {MAX_POST_LENGTH, MAX_IMAGE_SIZE_MB} from '../../config';
import {useColors, fonts} from '../../theme';

interface Props {
  onSubmit: (content: string, image?: ImageAsset) => Promise<void>;
  loading?: boolean;
}

export default function PostComposer({onSubmit, loading}: Props) {
  const c = useColors();
  const [content, setContent] = useState('');
  const [image, setImage] = useState<ImageAsset | null>(null);

  const tags = content.match(/#(\w+)/g) || [];
  const charCount = content.length;
  const isOverLimit = charCount > MAX_POST_LENGTH;
  const canSubmit = (content.trim().length > 0 || image) && !isOverLimit;

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });
    if (result.assets && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        Alert.alert('Image too large', `Max file size is ${MAX_IMAGE_SIZE_MB}MB`);
        return;
      }
      setImage({
        uri: asset.uri!,
        fileName: asset.fileName,
        type: asset.type,
        fileSize: asset.fileSize,
      });
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    await onSubmit(content, image || undefined);
    setContent('');
    setImage(null);
  };

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: c.bgPrimary},
      ]}>
      <TextInput
        style={[
          styles.input,
          {
            color: c.textPrimary,
            backgroundColor: c.bgSecondary,
          },
        ]}
        placeholder="What's on your mind?"
        placeholderTextColor={c.textMuted}
        multiline
        maxLength={MAX_POST_LENGTH + 100}
        value={content}
        onChangeText={setContent}
        accessibilityLabel="Post content"
      />

      {image && (
        <View style={styles.imagePreview}>
          <Image source={{uri: image.uri}} style={styles.previewImage} />
          <TouchableOpacity
            style={styles.removeImage}
            onPress={() => setImage(null)}
            accessibilityLabel="Remove image">
            <Icon name="close-circle" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}

      {tags.length > 0 && (
        <View style={styles.tagRow}>
          {tags.map((tag, i) => (
            <Text key={i} style={[styles.tagPreview, {color: c.accent}]}>
              {tag}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.toolbar}>
        <TouchableOpacity
          onPress={pickImage}
          accessibilityRole="button"
          accessibilityLabel="Attach image">
          <Icon
            name="image-outline"
            size={24}
            color={c.textMuted}
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.charCount,
            {color: isOverLimit ? '#ef4444' : c.textMuted},
          ]}>
          {charCount}/{MAX_POST_LENGTH}
        </Text>
        <Button
          title="Post"
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={loading}
          size="sm"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    fontSize: 16,
    fontFamily: fonts.body,
    minHeight: 100,
    textAlignVertical: 'top',
    borderRadius: 12,
    padding: 12,
    lineHeight: 22,
  },
  imagePreview: {
    marginTop: 10,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tagPreview: {
    fontSize: 13,
    fontFamily: fonts.bodySemiBold,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  charCount: {
    fontSize: 12,
    fontFamily: fonts.body,
    flex: 1,
    textAlign: 'center',
  },
});
