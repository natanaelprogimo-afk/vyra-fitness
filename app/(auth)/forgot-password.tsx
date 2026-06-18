// REDESIGNED: 2026-05-21 - password reset is simpler, clearer, and calmer
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { validateEmail } from '@/utils/validators';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { ForgotPasswordStrings } from '@/constants/strings';
import { Routes } from '@/constants/routes';
import { supabase } from '@/lib/supabase';

const SCREEN_COPY = {
  back: 'Volver',
  eyebrow: 'Recuperar acceso',
  backToLogin: 'Volver a iniciar sesion',
} as const;

export default function ForgotPasswordScreen() {
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
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payload?.error ?? ForgotPasswordStrings.sendFailed);
        }
      }

      setSent(true);
      setCooldown(60);
    } catch {
      setError(ForgotPasswordStrings.sendFailed);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <SafeScreen disableAtmosphere contentStyle={styles.successContainer}>
        <View style={styles.successCard}>
          <View style={styles.successIconWrap}>
            <Ionicons name="checkmark" size={28} color={Colors.black} />
          </View>

          <View style={styles.successCopy}>
            <Text style={styles.successTitle}>{ForgotPasswordStrings.successTitle}</Text>
            <Text style={styles.successBody}>{ForgotPasswordStrings.successBody}</Text>
            <Text style={styles.successEmail}>{email}</Text>
          </View>

          <View style={styles.successActions}>
            <Button
              onPress={() => router.replace(Routes.auth.login as never)}
              fullWidth
              size="md"
              haptic="medium"
            >
              {SCREEN_COPY.backToLogin}
            </Button>
            <Button
              onPress={handleReset}
              fullWidth
              size="md"
              variant="secondary"
              disabled={cooldown > 0}
              loading={submitting}
            >
              {cooldown > 0 ? ForgotPasswordStrings.resendIn(cooldown) : ForgotPasswordStrings.resend}
            </Button>
          </View>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen disableAtmosphere contentStyle={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed ? styles.backButtonPressed : null]}
          accessibilityRole="button"
          accessibilityLabel={SCREEN_COPY.back}
        >
          <Ionicons name="chevron-back" size={18} color={Colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{SCREEN_COPY.eyebrow}</Text>
        <Text style={styles.title}>{ForgotPasswordStrings.title}</Text>
        <Text style={styles.subtitle}>{ForgotPasswordStrings.subtitle}</Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Email"
          value={email}
          size="md"
          autoFocus
          onChangeText={(value) => {
            setEmail(value);
            if (error) setError(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          error={error}
          returnKeyType="done"
          onSubmitEditing={handleReset}
        />

        <Button onPress={handleReset} fullWidth size="md" loading={submitting} haptic="medium">
          {ForgotPasswordStrings.send}
        </Button>
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
    marginBottom: Spacing[6],
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
    marginBottom: Spacing[6],
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
  form: {
    gap: Spacing[4],
  },
  successContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  successCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: withOpacity(Colors.success, 0.22),
    backgroundColor: withOpacity(Colors.success, 0.06),
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[6],
    gap: Spacing[5],
  },
  successIconWrap: {
    width: 60,
    height: 60,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
  },
  successCopy: {
    gap: Spacing[2],
  },
  successTitle: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.display,
    fontSize: FontSize.xl,
    lineHeight: 30,
    letterSpacing: -0.6,
  },
  successBody: {
    color: Colors.textSecondary,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  successEmail: {
    color: Colors.textPrimary,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
  successActions: {
    gap: Spacing[3],
  },
});
