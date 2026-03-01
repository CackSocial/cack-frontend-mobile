import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, Switch, Alert, Modal, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from '../../components/common/Button';
import {useAuthStore} from '../../stores/authStore';
import {useThemeStore} from '../../stores/themeStore';
import {useMessagesStore} from '../../stores/messagesStore';
import {deleteAccount} from '../../api/users';
import {useColors, fonts} from '../../theme';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {ProfileStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

export default function SettingsScreen({navigation}: Props) {
  const theme = useThemeStore(s => s.theme);
  const toggleTheme = useThemeStore(s => s.toggleTheme);
  const logout = useAuthStore(s => s.logout);
  const disconnectWS = useMessagesStore(s => s.disconnectWS);
  const c = useColors();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const handleLogout = () => {
    disconnectWS();
    logout();
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) return;
    setDeleteLoading(true);
    try {
      await deleteAccount(deletePassword);
      setShowDeleteModal(false);
      disconnectWS();
      logout();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to delete account');
    }
    setDeleteLoading(false);
  };

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}>
      {/* Bookmarks */}
      <TouchableOpacity
        style={[styles.row, {borderBottomColor: c.border}]}
        onPress={() => navigation.navigate('Bookmarks')}
        accessibilityRole="button"
        accessibilityLabel="View bookmarks">
        <View style={styles.rowLeft}>
          <Icon name="bookmark-outline" size={22} color={c.textPrimary} />
          <Text style={[styles.rowLabel, {color: c.textPrimary}]}>
            Bookmarks
          </Text>
        </View>
        <Icon name="chevron-right" size={20} color={c.textMuted} />
      </TouchableOpacity>

      {/* Theme toggle */}
      <View
        style={[
          styles.row,
          {borderBottomColor: c.border},
        ]}>
        <View style={styles.rowLeft}>
          <Icon
            name={theme === 'dark' ? 'weather-night' : 'white-balance-sunny'}
            size={22}
            color={c.textPrimary}
          />
          <Text style={[styles.rowLabel, {color: c.textPrimary}]}>
            Dark Mode
          </Text>
        </View>
        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
          trackColor={{false: c.borderStrong, true: c.accent}}
          thumbColor="#ffffff"
          accessibilityLabel="Toggle dark mode"
        />
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.row, {borderBottomColor: c.border}]}
        onPress={handleLogout}
        accessibilityRole="button"
        accessibilityLabel="Log out">
        <View style={styles.rowLeft}>
          <Icon name="logout" size={22} color="#ef4444" />
          <Text style={[styles.rowLabel, {color: '#ef4444'}]}>Log Out</Text>
        </View>
      </TouchableOpacity>

      {/* Delete Account */}
      <TouchableOpacity
        style={[styles.row, {borderBottomColor: c.border}]}
        onPress={() => {
          setDeletePassword('');
          setShowDeleteModal(true);
        }}
        disabled={deleteLoading}
        accessibilityRole="button"
        accessibilityLabel="Delete account">
        <View style={styles.rowLeft}>
          <Icon name="delete-outline" size={22} color="#ef4444" />
          <Text style={[styles.rowLabel, {color: '#ef4444'}]}>
            Delete Account
          </Text>
        </View>
      </TouchableOpacity>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {backgroundColor: c.bgElevated}]}>
            <Text style={[styles.modalTitle, {color: c.textPrimary}]}>
              Delete Account
            </Text>
            <Text style={[styles.modalSubtitle, {color: c.textSecondary}]}>
              Enter your password to permanently delete your account. This cannot be undone.
            </Text>
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
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setShowDeleteModal(false)}
                style={{flex: 1}}
              />
              <Button
                title="Delete"
                variant="danger"
                onPress={handleDeleteAccount}
                loading={deleteLoading}
                disabled={!deletePassword.trim()}
                style={{flex: 1}}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontFamily: fonts.bodyMedium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.displayBold,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: fonts.body,
    lineHeight: 20,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.body,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
});
