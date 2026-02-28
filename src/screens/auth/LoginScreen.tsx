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
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import {useAuthStore} from '../../stores/authStore';
import {useColors, fonts} from '../../theme';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {AuthStackParamList} from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({navigation}: Props) {
  const c = useColors();
  const login = useAuthStore(s => s.login);
  const error = useAuthStore(s => s.error);
  const clearError = useAuthStore(s => s.clearError);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch {}
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, {backgroundColor: c.bgPrimary}]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.title, {color: c.textPrimary}]}>
            Cack Social
          </Text>
          <Text style={[styles.subtitle, {color: c.textTertiary}]}>
            Sign in to your account
          </Text>
        </View>

        {error && (
          <View style={[styles.errorBox, {backgroundColor: c.dangerBg}]}>
            <Text style={[styles.errorText, {color: c.danger}]}>{error}</Text>
          </View>
        )}

        <Input
          label="Username"
          placeholder="Enter your username"
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={t => {
            setUsername(t);
            clearError();
          }}
          accessibilityLabel="Username"
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={t => {
            setPassword(t);
            clearError();
          }}
          accessibilityLabel="Password"
        />

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          disabled={!username.trim() || !password.trim()}
          style={styles.btn}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.linkRow}
          accessibilityRole="link"
          accessibilityLabel="Go to register">
          <Text style={[styles.linkText, {color: c.textTertiary}]}>
            Don't have an account?{' '}
          </Text>
          <Text style={[styles.link, {color: c.textSecondary}]}>Sign Up</Text>
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
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: fonts.displayBold,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.body,
    marginTop: 6,
  },
  errorBox: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
  },
  btn: {
    marginTop: 8,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
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
