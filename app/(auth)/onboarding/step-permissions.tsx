import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Pedometer } from 'expo-sensors';
import OnboardingShell from '@/components/onboarding/OnboardingShell';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors, withOpacity } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { FontFamily, FontSize, Radius, Spacing } from '@/constants/theme';
import { loadOnboardingProgress, saveOnboardingProgress, type OnboardingDraft } from '@/lib/onboarding-storage';
import { router } from 'expo-router';
import { syncSleepSessionsFromHealthConnect, type HealthConnectSleepStatus } from '@/lib/health-connect-sleep';

function statusCopy(status: 'idle' | 'granted' | 'denied') {
  if (status === 'granted') return 'Listo';
  if (status === 'denied') return 'No ahora';
  return 'Opcional';
}

function sleepCopy(status: HealthConnectSleepStatus | null) {
  if (status === 'ready') return 'Conectado';
  if (status === 'unsupported') return 'Solo Android';
  if (status === 'unavailable') return 'Android';
  if (status === 'permissions_missing') return 'Faltan permisos';
  if (status === 'provider_update_required') return 'Actualizar';
  if (status === 'error') return 'Revisar';
  return Platform.OS === 'android' ? 'Android' : 'Manual';
}

export default function StepPermissionsScreen() {
  const [draft, setDraft] = useState<OnboardingDraft | null>(null);
  const [activityPermission, setActivityPermission] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [notificationsPermission, setNotificationsPermission] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [healthStatus, setHealthStatus] = useState<HealthConnectSleepStatus | null>(null);
  const [loadingSleep, setLoadingSleep] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      const progress = await loadOnboardingProgress();
      if (!active) return;
      const data = progress.data ?? {};
      setDraft(data);
      if (data.activity_permission) setActivityPermission(data.activity_permission);
      if (data.notifications_permission) setNotificationsPermission(data.notifications_permission);
      if (data.health_connect_status) setHealthStatus(data.health_connect_status as HealthConnectSleepStatus);
    })();
    return () => {
      active = false;
    };
  }, []);

  const blocks = useMemo(() => ([
    {
      id: 'steps',
      title: 'Pasos automáticos',
      subtitle: 'Sin GPS. Usa el acelerómetro del teléfono.',
      meta: 'Sin GPS. Solo movimiento básico.',
      tag: statusCopy(activityPermission),
      button: activityPermission === 'granted' ? 'Permiso listo' : 'Permitir acceso',
      color: Colors.steps,
      onPress: async () => {
        const result = await Pedometer.requestPermissionsAsync();
        const granted = result.granted ?? result.status === 'granted';
        setActivityPermission(granted ? 'granted' : 'denied');
      },
    },
    {
      id: 'notifications',
      title: 'Notificaciones',
      subtitle: '07:00 · 13:30 · 21:30',
      meta: 'Recordatorios útiles, no ruido.',
      tag: statusCopy(notificationsPermission),
      button: notificationsPermission === 'granted' ? 'Avisos activos' : 'Activar avisos',
      color: Colors.brand,
      onPress: async () => {
        const result = await Notifications.requestPermissionsAsync();
        const granted = result.granted ?? result.status === 'granted';
        setNotificationsPermission(granted ? 'granted' : 'denied');
      },
    },
    {
      id: 'sleep',
      title: 'Sueño automático',
      subtitle: 'Sincronizá tu sueño desde Health Connect.',
      meta: 'Mejora recovery y contexto diario.',
      tag: sleepCopy(healthStatus),
      button: 'Conectar sueño',
      color: Colors.sleep,
      onPress: async () => {
        setLoadingSleep(true);
        const result = await syncSleepSessionsFromHealthConnect({ promptForPermissions: true });
        setHealthStatus(result.status);
        setLoadingSleep(false);
      },
    },
  ]), [activityPermission, healthStatus, notificationsPermission]);

  const handleContinue = async () => {
    await saveOnboardingProgress(Routes.auth.onboarding.legal, {
      ...(draft ?? {}),
      activity_permission: activityPermission === 'granted' ? 'granted' : 'denied',
      notifications_permission: notificationsPermission === 'granted' ? 'granted' : 'denied',
      health_connect_enabled: healthStatus === 'ready',
      health_connect_status: healthStatus,
    });
    router.push(Routes.auth.onboarding.legal as any);
  };

  return (
    <OnboardingShell
      pathname={Routes.auth.onboarding.permissions}
      eyebrow="Conexión"
      title={
        <View>
          <Text style={styles.title}>Activá lo</Text>
          <Text style={styles.title}>automático.</Text>
        </View>
      }
      subtitle="Todo opcional. Mejor si suma contexto."
      footer={
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onPress={handleContinue}
          icon={<Ionicons name="arrow-forward" size={18} color={Colors.white} />}
          iconRight
        >
          Continuar
        </Button>
      }
    >
      {blocks.map((block) => (
        <Card key={block.id} style={styles.card} accentColor={block.color} shadow={false}>
          <View style={styles.cardTop}>
            <View style={styles.copy}>
              <Text style={styles.cardTitle}>{block.title}</Text>
              <Text style={styles.cardSubtitle}>{block.subtitle}</Text>
            </View>
            <View style={[styles.tag, { borderColor: withOpacity(block.color, 0.28), backgroundColor: withOpacity(block.color, 0.12) }]}>
              <Text style={[styles.tagText, { color: block.color }]}>{block.tag}</Text>
            </View>
          </View>
          <Text style={styles.cardMeta}>{block.meta}</Text>
          <Button variant="secondary" fullWidth onPress={block.onPress} color={block.color} loading={block.id === 'sleep' ? loadingSleep : false}>
            {block.button}
          </Button>
        </Card>
      ))}

      <Text style={styles.note}>Podés activar cualquiera de estos permisos después desde Ajustes.</Text>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: FontFamily.display,
    fontSize: 36,
    lineHeight: 38,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  card: {
    gap: Spacing[3],
    backgroundColor: withOpacity(Colors.surface1, 0.96),
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[3],
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  cardMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  tag: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
  },
  tagText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
  },
  note: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
