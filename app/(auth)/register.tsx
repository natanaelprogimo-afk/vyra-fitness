// REDESIGNED: 2026-05-21 - register is lighter, lower-friction, and onboarding-first
import { useMemo, useState } from 'react';
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
    eyebrow: 'Cuenta nueva',
    title: 'Crea tu cuenta',
    subtitle: 'Entras en segundos. Nombre, objetivos y módulos se definen después.',
    email: 'Email',
    password: 'Contrasena',
    cta: 'Seguir al onboarding',
    separator: 'o',
    google: 'Google',
    googleHint: 'Abre el flujo seguro de Google.',
    apple: 'Apple',
    appleHint: 'Abre el flujo seguro de Apple.',
    footerPrefix: 'Ya tienes cuenta?',
    footerAction: 'Inicia sesion',
    footerHint: 'Abre la pantalla para entrar.',
    backLabel: 'Volver',
    backHint: 'Regresa a la pantalla anterior.',
    consentPrefix: 'Al continuar aceptas ',
    terms: 'Terminos',
    privacy: 'Privacidad',
    passwordRuleReady: 'Minimo 8 caracteres',
    passwordRuleSupport: 'Puedes cambiarla despues si lo necesitas.',
    submitFallback: 'No pudimos crear tu cuenta.',
    registeredTitle: 'Ese email ya existe',
    registeredBody: 'Puedes entrar con esa cuenta en lugar de crear otra.',
    goToLogin: 'Ir a iniciar sesion',
  },
  en: {
    eyebrow: 'New account',
    title: 'Create your account',
    subtitle: 'You are in within seconds. Name, goals and modules come right after this.',
    email: 'Email',
    password: 'Password',
    cta: 'Continue to onboarding',
    separator: 'or',
    google: 'Google',
    googleHint: 'Open the secure Google flow.',
    apple: 'Apple',
    appleHint: 'Open the secure Apple flow.',
    footerPrefix: 'Already have an account?',
    footerAction: 'Sign in',
    footerHint: 'Open the sign in screen.',
    backLabel: 'Back',
    backHint: 'Go back to the previous screen.',
    consentPrefix: 'By continuing you accept ',
    terms: 'Terms',
    privacy: 'Privacy',
    passwordRuleReady: 'At least 8 characters',
    passwordRuleSupport: 'You can change it later if needed.',
    submitFallback: 'We could not create your account.',
    registeredTitle: 'That email already exists',
    registeredBody: 'You can sign in with that account instead of creating another one.',
    goToLogin: 'Go to sign in',
  },
  pt: {
    eyebrow: 'Conta nova',
    title: 'Crie sua conta',
    subtitle: 'Voce entra em segundos. Nome, objetivos e modulos vem logo depois.',
    email: 'Email',
    password: 'Senha',
    cta: 'Seguir para o onboarding',
    separator: 'ou',
    google: 'Google',
    googleHint: 'Abre o fluxo seguro do Google.',
    apple: 'Apple',
    appleHint: 'Abre o fluxo seguro da Apple.',
    footerPrefix: 'Ja tem conta?',
    footerAction: 'Entrar',
    footerHint: 'Abre a tela para entrar.',
    backLabel: 'Voltar',
    backHint: 'Volta para a tela anterior.',
    consentPrefix: 'Ao continuar voce aceita ',
    terms: 'Termos',
    privacy: 'Privacidade',
    passwordRuleReady: 'Minimo de 8 caracteres',
    passwordRuleSupport: 'Voce pode mudar depois se precisar.',
    submitFallback: 'Nao conseguimos criar sua conta.',
    registeredTitle: 'Esse email ja existe',
    registeredBody: 'Voce pode entrar com essa conta em vez de criar outra.',
    goToLogin: 'Ir para entrar',
  },
} as const;

