import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Colors, withOpacity } from '@/constants/colors';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';

export default function ResetPasswordScreen() {
  const session = useAuthStore((s) => s.session);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [hydratingLink, setHydratingLink] = useState(true);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [recoveryAccessToken, setRecoveryAccessToken] = useState<string | null>(null);

  const hasRecoverySession = Boolean(recoveryAccessToken || session?.access_token);

  useEffect(() => {
    let active = true;

    const parseTokens = (url: string) => {
      const query = url.includes('?') ? (url.split('?')[1]?.split('#')[0] ?? '') : '';
      const fragment = url.includes('#') ? (url.split('#')[1] ?? '') : '';
      const params = new URLSearchParams([query, fragment].filter(Boolean).join('&'));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');
      return {
        accessToken,
        refreshToken,
        type,
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
        setLinkError('No pudimos validar el enlace de recuperacion. Pide uno nuevo y vuelve a intentarlo.');
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
    if (password.trim().length < 8) {
      Alert.alert('Contrasena muy corta', 'Usa al menos 8 caracteres para proteger tu cuenta.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('No coinciden', 'Las contrasenas deben coincidir antes de continuar.');
      return;
    }

    setSaving(true);
    try {
      const activeAccessToken =
        recoveryAccessToken ??
        session?.access_token ??
        (await supabase.auth.getSession()).data.session?.access_token ??
        null;

      if (!activeAccessToken) {
        throw new Error('missing_recovery_session');
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${activeAccessToken}`,
        },
        body: JSON.stringify({ password: password.trim() }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.msg || payload?.error_description || 'password_update_failed');
      }

      void Promise.race([
        supabase.auth.signOut(),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]).catch(() => null);

      setPassword('');
      setConfirmPassword('');
      Alert.alert('Contrasena actualizada', 'Tu acceso ya quedo restablecido. Inicia sesion con la nueva contrasena.', [
        { text: 'Ir a login', onPress: () => router.replace('/(auth)/login' as any) },
      ]);
    } catch {
      Alert.alert('Error', 'No pudimos actualizar la contrasena. Abre de nuevo el enlace del email e intenta otra vez.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeScreen scrollable padBottom contentStyle={styles.content}>
      <Header
        title="Nueva contrasena"
        subtitle="Cierra la recuperacion y vuelve a tu cuenta con acceso seguro."
        showBack
        color={Colors.brand}
      />

      <Card style={styles.heroCard} accentColor={Colors.brand}>
        <View style={styles.heroIcon}>
          <Ionicons name="shield-checkmark-outline" size={22} color={Colors.brand} />
        </View>
        <Text style={styles.heroTitle}>Vuelve a entrar con una clave nueva y una sensacion de control real.</Text>
        <Text style={styles.heroBody}>
          Usa una contrasena nueva, unica y facil de recordar para ti. Cuando la guardes, te llevamos otra vez al login.
        </Text>
      </Card>

      {!hasRecoverySession && hydratingLink ? (
        <Card style={styles.infoCard} accentColor={Colors.brand}>
          <View style={styles.loader}>
            <ActivityIndicator color={Colors.brand} />
            <Text style={styles.infoTitle}>Validando enlace seguro</Text>
            <Text style={styles.infoBody}>Estamos preparando la sesion temporal para que puedas cambiar la contrasena.</Text>
          </View>
        </Card>
      ) : hasRecoverySession ? (
        <Card style={styles.formCard} accentColor={Colors.brand}>
          <Input
            label="Nueva contrasena"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            placeholder="Minimo 8 caracteres"
          />
          <Input
            label="Confirmar contrasena"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            placeholder="Repite la contrasena"
          />
          <Button onPress={handleSave} loading={saving} fullWidth color={Colors.brand}>
            Guardar nueva contrasena
          </Button>
        </Card>
      ) : (
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Vuelve a abrir el enlace del email</Text>
          <Text style={styles.infoBody}>
            {linkError ?? 'Para actualizar la contrasena necesitamos que entres desde el link de recuperacion enviado por Supabase.'}
          </Text>
          <Button onPress={() => router.replace('/(auth)/forgot-password' as any)} variant="secondary" fullWidth>
            Pedir un nuevo link
          </Button>
        </Card>
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing[6],
    paddingBottom: Spacing[10],
  },
  heroCard: {
    gap: Spacing[4],
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.brand, 0.14),
    borderWidth: 1,
    borderColor: withOpacity(Colors.brand, 0.24),
  },
  heroTitle: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['3xl'],
    color: Colors.textPrimary,
    lineHeight: 42,
  },
  heroBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: 26,
    color: Colors.textSecondary,
  },
  formCard: {
    gap: Spacing[4],
  },
  infoCard: {
    gap: Spacing[4],
  },
  loader: {
    gap: Spacing[3],
    alignItems: 'center',
  },
  infoTitle: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  infoBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    lineHeight: 26,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
