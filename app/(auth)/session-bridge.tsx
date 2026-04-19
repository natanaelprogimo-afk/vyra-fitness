import { useEffect, useMemo, useState } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Card from '@/components/ui/Card';
import SafeScreen from '@/components/ui/SafeScreen';
import Button from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import {
  armQaBridgeRuntimeMode,
  armQaBridgeSignedOutBypass,
  buildQaBridgeProfileSeed,
  clearQaBridgePayload,
  getQaBridgePayload,
} from '@/lib/qa-auth-bridge';
import { useAuthStore } from '@/stores/authStore';
import { useNavigationStore } from '@/stores/navigationStore';
import { useQaBridgeDebugStore } from '@/stores/qaBridgeDebugStore';
import type { UserProfile } from '@/types/user';

type SessionBridgeParams = {
  access_token?: string | string[];
  refresh_token?: string | string[];
  email?: string | string[];
  password?: string | string[];
  next?: string | string[];
  hold?: string | string[];
};

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

type BridgeStage =
  | 'missing_credentials'
  | 'signing_in'
  | 'auth_result_received'
  | 'session_restored'
  | 'remote_profile_ready'
  | 'store_hydrated'
  | 'redirecting'
  | 'error';

const QA_BRIDGE_ENABLED = __DEV__;
const QA_SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const QA_SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

function normalizeBridgeDestination(route: string | null): string | null {
  if (!route) return null;

  let normalized = route.trim();
  if (!normalized) return null;

  for (let i = 0; i < 3; i += 1) {
    try {
      const decoded = decodeURIComponent(normalized);
      if (!decoded || decoded === normalized) break;
      normalized = decoded.trim();
    } catch {
      break;
    }
  }

  const aliasMap: Record<string, string> = {
    '/home': Routes.tabs.home,
    '/index': Routes.tabs.home,
    '/(tabs)': Routes.tabs.home,
    '/(tabs)/': Routes.tabs.home,
    '/(tabs)/index': Routes.tabs.home,
    '/profile': Routes.tabs.profile,
    '/progress': Routes.progress.index,
    '/coach': Routes.tabs.home,
    '/nutrition': Routes.nutrition.index,
    '/workout': Routes.workout.index,
  };

  return aliasMap[normalized] ?? normalized;
}

