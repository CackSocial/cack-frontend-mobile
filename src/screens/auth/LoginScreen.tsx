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
    } catch (e) {
      logError('LoginScreen:login', e);
    }
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
          <View style={[styles.logoCircle, {backgroundColor: c.accent}]}>
            <Icon name="chat-processing-outline" size={36} color="#fff" />
          </View>
          <Text style={[styles.title, {color: c.textPrimary}]}>
            Welcome back
          </Text>
          <Text style={[styles.subtitle, {color: c.textSecondary}]}>
            Sign in to Cack
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
          <Text style={[styles.linkText, {color: c.textSecondary}]}>
            Don't have an account?{' '}
          </Text>
          <Text style={[styles.link, {color: c.accent}]}>Sign Up</Text>
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
    marginBottom: 40,
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
