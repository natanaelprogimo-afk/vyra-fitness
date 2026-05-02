import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import NoticeCard from '@/components/ui/NoticeCard';
import ScreenFooterSpacer from '@/components/ui/ScreenFooterSpacer';
import SectionHeader from '@/components/ui/SectionHeader';
import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { Spacing } from '@/constants/theme';
import { asRecord, getAuthHeaders, requestJson } from '@/services/backend/client';
import { supabase } from '@/lib/supabase';
import { isGuestAuthUser, MANAGED_GUEST_NAME } from '@/lib/guest-auth';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

type ClaimState = 'idle' | 'done';

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function ClaimAccountScreen() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const setUser = useAuthStore((state) => state.setUser);
  const setProfile = useAuthStore((state) => state.setProfile);
  const showToast = useUIStore((state) => state.showToast);

  const [name, setName] = useState(
    profile?.name && profile.name !== MANAGED_GUEST_NAME ? profile.name : '',
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [claimState, setClaimState] = useState<ClaimState>('idle');

  const isGuest = isGuestAuthUser(user);
  const normalizedEmail = useMemo(() => normalizeEmail(email), [email]);

  const validationError = useMemo(() => {
    if (!isGuest) return null;
    if (!name.trim()) return 'Agrega un nombre para identificar esta cuenta.';
    if (!isValidEmail(normalizedEmail)) return 'Ingresa un email valido para guardar la cuenta.';
    if (password.length < 8) return 'Usa al menos 8 caracteres para proteger tu cuenta.';
    if (confirmPassword !== password) return 'Las contrasenas no coinciden todavia.';
    return null;
  }, [confirmPassword, isGuest, name, normalizedEmail, password]);

  async function handleClaimAccount() {
    if (!user || !isGuest) return;
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    setSaving(true);
    setSubmitError(null);

    try {
      const response = await requestJson('/api/profile/claim-account', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          email: normalizedEmail,
          name: name.trim(),
          password,
        }),
      });

      if (!response.ok) {
        const payload = asRecord(response.data);
        throw new Error(
          typeof payload?.error === 'string' && payload.error.trim().length > 0
            ? payload.error
            : 'No pudimos guardar tu cuenta ahora mismo.',
        );
      }

      const payload = asRecord(response.data);
      const profilePayload = asRecord(payload?.profile);

      const refreshedUser = (await supabase.auth.getUser()).data.user ?? user;
      setUser(refreshedUser);

      if (profilePayload) {
        setProfile(profilePayload as never);
      } else if (profile) {
        setProfile({
          ...profile,
          email: normalizedEmail,
          name: name.trim(),
          updated_at: new Date().toISOString(),
        });
      }

      setClaimState('done');
      showToast('Cuenta guardada con email.', 'success');
    } catch (err) {
      const message =
        err instanceof Error && err.message.trim().length > 0
          ? err.message
          : 'No pudimos guardar tu cuenta ahora mismo.';
      setSubmitError(message);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  }

  if (!isGuest || !user) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Guardar cuenta" showBack color={Colors.brand} />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <NoticeCard
            title="Esta cuenta ya esta guardada"
            body="Ya tienes una cuenta permanente en este dispositivo. Puedes volver al hub de cuenta cuando quieras."
            tone="info"
            actionLabel="Volver a cuenta"
            onAction={() => router.replace(Routes.settings.account as never)}
          />
          <ScreenFooterSpacer extra={Spacing[2]} />
        </ScrollView>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Guardar cuenta" showBack color={Colors.brand} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {claimState === 'done' ? (
          <NoticeCard
            title="Cuenta guardada"
            body={`Tu progreso ya quedo vinculado a ${normalizedEmail}. La proxima vez podras entrar con email y contrasena.`}
            tone="success"
            actionLabel="Volver a cuenta"
            onAction={() => router.replace(Routes.settings.account as never)}
          />
        ) : null}

        {submitError ? (
          <NoticeCard
            title="Revisemos este paso"
            body={submitError}
            tone="error"
          />
        ) : null}

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Cuenta temporal"
            title="Convierte este invitado en una cuenta fija"
            subtitle="Mantienes el mismo perfil y el mismo historial en este dispositivo. Solo agregas un email y una contrasena para volver cuando quieras."
          />

          <Input
            label="Nombre"
            value={name}
            onChangeText={setName}
            placeholder="Como quieres verte en Vyra"
            autoCapitalize="words"
            autoCorrect={false}
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <Input
            label="Contrasena"
            value={password}
            onChangeText={setPassword}
            placeholder="Minimo 8 caracteres"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            secureToggleAccessibilityLabel="Mostrar contrasena nueva"
          />

          <Input
            label="Confirmar contrasena"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repite la contrasena"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            secureToggleAccessibilityLabel="Mostrar confirmacion de contrasena"
          />

          <Button
            onPress={() => {
              void handleClaimAccount();
            }}
            label={saving ? 'Guardando cuenta...' : 'Guardar cuenta con email'}
            loading={saving}
            disabled={Boolean(validationError) || saving}
            color={Colors.brand}
            fullWidth
          />
        </Card>

        <Card style={styles.card}>
          <SectionHeader
            eyebrow="Tambien puedes"
            title="Seguir con Google o Apple"
            subtitle="Si prefieres un proveedor externo, ese flujo sigue disponible desde Cuenta y seguridad."
          />

          <Button
            variant="secondary"
            color={Colors.brand}
            onPress={() => router.push(Routes.auth.google as never)}
          >
            Guardar con Google
          </Button>
          <Button
            variant="secondary"
            color={Colors.textPrimary}
            onPress={() => router.push(Routes.auth.apple as never)}
          >
            Guardar con Apple
          </Button>
        </Card>

        <ScreenFooterSpacer extra={Spacing[2]} />
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    gap: Spacing[4],
  },
  card: {
    gap: Spacing[4],
  },
});
