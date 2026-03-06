import {Alert} from 'react-native';
import {useCallback} from 'react';
import {launchImageLibrary} from 'react-native-image-picker';
import {MAX_IMAGE_SIZE_MB} from '../config';
import type {ImageAsset} from '../types';
import {getErrorMessage, logError} from '../utils/log';

interface UseImagePickerOptions {
  context: string;
  onPicked: (image: ImageAsset) => void;
}

export function useImagePicker({context, onPicked}: UseImagePickerOptions) {
  return useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });
      const asset = result.assets?.[0];
      if (!asset) return;

      if (asset.fileSize && asset.fileSize > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        Alert.alert('Image too large', `Max file size is ${MAX_IMAGE_SIZE_MB}MB`);
        return;
      }

      if (!asset.uri) {
        Alert.alert('Error', 'Unable to access the selected image.');
        return;
      }

      onPicked({
        uri: asset.uri,
        fileName: asset.fileName,
        type: asset.type,
        fileSize: asset.fileSize,
      });
    } catch (error: unknown) {
      logError(context, error);
      Alert.alert('Error', getErrorMessage(error));
    }
  }, [context, onPicked]);
}
