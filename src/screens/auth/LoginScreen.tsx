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
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.toggleWrap}>
          <ThemeToggleButton />
        </View>

        <Surface elevated style={styles.card} padding={spacing[6]}>
          <View style={styles.header}>
            <Text style={[styles.logo, {color: c.textPrimary}]}>Cack Social</Text>
          </View>

          {error ? (
            <View style={[styles.errorBox, {backgroundColor: c.dangerBg}]}> 
              <Text style={[styles.errorText, {color: c.danger}]}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
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
              fullWidth
              size="lg"
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            style={styles.footer}
            accessibilityRole="link"
            accessibilityLabel="Go to register">
            <Text style={[styles.footerText, {color: c.textTertiary}]}>Don't have an account? </Text>
            <Text style={[styles.footerLink, {color: c.textPrimary}]}>Sign up</Text>
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
