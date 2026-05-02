import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail, validateName, validatePassword } from '@/utils/validators';
import { useLocalizedStrings } from '@/constants/strings';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { Routes } from '@/constants/routes';
import { resolveSupportedLanguage } from '@/lib/language';

const SCREEN_COPY = {
  es: {
    subtitle: 'Empieza con Google o email; el resto lo ajustas despues.',
    google: 'Continuar con Google',
    googleHint: 'Abre el flujo seguro de Google para crear o vincular tu cuenta.',
    apple: 'Continuar con Apple',
    appleHint: 'Abre el flujo seguro de Apple para crear o vincular tu cuenta.',
    separator: 'o',
    passwordHint: 'Minimo 8 caracteres',
    terms: 'Terminos',
    privacy: 'Privacidad',
    termsA11yLabel: 'Abrir terminos',
    termsA11yHint: 'Muestra los terminos del servicio antes de crear tu cuenta.',
    privacyA11yLabel: 'Abrir privacidad',
    privacyA11yHint: 'Muestra la politica de privacidad antes de crear tu cuenta.',
    consentLabel: 'Acepto los terminos y entiendo el aviso medico de la app.',
    consentA11yLabel: 'Aceptar terminos y aviso medico',
    consentA11yHint: 'Marca esta casilla para continuar con la creacion de la cuenta.',
    consentError: 'Necesitas aceptar este paso para crear tu cuenta.',
    submitFallback: 'No pudimos crear tu cuenta.',
    guest: 'Continuar sin cuenta',
    guestHint: 'Puedes guardar tu progreso con Google o Apple despues.',
    footerPrefix: 'Ya tienes cuenta? ',
    footerLabel: 'Ya tengo cuenta',
    footerHint: 'Abre la pantalla para iniciar sesion.',
  },
  en: {
    subtitle: 'Start with Google or email; you can tune the rest later.',
    google: 'Continue with Google',
    googleHint: 'Open the secure Google flow to create or link your account.',
    apple: 'Continue with Apple',
    appleHint: 'Open the secure Apple flow to create or link your account.',
    separator: 'or',
    passwordHint: 'Minimum 8 characters',
    terms: 'Terms',
    privacy: 'Privacy',
    termsA11yLabel: 'Open terms',
    termsA11yHint: 'Show the terms of service before creating your account.',
    privacyA11yLabel: 'Open privacy',
    privacyA11yHint: 'Show the privacy policy before creating your account.',
    consentLabel: 'I accept the terms and understand the app medical notice.',
    consentA11yLabel: 'Accept terms and medical notice',
    consentA11yHint: 'Check this box to continue creating your account.',
    consentError: 'You need to accept this step to create your account.',
    submitFallback: 'We could not create your account.',
    guest: 'Continue without account',
    guestHint: 'You can save your progress with Google or Apple later.',
    footerPrefix: 'Already have an account? ',
    footerLabel: 'I already have an account',
    footerHint: 'Open the screen to sign in.',
  },
  pt: {
    subtitle: 'Comece com Google ou email; o resto voce ajusta depois.',
    google: 'Continuar com Google',
    googleHint: 'Abre o fluxo seguro do Google para criar ou vincular sua conta.',
    apple: 'Continuar com Apple',
    appleHint: 'Abre o fluxo seguro da Apple para criar ou vincular sua conta.',
    separator: 'ou',
    passwordHint: 'Minimo de 8 caracteres',
    terms: 'Termos',
    privacy: 'Privacidade',
    termsA11yLabel: 'Abrir termos',
    termsA11yHint: 'Mostra os termos de servico antes de criar sua conta.',
    privacyA11yLabel: 'Abrir privacidade',
    privacyA11yHint: 'Mostra a politica de privacidade antes de criar sua conta.',
    consentLabel: 'Aceito os termos e entendo o aviso medico do app.',
    consentA11yLabel: 'Aceitar termos e aviso medico',
    consentA11yHint: 'Marque esta caixa para continuar criando sua conta.',
    consentError: 'Voce precisa aceitar esta etapa para criar sua conta.',
    submitFallback: 'Nao conseguimos criar sua conta.',
    guest: 'Continuar sem conta',
    guestHint: 'Voce pode salvar seu progresso com Google ou Apple depois.',
    footerPrefix: 'Ja tem conta? ',
    footerLabel: 'Ja tenho conta',
    footerHint: 'Abre a tela para entrar.',
  },
} as const;

