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
import {updateMe} from '../../api/users';
import {useAuthStore} from '../../stores/authStore';
import {useColors} from '../../theme';
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
      const updated = await updateMe(
        {display_name: displayName, bio},
        avatar || undefined,
      );
      updateUser(updated);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, {backgroundColor: c.bgPrimary}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        {/* Avatar picker */}
        <TouchableOpacity
          style={styles.avatarWrap}
          onPress={pickAvatar}
          accessibilityRole="button"
          accessibilityLabel="Change profile picture">
          {avatar ? (
            <Image
              source={{uri: avatar.uri}}
              style={styles.avatarImage}
            />
          ) : (
            <Avatar
              uri={user?.avatar_url}
              name={user?.display_name}
              size={96}
            />
          )}
          <View style={[styles.cameraIcon, {backgroundColor: c.accent, borderColor: c.bgPrimary}]}>
            <Icon name="camera" size={18} color={c.accentText} />
          </View>
        </TouchableOpacity>

        <Input
          label="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
          accessibilityLabel="Display name"
        />
        <Input
          label="Bio"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          style={{minHeight: 100, textAlignVertical: 'top'}}
          accessibilityLabel="Bio"
        />
        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={loading}
          disabled={!displayName.trim()}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  content: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  avatarWrap: {
    alignSelf: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});
