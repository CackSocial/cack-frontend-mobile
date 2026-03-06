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
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Surface from '../../components/common/Surface';
import {updateMe} from '../../api/users';
import {useAuthStore} from '../../stores/authStore';
import {useColors, layout, sizes, spacing} from '../../theme';
import {getErrorMessage} from '../../utils/log';
import type {ImageAsset} from '../../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '../../navigation/types';
import {useImagePicker} from '../../hooks/useImagePicker';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export default function EditProfileScreen({navigation}: Props) {
  const c = useColors();
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState<ImageAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const pickAvatar = useImagePicker({
    context: 'EditProfileScreen:pickAvatar',
    onPicked: setAvatar,
  });

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
            {avatar ? (
              <Image source={{uri: avatar.uri}} style={styles.avatarImage} />
            ) : (
              <Avatar uri={user?.avatar_url} name={user?.display_name} size={sizes.avatar.hero} />
            )}
            <View style={[styles.cameraIcon, {backgroundColor: c.accent, borderColor: c.bgElevated}]}>
              <Icon name="camera-outline" size={sizes.icon.sm} color={c.accentText} />
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
    width: sizes.avatar.hero,
    height: sizes.avatar.hero,
    borderRadius: sizes.avatar.hero / 2,
  },
  cameraIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: sizes.iconButton.md,
    height: sizes.iconButton.md,
    borderRadius: sizes.iconButton.md / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  bioInput: {
    minHeight: sizes.editProfile.bioMinHeight,
    textAlignVertical: 'top',
  },
});
