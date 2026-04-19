import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail } from '@/utils/validators';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const { resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

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
    const ok = await resetPassword(email.trim().toLowerCase());
    if (ok) {
      setSent(true);
      setCooldown(60);
    }
  };

  if (sent) {
    return (
      <SafeScreen>
        <View style={styles.success}>
          <View style={styles.checkWrap}>
            <Text style={styles.check}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Revisa tu bandeja de entrada</Text>
          <Text style={styles.email}>{email}</Text>
          <Text style={styles.successBody}>También revisa spam si no lo ves.</Text>
          <Pressable onPress={handleReset} disabled={cooldown > 0}>
            <Text style={[styles.resend, cooldown > 0 && styles.resendDisabled]}>
              {cooldown > 0 ? `Reenviar en ${cooldown}s` : 'Reenviar'}
            </Text>
          </Pressable>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View style={styles.form}>
        <Text style={styles.title}>Recupera tu acceso</Text>
        <Text style={styles.subtitle}>Ingresa tu email y te mandamos las instrucciones.</Text>
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
        <Button onPress={handleReset} fullWidth size="lg" loading={isLoading}>
          Enviar instrucciones
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
