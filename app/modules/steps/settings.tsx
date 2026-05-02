// ============================================================
// VYRA FITNESS — Pasos: Configurar meta
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import SafeScreen from '@/components/ui/SafeScreen';
import Header from '@/components/layout/Header';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Colors } from '@/constants/colors';
import { FontSize, FontFamily, Spacing, Radius } from '@/constants/theme';
import {
  openHealthConnectStepsSettings,
  readTodayStepsFromHealthConnect,
  type HealthConnectStepsResult,
} from '@/lib/health-connect-steps';

const PRESETS = [
  { label: '6.000',  value: 6000,  desc: 'Base realista'   },
  { label: '7.500',  value: 7500,  desc: 'Buen ritmo'      },
  { label: '9.000',  value: 9000,  desc: 'Activo'          },
  { label: '10.500', value: 10500, desc: 'Muy activo'      },
  { label: '12.000', value: 12000, desc: 'Reto fuerte'     },
  { label: '15.000', value: 15000, desc: 'Nivel atleta'    },
];

const HEALTH_CONNECT_RESPONSE_TIMEOUT_MS = 9000;

export default function StepsSettingsScreen() {
  const profile             = useAuthStore((s) => s.profile);
  const { updateUserProfile, isLoading } = useAuth();
  const showToast = useUIStore((state) => state.showToast);
  const [goal,  setGoal]  = useState((profile?.step_goal ?? 10000).toString());
  const [error, setError] = useState<string | null>(null);
  const [healthConnect, setHealthConnect] = useState<HealthConnectStepsResult | null>(null);
  const [healthConnectLoading, setHealthConnectLoading] = useState(false);
  const appStateRef = useRef(AppState.currentState);
  const latestHealthRefreshRef = useRef(0);
  const activeHealthRefreshRef = useRef<number | null>(null);
  const queuedHealthRetryRef = useRef(false);

  const refreshHealthConnect = useCallback(async (promptForPermissions: boolean) => {
    if (Platform.OS !== 'android') return;
    if (!promptForPermissions && activeHealthRefreshRef.current !== null) return;

    const refreshId = latestHealthRefreshRef.current + 1;
    latestHealthRefreshRef.current = refreshId;
    activeHealthRefreshRef.current = refreshId;
    setHealthConnectLoading(true);
    try {
      const result = await Promise.race<HealthConnectStepsResult>([
        readTodayStepsFromHealthConnect({ promptForPermissions }),
        new Promise<HealthConnectStepsResult>((resolve) => {
          setTimeout(() => {
            resolve({
              status: 'error',
              permissionsGranted: false,
              steps: 0,
              message:
                'Health Connect no respondio a tiempo. Reintenta o revisa permisos en ajustes del sistema.',
              dataOrigins: [],
            });
          }, HEALTH_CONNECT_RESPONSE_TIMEOUT_MS);
        }),
      ]);

      if (refreshId !== latestHealthRefreshRef.current) {
        return;
      }

      setHealthConnect(result);

      if (promptForPermissions) {
        if (result.status === 'ready') {
          showToast(
            `Health Connect conectado. Hoy encontramos ${result.steps.toLocaleString('es')} pasos.`,
            'success',
          );
        } else if (result.message) {
          showToast(result.message, result.status === 'permissions_missing' ? 'warning' : 'error');
        }
      }
    } finally {
      if (refreshId === latestHealthRefreshRef.current) {
        activeHealthRefreshRef.current = null;
        setHealthConnectLoading(false);
      }

      if (queuedHealthRetryRef.current && refreshId === latestHealthRefreshRef.current) {
        queuedHealthRetryRef.current = false;
        void refreshHealthConnect(false);
      }
    }
  }, [showToast]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void refreshHealthConnect(false);
  }, [refreshHealthConnect]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const subscription = AppState.addEventListener('change', (nextState) => {
      const returnedToApp =
        (appStateRef.current === 'inactive' || appStateRef.current === 'background') &&
        nextState === 'active';
      appStateRef.current = nextState;

      if (returnedToApp) {
        if (activeHealthRefreshRef.current !== null) {
          queuedHealthRetryRef.current = true;
          return;
        }
        void refreshHealthConnect(false);
      }
    });

    return () => subscription.remove();
  }, [refreshHealthConnect]);

  const handleSave = async () => {
    const n = parseInt(goal);
    if (isNaN(n) || n < 1000 || n > 100000) { setError('Ingresá entre 1.000 y 100.000 pasos'); return; }
    setError(null);
    const ok = await updateUserProfile({ step_goal: n });
    if (ok) router.back();
  };

  return (
    <SafeScreen scrollable>
      <Header eyebrow="Pasos" title="Meta" showBack color={Colors.steps} />
      <Text style={styles.sub}>Empieza con una meta que puedas sostener de verdad. Si luego te queda corta, la subes.</Text>

      <View style={styles.presets}>
        {PRESETS.map((p) => (
          <Pressable
            key={p.value}
            onPress={() => setGoal(p.value.toString())}
            style={[styles.preset, parseInt(goal) === p.value && styles.presetActive]}
            accessibilityRole="radio"
            accessibilityLabel={p.label}
            accessibilityHint={p.desc}
            accessibilityState={{ selected: parseInt(goal) === p.value }}
            hitSlop={8}
          >
            <Text style={[styles.presetLabel, parseInt(goal) === p.value && { color: Colors.steps }]}>{p.label}</Text>
            <Text style={styles.presetDesc}>{p.desc}</Text>
          </Pressable>
        ))}
      </View>

      <Input
        label="Meta personalizada"
        value={goal}
        onChangeText={setGoal}
        keyboardType="numeric"
        unit="pasos"
        error={error}
        style={styles.input}
      />

      {Platform.OS === 'android' ? (
        <View style={styles.healthCard}>
          <Text style={styles.healthTitle}>Health Connect</Text>
          <Text style={styles.healthBody}>
            Recupera pasos aunque cierres la app y usa datos de Google Fit, Fitbit y apps compatibles.
          </Text>

          <View style={styles.healthStatusRow}>
            <View style={[
              styles.statusBadge,
              healthConnect?.status === 'ready'
                ? styles.statusBadgeReady
                : styles.statusBadgeMuted,
            ]}>
              <Text style={[
                styles.statusBadgeText,
                healthConnect?.status === 'ready'
                  ? styles.statusBadgeTextReady
                  : undefined,
              ]}>
                {healthConnect?.status === 'ready' ? 'Conectado' : 'Sin conectar'}
              </Text>
            </View>
            {healthConnect?.status === 'ready' ? (
              <Text style={styles.healthSteps}>
                {healthConnect.steps.toLocaleString('es')} pasos hoy
              </Text>
            ) : null}
          </View>

          <Text style={styles.healthHint}>
            {healthConnect?.message ?? 'Si activas permisos, Vyra puede recuperar actividad incluso si no tuviste la app abierta.'}
          </Text>

          {healthConnect?.dataOrigins?.length ? (
            <Text style={styles.healthSources}>
              Fuentes: {healthConnect.dataOrigins.join(', ')}
            </Text>
          ) : null}

          <View style={styles.healthActions}>
            <Button
              onPress={() => void refreshHealthConnect(true)}
              variant="secondary"
              loading={healthConnectLoading}
              fullWidth
            >
              {healthConnect?.status === 'ready' ? 'Actualizar lectura' : 'Conectar Health Connect'}
            </Button>
            <Button
              onPress={openHealthConnectStepsSettings}
              variant="ghost"
              fullWidth
            >
              Abrir ajustes del sistema
            </Button>
          </View>
        </View>
      ) : null}

      <Button onPress={handleSave} variant="primary" fullWidth size="lg" loading={isLoading}>
        Guardar
      </Button>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  sub:         { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing[2], marginBottom: Spacing[5] },
  presets:     { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginBottom: Spacing[5] },
  preset:      { width: '30%', alignItems: 'center', paddingVertical: Spacing[3], backgroundColor: Colors.bgSurface, borderRadius: Radius.xl, borderWidth: 1.5, borderColor: Colors.border },
  presetActive:{ borderColor: Colors.steps, backgroundColor: `${Colors.steps}12` },
  presetLabel: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.textPrimary },
  presetDesc:  { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },
  input:       { marginBottom: Spacing[6] },
  healthCard: {
    marginBottom: Spacing[6],
    padding: Spacing[4],
    borderRadius: Radius.xl,
    backgroundColor: Colors.bgSurface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing[3],
  },
  healthTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  healthBody: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  healthStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  statusBadge: {
    minHeight: 32,
    paddingHorizontal: Spacing[3],
    borderRadius: Radius.full,
    justifyContent: 'center',
    borderWidth: 1,
  },
  statusBadgeReady: {
    backgroundColor: `${Colors.steps}14`,
    borderColor: `${Colors.steps}3C`,
  },
  statusBadgeMuted: {
    backgroundColor: Colors.bgElevated,
    borderColor: Colors.border,
  },
  statusBadgeText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  statusBadgeTextReady: {
    color: Colors.steps,
  },
  healthSteps: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textPrimary,
  },
  healthHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textMuted,
  },
  healthSources: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  healthActions: {
    gap: Spacing[2],
  },
});
