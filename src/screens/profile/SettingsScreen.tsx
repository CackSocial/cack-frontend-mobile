import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from '../../components/common/Button';
import Surface from '../../components/common/Surface';
import ThemeToggleButton from '../../components/common/ThemeToggleButton';
import {useAuthStore} from '../../stores/authStore';
import {deleteAccount} from '../../api/users';
import {useColors, fonts, layout, radii, spacing, typography} from '../../theme';
import {getErrorMessage} from '../../utils/log';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

function SettingsRow({
  icon,
  label,
  value,
  danger,
  onPress,
}: {
  icon: string;
  label: string;
  value?: string;
  danger?: boolean;
  onPress?: () => void;
}) {
  const c = useColors();
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={styles.rowLeft}>
        <Icon name={icon} size={20} color={danger ? c.danger : c.textPrimary} />
        <View>
          <Text style={[styles.rowLabel, {color: danger ? c.danger : c.textPrimary}]}>{label}</Text>
          {value ? <Text style={[styles.rowValue, {color: c.textSecondary}]}>{value}</Text> : null}
        </View>
      </View>
      {onPress ? <Icon name="chevron-right" size={20} color={c.textMuted} /> : null}
    </TouchableOpacity>
  );
}

export default function SettingsScreen({navigation}: Props) {
  const c = useColors();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const handleLogout = () => {
    logout();
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) return;
    setDeleteLoading(true);
    try {
      await deleteAccount(deletePassword);
      setShowDeleteModal(false);
      // logout() unmounts this component — no state updates after it
      logout();
    } catch (e: unknown) {
      Alert.alert('Error', getErrorMessage(e));
      setDeleteLoading(false);
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}> 
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Surface elevated style={styles.section}>
          <Text style={[styles.sectionTitle, {color: c.textPrimary}]}>Profile</Text>
          <SettingsRow
            icon="account-circle-outline"
            label="Edit profile"
            value={user ? `@${user.username}` : undefined}
            onPress={() => navigation.navigate('EditProfile')}
          />
          <SettingsRow
            icon="bookmark-outline"
            label="Bookmarks"
            onPress={() => navigation.navigate('Bookmarks')}
          />
        </Surface>

        <Surface elevated style={styles.section}>
          <Text style={[styles.sectionTitle, {color: c.textPrimary}]}>Appearance</Text>
          <View style={styles.themeRow}>
            <Text style={[styles.rowLabel, {color: c.textPrimary}]}>Theme</Text>
            <ThemeToggleButton />
          </View>
        </Surface>

        <Surface elevated style={styles.section}>
          <Text style={[styles.sectionTitle, {color: c.textPrimary}]}>Account</Text>
          <View style={styles.actionGroup}>
            <Button title="Log Out" variant="secondary" onPress={handleLogout} fullWidth />
            <Button
              title="Delete Account"
              variant="danger"
              onPress={() => {
                setDeletePassword('');
                setShowDeleteModal(true);
              }}
              fullWidth
            />
          </View>
        </Surface>
      </ScrollView>

      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <View style={[styles.modalOverlay, {backgroundColor: c.bgOverlay}]}> 
          <Surface style={styles.modalCard} elevated>
            <Text style={[styles.modalTitle, {color: c.textPrimary}]}>Delete account</Text>
            <Text style={[styles.modalSubtitle, {color: c.textSecondary}]}>Enter your password to permanently delete your account. This cannot be undone.</Text>
            <TextInput
              style={[styles.modalInput, {color: c.textPrimary, backgroundColor: c.bgSecondary, borderColor: c.border}]}
              placeholder="Password"
              placeholderTextColor={c.textMuted}
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
              accessibilityLabel="Password for account deletion"
            />
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="secondary" onPress={() => setShowDeleteModal(false)} style={styles.modalButton} />
              <Button
                title="Delete"
                variant="danger"
                onPress={handleDeleteAccount}
                loading={deleteLoading}
                disabled={!deletePassword.trim()}
                style={styles.modalButton}
              />
            </View>
          </Surface>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[5],
    gap: spacing[4],
  },
  section: {
    gap: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontFamily: fonts.displayBold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  rowLabel: {
    fontSize: typography.base,
    fontFamily: fonts.bodyMedium,
  },
  rowValue: {
    marginTop: 2,
    fontSize: typography.sm,
    fontFamily: fonts.body,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[4],
  },
  actionGroup: {
    gap: spacing[3],
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing[6],
  },
  modalCard: {
    gap: spacing[4],
  },
  modalTitle: {
    fontSize: typography.xl,
    fontFamily: fonts.displayBold,
  },
  modalSubtitle: {
    fontSize: typography.sm,
    fontFamily: fonts.body,
    lineHeight: 20,
  },
  modalInput: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: typography.base,
    fontFamily: fonts.body,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  modalButton: {
    flex: 1,
  },
});
