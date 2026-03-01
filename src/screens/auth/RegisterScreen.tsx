import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import {useAuthStore} from '../../stores/authStore';
import {useColors, fonts} from '../../theme';
import {logError} from '../../utils/log';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({navigation}: Props) {
  const c = useColors();
  const register = useAuthStore(s => s.register);
  const error = useAuthStore(s => s.error);
  const clearError = useAuthStore(s => s.clearError);

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLocalError('');
    if (!username.trim() || !password.trim()) {
      setLocalError('Username and password are required');
      return;
    }
    if (username.trim().length < 3 || username.trim().length > 50) {
      setLocalError('Username must be between 3 and 50 characters');
      return;
    }
    if (!/^[a-zA-Z0-9]+$/.test(username.trim())) {
      setLocalError('Username must contain only letters and numbers');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(username.trim(), password, displayName.trim() || undefined);
    } catch (e) {
      logError('RegisterScreen:register', e);
    }
    setLoading(false);
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, {backgroundColor: c.bgPrimary}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={[styles.logoCircle, {backgroundColor: c.accent}]}>
            <Icon name="account-plus-outline" size={36} color="#fff" />
          </View>
          <Text style={[styles.title, {color: c.textPrimary}]}>
            Create Account
          </Text>
          <Text style={[styles.subtitle, {color: c.textSecondary}]}>
            Join Cack today
          </Text>
        </View>

        {displayError ? (
          <View style={[styles.errorBox, {backgroundColor: c.dangerBg}]}>
            <Text style={[styles.errorText, {color: c.danger}]}>{displayError}</Text>
          </View>
        ) : null}

        <Input
          label="Username"
          placeholder="Choose a username"
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={t => {
            setUsername(t);
            clearError();
            setLocalError('');
          }}
          accessibilityLabel="Username"
        />

        <Input
          label="Display Name (optional)"
          placeholder="Your display name"
          value={displayName}
          onChangeText={setDisplayName}
          accessibilityLabel="Display name"
        />

        <Input
          label="Password"
          placeholder="At least 6 characters"
          secureTextEntry
          value={password}
          onChangeText={t => {
            setPassword(t);
            clearError();
            setLocalError('');
          }}
          accessibilityLabel="Password"
        />

        <Input
          label="Confirm Password"
          placeholder="Re-enter password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={t => {
            setConfirmPassword(t);
            setLocalError('');
          }}
          accessibilityLabel="Confirm password"
        />

        <Button
          title="Create Account"
          onPress={handleRegister}
          loading={loading}
          disabled={!username.trim() || !password.trim()}
          style={styles.btn}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.linkRow}
          accessibilityRole="link"
          accessibilityLabel="Go to login">
          <Text style={[styles.linkText, {color: c.textSecondary}]}>
            Already have an account?{' '}
          </Text>
          <Text style={[styles.link, {color: c.accent}]}>Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.displayBold,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.body,
    marginTop: 6,
  },
  errorBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: fonts.body,
  },
  btn: {
    marginTop: 12,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  linkText: {
    fontSize: 14,
    fontFamily: fonts.body,
  },
  link: {
    fontSize: 14,
    fontFamily: fonts.bodySemiBold,
  },
});
