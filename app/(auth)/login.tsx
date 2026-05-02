import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail, validatePassword } from '@/utils/validators';
import { useLocalizedStrings } from '@/constants/strings';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';
import { resolveSupportedLanguage } from '@/lib/language';

const SCREEN_COPY = {
  es: {
    google: 'Continuar con Google',
    googleHint: 'Abre el flujo seguro de Google para entrar o guardar esta cuenta.',
    apple: 'Continuar con Apple',
    appleHint: 'Abre el flujo seguro de Apple para entrar o guardar esta cuenta.',
    separator: 'o',
    forgotA11yLabel: 'Olvide mi contrasena',
    forgotA11yHint: 'Abre el flujo para recuperar el acceso por email.',
    guest: 'Continuar sin cuenta',
    guestHint: 'Si luego vinculas Google o Apple, conservas lo que registres hoy.',
    footerPrefix: 'No tienes cuenta? ',
    createAccountLabel: 'Crear cuenta',
    createAccountHint: 'Abre la pantalla para registrarte con email o proveedor.',
    invalidCredentials: 'Email o contrasena incorrectos.',
  },
  en: {
    google: 'Continue with Google',
    googleHint: 'Open the secure Google flow to sign in or save this account.',
    apple: 'Continue with Apple',
    appleHint: 'Open the secure Apple flow to sign in or save this account.',
    separator: 'or',
    forgotA11yLabel: 'I forgot my password',
    forgotA11yHint: 'Open the flow to recover access by email.',
    guest: 'Continue without account',
    guestHint: 'If you link Google or Apple later, you keep what you log today.',
    footerPrefix: 'Do not have an account? ',
    createAccountLabel: 'Create account',
    createAccountHint: 'Open the screen to register with email or a provider.',
    invalidCredentials: 'Incorrect email or password.',
  },
  pt: {
    google: 'Continuar com Google',
    googleHint: 'Abre o fluxo seguro do Google para entrar ou salvar esta conta.',
    apple: 'Continuar com Apple',
    appleHint: 'Abre o fluxo seguro da Apple para entrar ou salvar esta conta.',
    separator: 'ou',
    forgotA11yLabel: 'Esqueci minha senha',
    forgotA11yHint: 'Abre o fluxo para recuperar o acesso por email.',
    guest: 'Continuar sem conta',
    guestHint: 'Se depois voce vincular Google ou Apple, mantem o que registrar hoje.',
    footerPrefix: 'Ainda nao tem conta? ',
    createAccountLabel: 'Criar conta',
    createAccountHint: 'Abre a tela para se registrar com email ou provedor.',
    invalidCredentials: 'Email ou senha incorretos.',
  },
} as const;

export default function LoginScreen() {
  const { AuthStrings: authStrings } = useLocalizedStrings();
  const { i18n } = useTranslation();
  const { login, continueAsGuest, isLoading } = useAuth();
  const copy = SCREEN_COPY[resolveSupportedLanguage(i18n.resolvedLanguage ?? i18n.language)];
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
      setSubmitError(result.error ?? copy.invalidCredentials);
    }
  };

  return (
    <SafeScreen scrollable>
      <View style={styles.logoPill}>
        <View style={styles.logoDot} />
      </View>

      <View style={styles.hero}>
        <Text style={styles.title}>{authStrings.login.title}</Text>
      </View>

      <View style={styles.form}>
        <Pressable
          onPress={() => router.push(Routes.auth.google as never)}
          style={styles.googleButton}
          accessibilityRole="button"
          accessibilityLabel={copy.google}
          accessibilityHint={copy.googleHint}
        >
          <Text style={styles.googleBadge}>G</Text>
          <Text style={styles.googleText}>{copy.google}</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push(Routes.auth.apple as never)}
          style={styles.googleButton}
          accessibilityRole="button"
          accessibilityLabel={copy.apple}
          accessibilityHint={copy.appleHint}
        >
          <FontAwesome name="apple" size={20} color={Colors.textPrimary} />
          <Text style={styles.googleText}>{copy.apple}</Text>
        </Pressable>

        <View style={styles.separatorRow}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>{copy.separator}</Text>
          <View style={styles.separatorLine} />
        </View>

        <Input
          label={authStrings.login.email}
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
          label={authStrings.login.password}
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

        <Pressable
          onPress={() => router.push('/(auth)/forgot-password' as never)}
          style={styles.forgot}
          accessibilityRole="button"
          accessibilityLabel={copy.forgotA11yLabel}
          accessibilityHint={copy.forgotA11yHint}
        >
          <Text style={styles.forgotText}>{authStrings.login.forgot}</Text>
        </Pressable>

        {submitError ? (
          <View style={styles.errorPill}>
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        ) : null}

        <Button onPress={handleLogin} fullWidth size="lg" loading={isLoading}>
          {authStrings.login.cta}
        </Button>

        <Button
          onPress={() => {
            void continueAsGuest();
          }}
          fullWidth
          variant="secondary"
          loading={isLoading}
        >
          {copy.guest}
        </Button>
        <Text style={styles.guestHint}>{copy.guestHint}</Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{copy.footerPrefix}</Text>
        <Pressable
          onPress={() => router.replace('/(auth)/register' as never)}
          accessibilityRole="button"
          accessibilityLabel={copy.createAccountLabel}
          accessibilityHint={copy.createAccountHint}
        >
          <Text style={styles.footerLink}>{authStrings.login.register}</Text>
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
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: withOpacity(Colors.white, 0.08),
  },
  separatorText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginTop: Spacing[1],
    marginBottom: Spacing[4],
  },
  forgotText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
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
  guestHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
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