export default function RegisterScreen() {
  const { i18n } = useTranslation();
  const { register, isLoading } = useAuth();
  const copy = SCREEN_COPY[resolveSupportedLanguage(i18n.resolvedLanguage ?? i18n.language)];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const passwordChecklist = useMemo(
    () => [
      {
        key: 'length',
        label: copy.passwordRuleReady,
        met: password.length >= 8,
      },
      {
        key: 'support',
        label: copy.passwordRuleSupport,
        met: password.length > 0,
      },
    ],
    [copy.passwordRuleReady, copy.passwordRuleSupport, password.length],
  );

  const emailAlreadyRegistered =
    submitError?.toLowerCase().includes('registrado') ||
    submitError?.toLowerCase().includes('registered') ||
    false;

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    if (emailErr) nextErrors.email = emailErr;
    if (passwordErr) nextErrors.password = passwordErr;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async () => {
    setSubmitError(null);
    if (!validateForm()) return;

    const normalizedEmail = email.trim().toLowerCase();
    const derivedName = normalizedEmail.split('@')[0]?.trim() || 'Vyra';
    const result = await register(normalizedEmail, password, derivedName);
    if (!result.ok) {
      setSubmitError(result.error ?? copy.submitFallback);
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
          <View style={[styles.notice, emailAlreadyRegistered ? styles.noticeWarning : null]}>
            <Text style={styles.noticeTitle}>
              {emailAlreadyRegistered ? copy.registeredTitle : copy.submitFallback}
            </Text>
            <Text style={styles.noticeBody}>
              {emailAlreadyRegistered ? copy.registeredBody : submitError}
            </Text>
            {emailAlreadyRegistered ? (
              <Pressable
                onPress={() => router.replace(Routes.auth.login as never)}
                style={styles.noticeLinkWrap}
                accessibilityRole="button"
                accessibilityLabel={copy.goToLogin}
              >
                <Text style={styles.noticeLink}>{copy.goToLogin}</Text>
              </Pressable>
            ) : null}
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
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={handleRegister}
            error={errors.password}
          />

          {password.length > 0 ? (
            <View style={styles.passwordChecklist}>
              {passwordChecklist.map((rule) => (
                <View key={rule.key} style={styles.passwordRule}>
                  <View style={[styles.ruleDot, rule.met ? styles.ruleDotMet : null]}>
                    {rule.met ? (
                      <Ionicons name="checkmark" size={12} color={Colors.black} />
                    ) : null}
                  </View>
                  <Text style={[styles.ruleText, rule.met ? styles.ruleTextMet : null]}>
                    {rule.label}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          <Button onPress={handleRegister} fullWidth size="md" loading={isLoading} haptic="medium">
            {copy.cta}
          </Button>

          <Text style={styles.consentText}>
            {copy.consentPrefix}
            <Text onPress={() => router.push(Routes.legal.terms as never)} style={styles.inlineLink}>
              {copy.terms}
            </Text>
            {' y '}
            <Text onPress={() => router.push(Routes.legal.privacy as never)} style={styles.inlineLink}>
              {copy.privacy}
            </Text>
            .
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{copy.footerPrefix}</Text>
        <Pressable
          onPress={() => router.replace(Routes.auth.login as never)}
          accessibilityRole="button"
          accessibilityLabel={copy.footerAction}
          accessibilityHint={copy.footerHint}
        >
          <Text style={styles.footerLink}>{copy.footerAction}</Text>
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
    maxWidth: 330,
  },
  formBlock: {
    gap: Spacing[4],
  },
  notice: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: withOpacity(Colors.error, 0.22),
    backgroundColor: withOpacity(Colors.error, 0.08),
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    gap: Spacing[1.5],
  },
  noticeWarning: {
    borderColor: withOpacity(Colors.warning, 0.22),
    backgroundColor: withOpacity(Colors.warning, 0.08),
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
  noticeLinkWrap: {
    paddingTop: Spacing[0.5],
  },
  noticeLink: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  form: {
    gap: Spacing[3],
  },
  passwordChecklist: {
    gap: Spacing[2],
    paddingHorizontal: Spacing[1],
  },
  passwordRule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  ruleDot: {
    width: 18,
    height: 18,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleDotMet: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ruleText: {
    flex: 1,
    color: Colors.textMuted,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  ruleTextMet: {
    color: Colors.textSecondary,
  },
  consentText: {
    color: Colors.textMuted,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
  },
  inlineLink: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.semibold,
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
