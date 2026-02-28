import React from 'react';
import {View, Text, TouchableOpacity, Switch, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAuthStore} from '../../stores/authStore';
import {useThemeStore} from '../../stores/themeStore';
import {useMessagesStore} from '../../stores/messagesStore';

export default function SettingsScreen() {
  const theme = useThemeStore(s => s.theme);
  const toggleTheme = useThemeStore(s => s.toggleTheme);
  const logout = useAuthStore(s => s.logout);
  const disconnectWS = useMessagesStore(s => s.disconnectWS);
  const isDark = theme === 'dark';

  const handleLogout = () => {
    disconnectWS();
    logout();
  };

  return (
    <View style={[styles.container, {backgroundColor: isDark ? '#111827' : '#ffffff'}]}>
      {/* Theme toggle */}
      <View
        style={[
          styles.row,
          {borderBottomColor: isDark ? '#374151' : '#f3f4f6'},
        ]}>
        <View style={styles.rowLeft}>
          <Icon
            name={isDark ? 'weather-night' : 'white-balance-sunny'}
            size={22}
            color={isDark ? '#f3f4f6' : '#111827'}
          />
          <Text style={[styles.rowLabel, {color: isDark ? '#f3f4f6' : '#111827'}]}>
            Dark Mode
          </Text>
        </View>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{false: '#d1d5db', true: '#3b82f6'}}
          thumbColor="#ffffff"
          accessibilityLabel="Toggle dark mode"
        />
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.row, {borderBottomColor: isDark ? '#374151' : '#f3f4f6'}]}
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
