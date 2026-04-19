import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export default function ResetPasswordScreen() {
  const session = useAuthStore((state) => state.session);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hydratingLink, setHydratingLink] = useState(true);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [recoveryAccessToken, setRecoveryAccessToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const checks = useMemo(
    () => [
      { label: '8+ caracteres', ok: password.trim().length >= 8 },
      { label: 'Coinciden', ok: password.length > 0 && password === confirmPassword },
    ],
    [confirmPassword, password],
  );

  const hasRecoverySession = Boolean(recoveryAccessToken || session?.access_token);

  useEffect(() => {
    let active = true;

    const parseTokens = (url: string) => {
      const query = url.includes('?') ? (url.split('?')[1]?.split('#')[0] ?? '') : '';
      const fragment = url.includes('#') ? (url.split('#')[1] ?? '') : '';
      const params = new URLSearchParams([query, fragment].filter(Boolean).join('&'));
      return {
        accessToken: params.get('access_token'),
        refreshToken: params.get('refresh_token'),
        type: params.get('type'),
      };
    };

    const hydrateFromUrl = async (url: string | null | undefined) => {
      if (!active) return;
      if (!url) {
        setHydratingLink(false);
        return;
      }

      const { accessToken, refreshToken, type } = parseTokens(url);
      if (!accessToken || !refreshToken || (type && type !== 'recovery')) {
        setHydratingLink(false);
        return;
      }

      setHydratingLink(true);
      setLinkError(null);
      setRecoveryAccessToken(accessToken);
      try {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) throw error;
      } catch {
        if (!active) return;
        setLinkError('No pudimos validar el enlace de recuperacion. Pide uno nuevo e intenta otra vez.');
      } finally {
        if (active) setHydratingLink(false);
      }
    };

    void Linking.getInitialURL().then(hydrateFromUrl);
    const subscription = Linking.addEventListener('url', ({ url }) => {
      void hydrateFromUrl(url);
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  async function handleSave() {
    setSaveError(null);
    if (password.trim().length < 8) {
      setSaveError('Usa una contrasena de al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setSaveError('Las contrasenas tienen que coincidir.');
      return;
    }

    setSaving(true);
    try {
      const activeAccessToken =
        recoveryAccessToken ??
        session?.access_token ??
        (await supabase.auth.getSession()).data.session?.access_token ??
        null;

      if (!activeAccessToken) throw new Error('missing_recovery_session');

      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${activeAccessToken}`,
        },
        body: JSON.stringify({ password: password.trim() }),
      });

      if (!response.ok) throw new Error('password_update_failed');

      void supabase.auth.signOut().catch(() => null);
      setCompleted(true);
      setPassword('');
      setConfirmPassword('');
    } catch {
      setSaveError('No pudimos actualizar la contrasena. Vuelve a abrir el enlace del email e intenta otra vez.');
    } finally {
      setSaving(false);
    }
  }

  if (completed) {
    return (
      <SafeScreen scrollable padBottom>
        <View style={styles.success}>
          <View style={styles.checkWrap}>
            <Text style={styles.check}>OK</Text>
          </View>
          <Text style={styles.successTitle}>Listo. Ya puedes iniciar sesion.</Text>
          <Text style={styles.successBody}>Tu nueva contrasena ya quedo guardada.</Text>
          <Button onPress={() => router.replace('/(auth)/login' as never)} fullWidth size="lg">
            Ir a login
          </Button>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen scrollable padBottom>
      <View style={styles.hero}>
        <View style={styles.lockWrap}>
          <Text style={styles.lockIcon}>OK</Text>
        </View>
        <Text style={styles.title}>Nueva contrasena</Text>
      </View>

      {!hasRecoverySession && hydratingLink ? (
        <Card style={styles.infoCard}>
          <ActivityIndicator color={Colors.brand} />
          <Text style={styles.infoTitle}>Validando enlace seguro</Text>
        </Card>
      ) : hasRecoverySession ? (
        <View style={styles.form}>
          <Input
            label="Nueva contrasena"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (saveError) setSaveError(null);
            }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            placeholder="Minimo 8 caracteres"
            iconRight={<Text style={styles.eye}>{showPassword ? 'Ocultar' : 'Ver'}</Text>}
            onPressRight={() => setShowPassword((value) => !value)}
          />
          <Input
            label="Confirmar contrasena"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              if (saveError) setSaveError(null);
            }}
            secureTextEntry={!showConfirm}
            autoCapitalize="none"
            placeholder="Repite la contrasena"
            iconRight={<Text style={styles.eye}>{showConfirm ? 'Ocultar' : 'Ver'}</Text>}
            onPressRight={() => setShowConfirm((value) => !value)}
          />

          <View style={styles.checks}>
            {checks.map((item) => (
              <View key={item.label} style={styles.checkRow}>
                <View style={[styles.dot, item.ok && styles.dotOk]} />
                <Text style={[styles.checkText, item.ok && styles.checkTextOk]}>{item.label}</Text>
              </View>
            ))}
          </View>

          {saveError ? (
            <Card style={styles.errorCard}>
              <Text style={styles.errorText}>{saveError}</Text>
            </Card>
          ) : null}

          <Button onPress={handleSave} loading={saving} fullWidth size="lg">
            Guardar contrasena
          </Button>
        </View>
      ) : (
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Vuelve a abrir el enlace del email</Text>
          <Text style={styles.infoBody}>
            {linkError ?? 'Necesitamos que entres desde el link de recuperacion para poder cambiar la contrasena.'}
          </Text>
          <Button onPress={() => router.replace('/(auth)/forgot-password' as never)} variant="secondary" fullWidth>
            Pedir un nuevo link
          </Button>
        </Card>
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: Spacing[3],
    marginTop: Spacing[4],
    marginBottom: Spacing[6],
  },
  lockWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.brand, 0.12),
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.24),
  },
  lockIcon: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.brand,
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: 40,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  form: {
    gap: Spacing[3],
  },
  checks: {
    gap: Spacing[2],
    marginBottom: Spacing[1],
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: withOpacity(Colors.white, 0.12),
  },
  dotOk: {
    backgroundColor: Colors.success,
  },
  checkText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  checkTextOk: {
    color: Colors.textSecondary,
  },
  eye: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.brand,
  },
  infoCard: {
    alignItems: 'center',
    gap: Spacing[3],
  },
  infoTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.lg,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  infoBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: 24,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorCard: {
    backgroundColor: withOpacity(Colors.error, 0.1),
    borderColor: withOpacity(Colors.error, 0.22),
  },
  errorText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.error,
  },
  success: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing[3],
    alignItems: 'center',
    paddingVertical: Spacing[10],
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
    fontSize: 18,
    color: Colors.success,
    letterSpacing: 1.4,
  },
  successTitle: {
    fontFamily: FontFamily.display,
    fontSize: 38,
    lineHeight: 40,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  successBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
