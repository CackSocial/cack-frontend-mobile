import React, {useState} from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import {updateMe} from '../../api/users';
import {useAuthStore} from '../../stores/authStore';
import {useColors} from '../../theme';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export default function EditProfileScreen({navigation}: Props) {
  const c = useColors();
  const user = useAuthStore(s => s.user);
  const updateUser = useAuthStore(s => s.updateUser);

  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updated = await updateMe({display_name: displayName, bio});
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
  },
});
