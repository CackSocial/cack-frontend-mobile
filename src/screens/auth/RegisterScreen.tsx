import React, {useState} from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Surface from '../../components/common/Surface';
import ThemeToggleButton from '../../components/common/ThemeToggleButton';
import {useAuthStore} from '../../stores/authStore';
import {useColors, fonts, layout, spacing, typography} from '../../theme';
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
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.toggleWrap}>
          <ThemeToggleButton />
        </View>

        <Surface elevated style={styles.card} padding={spacing[6]}>
          <View style={styles.header}>
            <Text style={[styles.logo, {color: c.textPrimary}]}>Create account</Text>
          </View>

          {displayError ? (
            <View style={[styles.errorBox, {backgroundColor: c.dangerBg}]}> 
              <Text style={[styles.errorText, {color: c.danger}]}>{displayError}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
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
              label="Display name (optional)"
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
              label="Confirm password"
              placeholder="Re-enter your password"
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
              fullWidth
              size="lg"
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.footer}
            accessibilityRole="link"
            accessibilityLabel="Go to login">
            <Text style={[styles.footerText, {color: c.textTertiary}]}>Already have an account? </Text>
            <Text style={[styles.footerLink, {color: c.textPrimary}]}>Sign in</Text>
          </TouchableOpacity>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[8],
  },
  toggleWrap: {
    alignItems: 'flex-end',
    marginBottom: spacing[5],
  },
  card: {
    width: '100%',
    maxWidth: layout.narrowMaxWidth,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[6],
    gap: spacing[2],
  },
  logo: {
    fontSize: typography.hero,
    fontFamily: fonts.displayBold,
    textAlign: 'center',
  },
  form: {
    gap: spacing[4],
  },
  errorBox: {
    borderRadius: 12,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginBottom: spacing[4],
  },
  errorText: {
    fontSize: typography.sm,
    fontFamily: fonts.body,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing[5],
  },
  footerText: {
    fontSize: typography.sm,
    fontFamily: fonts.body,
  },
  footerLink: {
    fontSize: typography.sm,
    fontFamily: fonts.bodySemiBold,
  },
});
