import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import NoticeCard from '@/components/ui/NoticeCard';
import SafeScreen from '@/components/ui/SafeScreen';
import SectionHeader from '@/components/ui/SectionHeader';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import { SUPABASE_STORAGE_KEY, supabase } from '@/lib/supabase';
import { getBackendUrl } from '@/services/backend/client';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

const QA_LAB_ENABLED =
  __DEV__ || process.env.EXPO_PUBLIC_ENABLE_QA_SESSION_BRIDGE === 'true';

function buildCorruptedSessionSnapshot(session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) {
  if (!session?.user) {
    return null;
  }

  return {
    ...session,
    access_token: 'vyra.invalid.access',
    refresh_token: 'vyra.invalid.refresh',
    expires_at: 0,
    expires_in: 0,
    token_type: 'bearer',
    user: session.user,
  };
}

export default function SessionLabScreen() {
  const authSession = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const showToast = useUIStore((state) => state.showToast);
  const [busy, setBusy] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const backendUrl = useMemo(() => getBackendUrl() || 'Sin backend configurado', []);

  const sessionSummary = useMemo(() => {
    if (!authSession?.user) return 'Sin sesion activa';
    const email = authSession.user.email ?? 'sin email';
    return `${email} · ${authSession.user.id.slice(0, 8)}`;
  }, [authSession?.user]);

  const handleCorruptStoredSession = async () => {
    setBusy(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const corrupted = buildCorruptedSessionSnapshot(session);
      if (!corrupted) {
        showToast('Necesitas una sesion activa antes de corromper el snapshot.', 'warning');
        return;
      }

      await Promise.all([
        SecureStore.setItemAsync(SUPABASE_STORAGE_KEY, JSON.stringify(corrupted)),
        SecureStore.setItemAsync(`${SUPABASE_STORAGE_KEY}-user`, JSON.stringify(session?.user ?? null)),
      ]);

      supabase.auth.stopAutoRefresh();
      setLastAction('Snapshot local corrompido. Fuerza cierre y vuelve a abrir Vyra para validar la recuperacion.');
      showToast('Snapshot QA listo. Cierra y abre la app para probar sesion vencida.', 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo corromper la sesion QA.';
      setLastAction(message);
      showToast('No se pudo preparar la sesion QA.', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (!QA_LAB_ENABLED) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Laboratorio de sesion" showBack color={Colors.warning} />
        <View style={styles.centered}>
          <NoticeCard
            title="QA interno desactivado"
            body="Esta ruta solo vive en builds locales con el bridge QA habilitado."
            tone="warning"
          />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen padHorizontal={false} padBottom>
      <Header title="Laboratorio de sesion" showBack color={Colors.brand} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <NoticeCard
          title="Herramienta local de resiliencia"
          body="Sirve para forzar un refresh token invalido en el snapshot persistido y validar que el arranque no quede en loop ni crashee."
          tone="info"
        />

        <Card>
          <SectionHeader
            eyebrow="Estado"
            title="Sesion actual"
            subtitle="Esta pantalla usa la cuenta abierta en el dispositivo ahora mismo."
          />
          <Text style={styles.value}>{sessionSummary}</Text>
          <Text style={styles.meta}>
            {profile?.name ? `Perfil: ${profile.name}` : 'Perfil aun no hidratado'}
          </Text>
          <Text style={styles.meta}>Backend activo: {backendUrl}</Text>
          <Text style={styles.meta}>
            QA bridge: {QA_LAB_ENABLED ? 'habilitado en este build' : 'deshabilitado en este build'}
          </Text>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Prueba"
            title="Corromper snapshot guardado"
            subtitle="No toca el runtime actual. La validacion ocurre al cerrar y reabrir la app."
          />
          <Button
            fullWidth
            color={Colors.warning}
            disabled={busy}
            onPress={() => {
              void handleCorruptStoredSession();
            }}
          >
            {busy ? 'Preparando...' : 'Preparar sesion vencida QA'}
          </Button>
          {lastAction ? <Text style={styles.meta}>{lastAction}</Text> : null}
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Salida"
            title="Que deberia pasar"
            subtitle="Al relanzar, Vyra debe descartar la sesion corrupta sin quedar atrapada."
          />
          <View style={styles.checks}>
            <Text style={styles.checkItem}>1. Sin loop de bootstrap.</Text>
            <Text style={styles.checkItem}>2. Sin pantalla en blanco.</Text>
            <Text style={styles.checkItem}>3. Sesion local limpiada con salida segura a Welcome.</Text>
          </View>
          <Button
            fullWidth
            variant="secondary"
            color={Colors.brand}
            onPress={() => router.push('/maintenance' as never)}
          >
            Abrir mantenimiento
          </Button>
        </Card>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    paddingHorizontal: Spacing[5],
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    gap: Spacing[4],
  },
  value: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  meta: {
    marginTop: Spacing[2],
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  checks: {
    gap: Spacing[2],
  },
  checkItem: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
});