async function ensureQaProfile(params: {
  userId: string;
  accessToken: string;
  fallbackEmail: string;
  fallbackName: string;
}) {
  const { userId, accessToken, fallbackEmail, fallbackName } = params;
  const nowIso = new Date().toISOString();
  const seedProfile = buildQaBridgeProfileSeed({
    userId,
    email: fallbackEmail,
    name: fallbackName,
    nowIso,
  });

  const existingProfileResult = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (existingProfileResult.error) {
    throw existingProfileResult.error;
  }

  if (existingProfileResult.data) {
    const existingProfile = existingProfileResult.data as UserProfile;

    if (existingProfile.onboarding_completed) {
      return existingProfile;
    }

    const qaUnlockPatch = {
      onboarding_completed: true,
      updated_at: nowIso,
      email: existingProfile.email || fallbackEmail,
      name: existingProfile.name || fallbackName,
    };

    if (QA_SUPABASE_URL && QA_SUPABASE_ANON_KEY) {
      try {
        const patchResponse = await fetch(
          `${QA_SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,
          {
            method: 'PATCH',
            headers: {
              apikey: QA_SUPABASE_ANON_KEY,
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              Prefer: 'return=representation',
            },
            body: JSON.stringify(qaUnlockPatch),
          }
        );

        if (patchResponse.ok) {
          const patchedRows = (await patchResponse.json()) as UserProfile[];
          if (patchedRows[0]) {
            return patchedRows[0];
          }
        } else {
          console.warn(
            '[Vyra/QA] REST patch could not unlock onboarding on existing profile.',
            await patchResponse.text()
          );
        }
      } catch (restPatchError) {
        console.warn('[Vyra/QA] REST patch failed while unlocking onboarding.', restPatchError);
      }
    }

    const updatedProfileResult = await supabase
      .from('profiles')
      .update(qaUnlockPatch)
      .eq('id', userId)
      .select('*')
      .maybeSingle();

    if (updatedProfileResult.error) {
      console.warn('[Vyra/QA] Could not unlock onboarding on existing profile.', updatedProfileResult.error);
      return {
        ...seedProfile,
        ...existingProfile,
        ...qaUnlockPatch,
      } as UserProfile;
    }

    return ((updatedProfileResult.data as UserProfile | null) ?? {
      ...seedProfile,
      ...existingProfile,
      ...qaUnlockPatch,
    }) as UserProfile;
  }

  const insertResult = await supabase.from('profiles').insert(seedProfile);

  if (insertResult.error) {
    console.warn('[Vyra/QA] Could not seed remote profile during session bridge.', insertResult.error);
    return seedProfile;
  }

  const insertedProfileResult = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (insertedProfileResult.error) {
    throw insertedProfileResult.error;
  }

  return (insertedProfileResult.data as UserProfile | null) ?? seedProfile;
}

export default function SessionBridgeScreen() {
  const params = useLocalSearchParams<SessionBridgeParams>();
  const cachedPayload = QA_BRIDGE_ENABLED ? getQaBridgePayload() : null;
  const setPostAuthRoute = useNavigationStore((s) => s.setPostAuthRoute);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const session = useAuthStore((s) => s.session);
  const user = useAuthStore((s) => s.user);
  const hasResolvedProfile = useAuthStore((s) => s.hasResolvedProfile);
  const setSession = useAuthStore((s) => s.setSession);
  const setUser = useAuthStore((s) => s.setUser);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setHasResolvedProfile = useAuthStore((s) => s.setHasResolvedProfile);
  const [bridgeError, setBridgeError] = useState<string | null>(null);
  const [bridgeStage, setBridgeStage] = useState<BridgeStage>('signing_in');
  const [bridgeDetail, setBridgeDetail] = useState('Preparando el puente QA del emulador.');
  const setQaDebugSnapshot = useQaBridgeDebugStore((s) => s.setSnapshot);

  const accessToken = useMemo(
    () => firstParam(params.access_token) ?? cachedPayload?.access_token ?? null,
    [cachedPayload?.access_token, params.access_token]
  );
  const refreshToken = useMemo(
    () => firstParam(params.refresh_token) ?? cachedPayload?.refresh_token ?? null,
    [cachedPayload?.refresh_token, params.refresh_token]
  );
  const email = useMemo(
    () => firstParam(params.email) ?? cachedPayload?.email ?? null,
    [cachedPayload?.email, params.email]
  );
  const password = useMemo(
    () => firstParam(params.password) ?? cachedPayload?.password ?? null,
    [cachedPayload?.password, params.password]
  );
  const nextRoute = useMemo(
    () => normalizeBridgeDestination(firstParam(params.next) ?? cachedPayload?.next ?? null),
    [cachedPayload?.next, params.next]
  );
  const holdBridge = useMemo(() => {
    const value = firstParam(params.hold) ?? cachedPayload?.hold ?? null;
    return value === '1' || value === 'true';
  }, [cachedPayload?.hold, params.hold]);

  useEffect(() => {
    if (!QA_BRIDGE_ENABLED) return;

    let active = true;
    const updateBridgeStatus = (stage: BridgeStage, detail: string) => {
      setBridgeStage(stage);
      setBridgeDetail(detail);
      setQaDebugSnapshot({
        source: 'session-bridge',
        stage,
        detail,
      });
    };

    const hydrateSession = async () => {
      const hasTokenPair = Boolean(accessToken && refreshToken);
      const hasCredentials = Boolean(email && password);

      if (!hasTokenPair && !hasCredentials) {
        if (active) {
          updateBridgeStatus('missing_credentials', 'No llegaron credenciales en el deeplink QA.');
          setBridgeError('Faltan credenciales QA para abrir la sesión del emulador.');
        }
        return;
      }

      setBridgeError(null);
      armQaBridgeRuntimeMode();
      updateBridgeStatus(
        'signing_in',
        hasTokenPair
          ?  'Probando restaurar la sesión con access + refresh token.'
          : `Probando login QA con ${email!.trim().toLowerCase()}.`
      );
      if (nextRoute) {
        setPostAuthRoute(nextRoute);
      }

      try {
        const result = hasTokenPair
          ?  await supabase.auth.setSession({
              access_token: accessToken!,
              refresh_token: refreshToken!,
            })
          : await supabase.auth.signInWithPassword({
              email: email!.trim().toLowerCase(),
              password: password!,
            });

        const { error } = result;
        if (error) throw error;

        if (!active) return;
        updateBridgeStatus('auth_result_received', 'Supabase acepto la autenticacion. Buscando la sesión efectiva.');

        const resolvedSession =
          'session' in result.data && result.data.session
            ?  result.data.session
            : (await supabase.auth.getSession()).data.session;

        if (!resolvedSession?.user) {
          throw new Error('Supabase no devolvio una sesión útil despues del bridge QA.');
        }

        if (!active) return;
        updateBridgeStatus(
          'session_restored',
          'La sesión QA ya existe. Hidratando un perfil minimo para destrabar pantallas privadas.'
        );

        const fallbackEmail = resolvedSession.user.email ?? email?.trim().toLowerCase() ?? '';
        const fallbackName =
          typeof resolvedSession.user.user_metadata?.name === 'string' &&
          resolvedSession.user.user_metadata.name.trim().length > 0
            ?  resolvedSession.user.user_metadata.name.trim()
            : fallbackEmail.split('@')[0] || 'Usuario';
        const profile = await ensureQaProfile({
          userId: resolvedSession.user.id,
          accessToken: resolvedSession.access_token,
          fallbackEmail,
          fallbackName,
        });

        armQaBridgeSignedOutBypass();
        updateBridgeStatus(
          'remote_profile_ready',
          'La cuenta QA ya tiene un perfil remoto útil. Terminando de hidratar el store local.'
        );
        setSession(resolvedSession);
        setUser(resolvedSession.user);
        setProfile(profile);
        setHasResolvedProfile(true);

        if (!active) return;
        clearQaBridgePayload();
        updateBridgeStatus(
          'store_hydrated',
          holdBridge
            ?  'Bridge listo. Dejamos la sesión QA abierta para revisar el estado antes de saltar a otra pantalla.'
            : 'Bridge listo. Sesion QA abierta y esperando una acción manual.'
        );

        if (holdBridge || !nextRoute) {
          return;
        }

        updateBridgeStatus(
          'store_hydrated',
          'Store local hidratado. Redirigiendo a la ruta privada para seguir la auditoria visual.'
        );

        const targetRoute = nextRoute as never;
        setTimeout(() => {
          if (!active) return;
          updateBridgeStatus('redirecting', `Saltando a ${nextRoute}.`);
          router.replace(targetRoute);
        }, 250);
      } catch (error) {
        if (!active) return;
        const message =
          error instanceof Error && error.message.trim().length > 0
            ?  error.message.trim()
            : 'No pudimos hidratar la sesión QA.';
        updateBridgeStatus('error', message);
        setBridgeError('No pudimos hidratar la sesión QA. Vuelve a generar el enlace y probamos otra vez.');
        console.warn('[Vyra/QA] Session bridge failed.', error);
      }
    };

    void hydrateSession();

    return () => {
      active = false;
    };
  }, [
    accessToken,
    email,
    holdBridge,
    nextRoute,
    password,
    refreshToken,
    setHasResolvedProfile,
    setPostAuthRoute,
    setProfile,
    setQaDebugSnapshot,
    setSession,
    setUser,
  ]);

  useEffect(() => {
    if (!QA_BRIDGE_ENABLED) return;
    if (holdBridge) return;
    if (!isInitialized) return;
    if (session && user && hasResolvedProfile) {
      router.replace((nextRoute ?? '/') as never);
    }
  }, [hasResolvedProfile, holdBridge, isInitialized, nextRoute, session, user]);

  if (!QA_BRIDGE_ENABLED) {
    return (
      <SafeScreen contentStyle={styles.content}>
        <Card style={styles.card} accentColor={Colors.warning}>
          <Text style={[styles.kicker, { color: Colors.warning }]}>Ruta interna</Text>
          <Text style={styles.title}>Session bridge desactivado</Text>
          <Text style={styles.body}>
            Esta pantalla solo queda disponible en desarrollo local. La app publica ya no hidrata sesiones QA desde esta ruta.
          </Text>
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>Estado</Text>
            <Text style={styles.statusValue}>disabled</Text>
            <Text style={styles.statusMeta}>Si necesitas esta herramienta para QA, corre la app en modo desarrollo.</Text>
          </View>
          <Button onPress={() => router.replace('/welcome' as never)} fullWidth>
            Volver a welcome
          </Button>
        </Card>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen contentStyle={styles.content}>
      <Card style={styles.card} accentColor={Colors.brand}>
        <Text style={styles.kicker}>QA interno del emulador</Text>
        <Text style={styles.title}>{bridgeError ? 'Sesion QA no disponible' : 'Abriendo sesión QA'}</Text>
        <Text style={styles.body}>
          {bridgeError ??
            'Estamos conectando la cuenta QA del emulador para abrir pantallas privadas con contexto real.'}
        </Text>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Estado</Text>
          <Text style={styles.statusValue}>{bridgeStage}</Text>
          <Text style={styles.statusMeta}>{bridgeDetail}</Text>
        </View>

        <View style={styles.statusGrid}>
          <View style={styles.statusChip}>
            <Text style={styles.statusChipLabel}>Email</Text>
            <Text style={styles.statusChipValue}>{email ?? 'token-bridge'}</Text>
          </View>
          <View style={styles.statusChip}>
            <Text style={styles.statusChipLabel}>Siguiente</Text>
            <Text style={styles.statusChipValue}>{nextRoute ?? (holdBridge ? 'hold' : '/')}</Text>
          </View>
          <View style={styles.statusChip}>
            <Text style={styles.statusChipLabel}>Store</Text>
            <Text style={styles.statusChipValue}>
              {session && user ? (hasResolvedProfile ? 'lista' : 'hidratando') : isInitialized ? 'sin sesión' : 'boot'}
            </Text>
          </View>
        </View>

        <Button onPress={() => router.replace((nextRoute ?? '/') as never)} fullWidth variant="secondary">
          Abrir destino igual
        </Button>
        <Button onPress={() => router.replace('/welcome' as never)} fullWidth>
          Volver a welcome
        </Button>
      </Card>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: Spacing[6],
  },
  card: {
    gap: Spacing[4],
  },
  kicker: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['3xl'],
    color: Colors.textPrimary,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  statusCard: {
    gap: Spacing[2],
    padding: Spacing[4],
    borderRadius: 24,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  statusValue: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['2xl'],
    color: Colors.textPrimary,
  },
  statusMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  statusGrid: {
    gap: Spacing[3],
  },
  statusChip: {
    gap: Spacing[1],
    padding: Spacing[3],
    borderRadius: 20,
    backgroundColor: Colors.surface1,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusChipLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusChipValue: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
});

