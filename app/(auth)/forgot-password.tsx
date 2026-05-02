import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { validateEmail } from '@/utils/validators';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { resolveSupportedLanguage } from '@/lib/language';

const SCREEN_COPY = {
  es: {
    title: 'Recupera tu acceso',
    subtitle: 'Ingresa tu email y te mandamos las instrucciones.',
    send: 'Enviar instrucciones',
    sendFailed: 'No pudimos enviar el email. Verifica la direccion e intenta otra vez.',
    successTitle: 'Revisa tu bandeja de entrada',
    successBody: 'Tambien revisa spam si no lo ves.',
    resend: 'Reenviar',
    resendIn: (seconds: number) => `Reenviar en ${seconds}s`,
    resendA11y: (seconds: number) =>
      seconds > 0 ? `Reenviar en ${seconds} segundos` : 'Reenviar email',
    resendHint: 'Vuelve a mandar el correo de recuperacion.',
  },
  en: {
    title: 'Recover your access',
    subtitle: 'Enter your email and we will send you the instructions.',
    send: 'Send instructions',
    sendFailed: 'We could not send the email. Check the address and try again.',
    successTitle: 'Check your inbox',
    successBody: 'Also check spam if you do not see it.',
    resend: 'Resend',
    resendIn: (seconds: number) => `Resend in ${seconds}s`,
    resendA11y: (seconds: number) =>
      seconds > 0 ? `Resend in ${seconds} seconds` : 'Resend email',
    resendHint: 'Send the recovery email again.',
  },
  pt: {
    title: 'Recupere seu acesso',
    subtitle: 'Digite seu email e enviaremos as instrucoes.',
    send: 'Enviar instrucoes',
    sendFailed: 'Nao conseguimos enviar o email. Verifique o endereco e tente novamente.',
    successTitle: 'Verifique sua caixa de entrada',
    successBody: 'Veja tambem o spam se nao aparecer.',
    resend: 'Reenviar',
    resendIn: (seconds: number) => `Reenviar em ${seconds}s`,
    resendA11y: (seconds: number) =>
      seconds > 0 ? `Reenviar em ${seconds} segundos` : 'Reenviar email',
    resendHint: 'Envie o email de recuperacao novamente.',
  },
} as const;

export default function ForgotPasswordScreen() {
  const { i18n } = useTranslation();
  const copy = SCREEN_COPY[resolveSupportedLanguage(i18n.resolvedLanguage ?? i18n.language)];
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const interval = setInterval(() => {
      setCooldown((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleReset = async () => {
    const err = validateEmail(email);
    if (err) {
      setError(err);
      return;
    }
    setError(null);

    setSubmitting(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const backendUrl = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';

      if (!backendUrl) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: 'vyrafitness://reset-password',
        });
        if (resetError) throw resetError;
      } else {
        const response = await fetch(`${backendUrl}/api/auth/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: normalizedEmail }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch((e) => {
            console.debug?.('[ForgotPassword] reset-password response parse failed', e);
            return null;
          })) as { error?: string } | null;
          throw new Error(payload?.error ?? copy.sendFailed);
        }
      }

      setSent(true);
      setCooldown(60);
    } catch {
      setError(copy.sendFailed);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <SafeScreen>
        <View style={styles.success}>
          <View style={styles.checkWrap}>
            <Text style={styles.check}>✓</Text>
          </View>
          <Text style={styles.successTitle}>{copy.successTitle}</Text>
          <Text style={styles.email}>{email}</Text>
          <Text style={styles.successBody}>{copy.successBody}</Text>
          <Pressable
            onPress={handleReset}
            disabled={cooldown > 0}
            accessibilityRole="button"
            accessibilityLabel={copy.resendA11y(cooldown)}
            accessibilityHint={copy.resendHint}
            accessibilityState={{ disabled: cooldown > 0 }}
            hitSlop={8}
          >
            <Text style={[styles.resend, cooldown > 0 && styles.resendDisabled]}>
              {cooldown > 0 ? copy.resendIn(cooldown) : copy.resend}
            </Text>
          </Pressable>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View style={styles.form}>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={error}
          returnKeyType="done"
          onSubmitEditing={handleReset}
        />
        <Button onPress={handleReset} fullWidth size="lg" loading={submitting}>
          {copy.send}
        </Button>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing[3],
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 38,
    lineHeight: 40,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: 24,
    color: Colors.textSecondary,
    marginBottom: Spacing[2],
  },
  success: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[6],
  },
  checkWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.success, 0.12),
    borderWidth: 1,
    borderColor: withOpacity(Colors.success, 0.24),
  },
  check: {
    fontFamily: FontFamily.bold,
    fontSize: 30,
    color: Colors.success,
  },
  successTitle: {
    fontFamily: FontFamily.display,
    fontSize: 36,
    lineHeight: 38,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  email: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  successBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  resend: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.brand,
  },
  resendDisabled: {
    color: Colors.textMuted,
  },
});
