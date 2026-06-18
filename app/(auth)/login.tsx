// REDESIGNED: 2026-05-21 - login is faster, calmer, and more consistent
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail, validatePassword } from '@/utils/validators';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';
import { resolveSupportedLanguage } from '@/lib/language';

const SCREEN_COPY = {
  es: {
    eyebrow: 'VYRA',
    title: 'Bienvenido de vuelta',
    subtitle: 'Entra rapido y retoma tu progreso donde lo dejaste.',
    email: 'Email',
    password: 'Contrasena',
    cta: 'Iniciar sesion',
    separator: 'o',
    forgot: 'Olvide mi contrasena',
    guestlessFooter: 'No tienes cuenta todavia?',
    createAccount: 'Crear una',
    createAccountHint: 'Abre la pantalla para registrarte.',
    google: 'Google',
    googleHint: 'Abre el flujo seguro de Google.',
    apple: 'Apple',
    appleHint: 'Abre el flujo seguro de Apple.',
    invalidCredentials: 'Email o contrasena incorrectos.',
    errorTitle: 'No pudimos entrar con esos datos.',
    errorBody: 'Revisa email y contrasena, o recupera el acceso desde el link inferior.',
    backLabel: 'Volver',
    backHint: 'Regresa a la pantalla anterior.',
  },
  en: {
    eyebrow: 'VYRA',
    title: 'Welcome back',
    subtitle: 'Sign in quickly and pick up your progress where you left off.',
    email: 'Email',
    password: 'Password',
    cta: 'Sign in',
    separator: 'or',
    forgot: 'I forgot my password',
    guestlessFooter: 'Do not have an account yet?',
    createAccount: 'Create one',
    createAccountHint: 'Open the sign up screen.',
    google: 'Google',
    googleHint: 'Open the secure Google flow.',
    apple: 'Apple',
    appleHint: 'Open the secure Apple flow.',
    invalidCredentials: 'Incorrect email or password.',
    errorTitle: 'We could not sign you in with those details.',
    errorBody: 'Check your email and password, or recover access from the link below.',
    backLabel: 'Back',
    backHint: 'Go back to the previous screen.',
  },
  pt: {
    eyebrow: 'VYRA',
    title: 'Bem-vindo de volta',
    subtitle: 'Entre rapido e retome seu progresso de onde parou.',
    email: 'Email',
    password: 'Senha',
    cta: 'Entrar',
    separator: 'ou',
    forgot: 'Esqueci minha senha',
    guestlessFooter: 'Ainda nao tem conta?',
    createAccount: 'Criar uma',
    createAccountHint: 'Abre a tela de cadastro.',
    google: 'Google',
    googleHint: 'Abre o fluxo seguro do Google.',
    apple: 'Apple',
    appleHint: 'Abre o fluxo seguro da Apple.',
    invalidCredentials: 'Email ou senha incorretos.',
    errorTitle: 'Nao conseguimos entrar com esses dados.',
    errorBody: 'Revise email e senha, ou recupere o acesso no link abaixo.',
    backLabel: 'Voltar',
    backHint: 'Volta para a tela anterior.',
  },
} as const;

export default function LoginScreen() {
  const { i18n } = useTranslation();
  const { login, isLoading } = useAuth();
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
    <SafeScreen scrollable disableAtmosphere contentStyle={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed ? styles.backButtonPressed : null]}
          accessibilityRole="button"
          accessibilityLabel={copy.backLabel}
          accessibilityHint={copy.backHint}
        >
          <Ionicons name="chevron-back" size={18} color={Colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
      </View>

      <View style={styles.formBlock}>
        {submitError ? (
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>{copy.errorTitle}</Text>
            <Text style={styles.noticeBody}>{copy.errorBody}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <Input
            label={copy.email}
            value={email}
            size="md"
            autoFocus
            onChangeText={(value) => {
              setEmail(value);
              if (submitError) setSubmitError(null);
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            error={errors.email}
          />

          <Input
            label={copy.password}
            value={password}
            size="md"
            onChangeText={(value) => {
              setPassword(value);
              if (submitError) setSubmitError(null);
            }}
            secureTextEntry
            autoComplete="password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            error={errors.password}
          />

          <Pressable
            onPress={() => router.push(Routes.auth.forgotPassword as never)}
            style={styles.forgotLink}
            accessibilityRole="button"
            accessibilityLabel={copy.forgot}
          >
            <Text style={styles.forgotText}>{copy.forgot}</Text>
          </Pressable>

          <Button onPress={handleLogin} fullWidth size="md" loading={isLoading} haptic="medium">
            {copy.cta}
          </Button>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{copy.guestlessFooter}</Text>
        <Pressable
          onPress={() => router.replace(Routes.auth.register as never)}
          accessibilityRole="button"
          accessibilityLabel={copy.createAccount}
          accessibilityHint={copy.createAccountHint}
        >
          <Text style={styles.footerLink}>{copy.createAccount}</Text>
        </Pressable>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: Spacing[6],
  },
  topBar: {
    paddingTop: Spacing[1],
    marginBottom: Spacing[4],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    backgroundColor: withOpacity(Colors.white, 0.03),
  },
  backButtonPressed: {
    opacity: 0.88,
  },
  hero: {
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  eyebrow: {
    color: Colors.textMuted,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.display,
    fontSize: FontSize.xl,
    lineHeight: 30,
    letterSpacing: -0.6,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: 22,
    maxWidth: 320,
  },
  formBlock: {
    gap: Spacing[4],
  },
  notice: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.error, 0.28),
    backgroundColor: withOpacity(Colors.error, 0.08),
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    gap: Spacing[1],
  },
  noticeTitle: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
  noticeBody: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  form: {
    gap: Spacing[3],
  },
  forgotLink: {
    alignSelf: 'flex-end',
    paddingVertical: Spacing[1],
  },
  forgotText: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing[1],
    paddingTop: Spacing[4],
  },
  footerText: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
  footerLink: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
});
