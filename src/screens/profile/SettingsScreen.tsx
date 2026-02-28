import React from 'react';
import {View, Text, TouchableOpacity, Switch, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAuthStore} from '../../stores/authStore';
import {useThemeStore} from '../../stores/themeStore';
import {useMessagesStore} from '../../stores/messagesStore';
import {useColors} from '../../theme';

export default function SettingsScreen() {
  const theme = useThemeStore(s => s.theme);
  const toggleTheme = useThemeStore(s => s.toggleTheme);
  const logout = useAuthStore(s => s.logout);
  const disconnectWS = useMessagesStore(s => s.disconnectWS);
  const c = useColors();

  const handleLogout = () => {
    disconnectWS();
    logout();
  };

  return (
    <View style={[styles.container, {backgroundColor: c.bgPrimary}]}>
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
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
});