export default function RegisterScreen() {
  const { AuthStrings: authStrings } = useLocalizedStrings();
  const { i18n } = useTranslation();
  const { register, continueAsGuest, isLoading } = useAuth();
  const copy = SCREEN_COPY[resolveSupportedLanguage(i18n.resolvedLanguage ?? i18n.language)];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    if (nameErr) nextErrors.name = nameErr;
    if (emailErr) nextErrors.email = emailErr;
    if (passwordErr) nextErrors.password = passwordErr;
    if (!consentAccepted) nextErrors.consent = copy.consentError;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async () => {
    setSubmitError(null);
    if (!validateForm()) return;

    const result = await register(email.trim().toLowerCase(), password, name.trim());
    if (!result.ok) {
      setSubmitError(result.error ?? copy.submitFallback);
    }
  };

  return (
    <SafeScreen scrollable padBottom>
      <View style={styles.hero}>
        <Text style={styles.title}>{authStrings.register.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
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
          label={authStrings.register.name}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoComplete="name"
          error={errors.name}
        />
        <Input
          label={authStrings.register.email}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
        />
        <Input
          label={authStrings.register.password}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          error={errors.password}
          hint={copy.passwordHint}
        />

        <View style={styles.linksRow}>
          <Pressable
            onPress={() => router.push(Routes.legal.terms as never)}
            style={styles.legalPill}
            accessibilityRole="button"
            accessibilityLabel={copy.termsA11yLabel}
            accessibilityHint={copy.termsA11yHint}
          >
            <Text style={styles.legalPillText}>{copy.terms}</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push(Routes.legal.privacy as never)}
            style={styles.legalPill}
            accessibilityRole="button"
            accessibilityLabel={copy.privacyA11yLabel}
            accessibilityHint={copy.privacyA11yHint}
          >
            <Text style={styles.legalPillText}>{copy.privacy}</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.checkRow}
          onPress={() => setConsentAccepted((value) => !value)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: consentAccepted }}
          accessibilityLabel={copy.consentA11yLabel}
          accessibilityHint={copy.consentA11yHint}
        >
          <View style={[styles.checkbox, consentAccepted && styles.checkboxChecked]}>
            {consentAccepted ? <MaterialIcons name="check" size={14} color={Colors.black} /> : null}
          </View>
          <Text style={styles.checkText}>{copy.consentLabel}</Text>
        </Pressable>

        {errors.consent ? <Text style={styles.errorText}>{errors.consent}</Text> : null}
        {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

        <Button onPress={handleRegister} fullWidth size="md" loading={isLoading}>
          {authStrings.register.cta}
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
          onPress={() => router.replace(Routes.auth.login as never)}
          accessibilityRole="button"
          accessibilityLabel={copy.footerLabel}
          accessibilityHint={copy.footerHint}
        >
          <Text style={styles.footerLink}>{authStrings.register.login}</Text>
        </Pressable>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: Spacing[2],
    marginTop: Spacing[1],
    marginBottom: Spacing[3],
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 34,
    lineHeight: 34,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  form: {
    gap: Spacing[1.5],
  },
  googleButton: {
    height: 52,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing[3],
  },
  googleBadge: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: '#4285F4',
    backgroundColor: Colors.white,
    width: 22,
    height: 22,
    lineHeight: 22,
    textAlign: 'center',
    borderRadius: 11,
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
    marginVertical: Spacing[0.5],
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
  linksRow: {
    flexDirection: 'row',
    gap: Spacing[1],
  },
  legalPill: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: withOpacity(Colors.white, 0.08),
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
  },
  legalPillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  checkRow: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: withOpacity(Colors.white, 0.14),
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.brand,
    borderColor: Colors.brand,
  },
  checkText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  errorText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.error,
  },
  guestHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: Spacing[3],
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
