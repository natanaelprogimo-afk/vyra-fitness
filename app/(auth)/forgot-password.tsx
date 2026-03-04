// ============================================================
// VYRA FITNESS — Forgot Password Screen
// ============================================================

import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail } from '@/utils/validators';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const { resetPassword, isLoading } = useAuth();
  const [email, setEmail]   = useState('');
  const [error, setError]   = useState<string | null>(null);
  const [sent,  setSent]    = useState(false);

  const handleReset = async () => {
    const err = validateEmail(email);
    if (err) { setError(err); return; }
    setError(null);
    const ok = await resetPassword(email.trim().toLowerCase());
    if (ok) setSent(true);
  };

  if (sent) {
    return (
      <SafeScreen>
        <Header showBack />
        <View style={styles.sentContainer}>
          <Text style={styles.sentEmoji}>📧</Text>
          <Text style={styles.sentTitle}>¡Revisá tu email!</Text>
          <Text style={styles.sentText}>
            Te enviamos un link para restablecer tu contraseña a{'\n'}
            <Text style={styles.sentEmail}>{email}</Text>
          </Text>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <Header title="Recuperar contraseña" showBack />
      <View style={styles.form}>
        <Text style={styles.subtitle}>
          Ingresá tu email y te enviamos un link para crear una nueva contraseña.
        </Text>
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
        <Button onPress={handleReset} variant="primary" fullWidth size="lg" loading={isLoading} style={styles.cta}>
          Enviar link
        </Button>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  form:          { paddingTop: Spacing[6] },
  subtitle:      { fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: FontSize.base * 1.6, marginBottom: Spacing[5] },
  cta:           { marginTop: Spacing[4] },
  sentContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing[6] },
  sentEmoji:     { fontSize: 64, marginBottom: Spacing[5] },
  sentTitle:     { fontFamily: FontFamily.bold, fontSize: FontSize['2xl'], color: Colors.textPrimary, marginBottom: Spacing[3] },
  sentText:      { fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: FontSize.base * 1.6 },
  sentEmail:     { fontFamily: FontFamily.semibold, color: Colors.brand },
});