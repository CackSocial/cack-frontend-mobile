import React, {useState} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {launchImageLibrary} from 'react-native-image-picker';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Surface from '../../components/common/Surface';
import {updateMe} from '../../api/users';
import {useAuthStore} from '../../stores/authStore';
import {useColors, spacing, layout} from '../../theme';
import {getErrorMessage} from '../../utils/log';
import {MAX_IMAGE_SIZE_MB} from '../../config';
import type {ImageAsset} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export default function EditProfileScreen({navigation}: Props) {
  const c = useColors();
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState<ImageAsset | null>(null);
  const [loading, setLoading] = useState(false);

  const pickAvatar = async () => {
    const result = await launchImageLibrary({mediaType: 'photo', quality: 0.8});
    if (result.assets && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        Alert.alert('Image too large', `Max file size is ${MAX_IMAGE_SIZE_MB}MB`);
        return;
      }
      setAvatar({
        uri: asset.uri!,
        fileName: asset.fileName,
        type: asset.type,
        fileSize: asset.fileSize,
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updated = await updateMe({display_name: displayName, bio}, avatar || undefined);
      updateUser(updated);
      navigation.goBack();
    } catch (e: unknown) {
      Alert.alert('Error', getErrorMessage(e));
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: c.bgPrimary}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Surface elevated style={styles.card}>
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={pickAvatar}
            accessibilityRole="button"
            accessibilityLabel="Change profile picture">
            {avatar ? <Image source={{uri: avatar.uri}} style={styles.avatarImage} /> : <Avatar uri={user?.avatar_url} name={user?.display_name} size={104} />}
            <View style={[styles.cameraIcon, {backgroundColor: c.accent, borderColor: c.bgElevated}]}>
              <Icon name="camera-outline" size={18} color={c.accentText} />
            </View>
          </TouchableOpacity>

          <Input label="Display name" value={displayName} onChangeText={setDisplayName} accessibilityLabel="Display name" />
          <Input
            label="Bio"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            style={styles.bioInput}
            accessibilityLabel="Bio"
          />
          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={loading}
            disabled={!displayName.trim()}
            fullWidth
          />
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[5],
    gap: spacing[4],
  },
  card: {
    gap: spacing[4],
  },
  avatarWrap: {
    alignSelf: 'center',
    marginBottom: spacing[2],
  },
  avatarImage: {
    width: 104,
    height: 104,
    borderRadius: 52,
  },
  cameraIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  bioInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
