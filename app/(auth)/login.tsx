import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail, validatePassword } from '@/utils/validators';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';
import { useState } from 'react';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = () => {
    const nextErrors: typeof errors = {};
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    if (emailErr) nextErrors.email = emailErr;
    if (passwordErr) nextErrors.password = passwordErr;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async () => {
    setSubmitError(null);
    if (!validate()) return;
    const result = await login(email.trim().toLowerCase(), password);
    if (!result.ok) {
      setSubmitError('Email o contraseña incorrectos.');
    }
  };

  return (
    <SafeScreen scrollable>
      <View style={styles.logoPill}>
        <View style={styles.logoDot} />
      </View>

      <View style={styles.hero}>
        <Text style={styles.title}>Bienvenido de nuevo</Text>
      </View>

      <View style={styles.form}>
        <Pressable onPress={() => router.push(Routes.auth.google as never)} style={styles.googleButton}>
          <Text style={styles.googleBadge}>G</Text>
          <Text style={styles.googleText}>Continuar con Google</Text>
        </Pressable>

        <Input
          label="Email"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            if (submitError) setSubmitError(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
          returnKeyType="next"
        />

        <Input
          label="Contraseña"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            if (submitError) setSubmitError(null);
          }}
          secureTextEntry
          autoComplete="password"
          error={errors.password}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        <Pressable onPress={() => router.push('/(auth)/forgot-password' as never)} style={styles.forgot}>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </Pressable>

        {submitError ? (
          <View style={styles.errorPill}>
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        ) : null}

        <Button onPress={handleLogin} fullWidth size="lg" loading={isLoading}>
          Entrar
        </Button>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿No tienes cuenta? </Text>
        <Pressable onPress={() => router.replace('/(auth)/register' as never)}>
          <Text style={styles.footerLink}>Regístrate</Text>
        </Pressable>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  logoPill: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.brand, 0.14),
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.22),
    marginTop: Spacing[2],
  },
  logoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.brand,
  },
  hero: {
    marginTop: Spacing[5],
    marginBottom: Spacing[6],
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 42,
    lineHeight: 42,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  form: {
    gap: Spacing[1],
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[3],
    height: 56,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    marginBottom: Spacing[4],
  },
  googleBadge: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: '#4285F4',
    backgroundColor: Colors.white,
    width: 22,
    height: 22,
    borderRadius: 11,
    textAlign: 'center',
    lineHeight: 22,
  },
  googleText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginTop: -Spacing[1],
    marginBottom: Spacing[4],
  },
  forgotText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.textMuted,
  },
  errorPill: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.error, 0.24),
    backgroundColor: withOpacity(Colors.error, 0.12),
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    marginBottom: Spacing[3],
  },
  errorText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.error,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: Spacing[6],
  },
  footerText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.brand,
  },
});
