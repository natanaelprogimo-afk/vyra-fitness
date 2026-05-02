import { useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import NoticeCard from '@/components/ui/NoticeCard';
import SafeScreen from '@/components/ui/SafeScreen';
import SectionHeader from '@/components/ui/SectionHeader';
import { Colors } from '@/constants/colors';
import { FontFamily, FontSize, Spacing } from '@/constants/theme';
import { useNotifications } from '@/hooks/useNotifications';
import { isWithinQuietHoursWindow } from '@/lib/notification-quiet-hours';
import {
  getExpoPushTokenDiagnostic,
  NOTIFICATION_ACTIONS,
  cancelAllNotifs,
  registerNotificationCategories,
  registerPushToken,
  requestNotificationPermissions,
  scheduleNotif,
  type NotifType,
} from '@/lib/notifications';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';

const QA_LAB_ENABLED =
  __DEV__ || process.env.EXPO_PUBLIC_ENABLE_QA_SESSION_BRIDGE === 'true';

function buildTriggerDate(secondsFromNow = 4) {
  return new Date(Date.now() + secondsFromNow * 1000);
}

function buildQaRequest(type: NotifType, input: {
  id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}, fireAt: Date): Notifications.NotificationRequestInput {
  return {
    identifier: input.id,
    content: {
      title: input.title,
      body: input.body,
      data: {
        type,
        ...(input.data ?? {}),
      },
      categoryIdentifier: type,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireAt,
    },
  };
}

function formatFireAt(date: Date) {
  return new Intl.DateTimeFormat('es-UY', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

function describeSmartNotificationBlockReason(
  reason:
    | 'permissions_disabled'
    | 'notifications_paused'
    | 'screen_active'
    | 'daily_cap_local'
    | 'daily_cap_remote'
    | 'quiet_hours'
    | 'schedule_failed',
) {
  switch (reason) {
    case 'permissions_disabled':
      return 'faltan permisos del sistema';
    case 'notifications_paused':
      return 'la capa de notificaciones esta pausada';
    case 'screen_active':
      return 'la pantalla actual ya esta absorbiendo la atencion';
    case 'daily_cap_local':
      return 'ya se alcanzo el tope local del dia';
    case 'daily_cap_remote':
      return 'el backend ya conto el tope diario';
    case 'quiet_hours':
      return 'quiet hours siguen activas';
    case 'schedule_failed':
      return 'Expo no devolvio un id al agendar';
    default:
      return 'hay otra condicion bloqueando la sonda';
  }
}

async function scheduleQaNotification(type: NotifType, input: {
  id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) {
  const fireAt = buildTriggerDate();
  const request = buildQaRequest(type, input, fireAt);
  const id = await scheduleNotif({
    id: input.id,
    type,
    title: input.title,
    body: input.body,
    trigger: request.trigger,
    data: input.data,
  });

  let diagnostic: string | null = null;
  if (!id) {
    const fallbackVariants: Array<{
      label: string;
      request: Notifications.NotificationRequestInput;
    }> = [
      {
        label: 'directo completo',
        request,
      },
      {
        label: 'sin categoryIdentifier',
        request: {
          ...request,
          content: {
            ...request.content,
            categoryIdentifier: undefined,
          },
        },
      },
      {
        label: 'sin data',
        request: {
          ...request,
          content: {
            ...request.content,
            data: undefined,
          },
        },
      },
      {
        label: 'minimo',
        request: {
          ...request,
          content: {
            title: input.title,
            body: input.body,
          },
        },
      },
    ];

    const notes: string[] = [];
    for (const variant of fallbackVariants) {
      try {
        const fallbackId = await Notifications.scheduleNotificationAsync(variant.request);
        await Notifications.cancelScheduledNotificationAsync(fallbackId);
        notes.push(`${variant.label}: ok`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        notes.push(`${variant.label}: ${message}`);
      }
    }
    diagnostic = notes.join(' | ');
  }

  return {
    fireAt,
    id,
    diagnostic,
  };
}

type QaScheduleResult = Awaited<ReturnType<typeof scheduleQaNotification>>;

export default function NotificationsLabScreen() {
  const [busy, setBusy] = useState(false);
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const { scheduleSmartNotificationDetailed } = useNotifications();
  const profile = useAuthStore((state) => state.profile);
  const user = useAuthStore((state) => state.user);
  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled);
  const quietHoursEnabled = useSettingsStore((state) => state.notificationQuietHoursEnabled);
  const quietHoursStart = useSettingsStore((state) => state.notificationQuietHoursStart);
  const quietHoursEnd = useSettingsStore((state) => state.notificationQuietHoursEnd);
  const setNotificationsEnabled = useSettingsStore((state) => state.setNotificationsEnabled);
  const setNotificationQuietHoursEnabled = useSettingsStore((state) => state.setNotificationQuietHoursEnabled);

  const readinessCopy = useMemo(
    () => 'Programa avisos locales cortos para probar acciones, deep links y respuesta de la app en Android real.',
    [],
  );

  const ensurePermissions = async () => {
    await registerNotificationCategories();
    const granted = await requestNotificationPermissions();
    if (!granted) {
      setLastEvent('Sin permiso del sistema. Activalo en Ajustes para seguir con la prueba.');
      await Linking.openSettings();
      return false;
    }
    return true;
  };

  const runQuietHoursProbe = async () => {
    setBusy(true);
    try {
      const ready = await ensurePermissions();
      if (!ready) return;

      const target = buildTriggerDate();
      const result = await scheduleSmartNotificationDetailed({
        id: `qa_quiet_${Date.now()}`,
        type: 'context_proactive',
        title: 'QA quiet hours',
        body: 'Este aviso no deberia programarse si la ventana silenciosa esta activa.',
        date: target,
      });

      const insideQuietWindow = isWithinQuietHoursWindow(
        target.getHours() * 60 + target.getMinutes(),
        quietHoursStart,
        quietHoursEnd,
        quietHoursEnabled,
      );

      if (result.scheduled) {
        setLastEvent(`La sonda de quiet hours si pudo programarse para ${formatFireAt(target)}.`);
        return;
      }

      setLastEvent(
        insideQuietWindow
          ? `Quiet hours bloquearon la sonda a las ${formatFireAt(target)}.`
          : `Quiet hours no bloquearon la sonda. Se freno porque ${describeSmartNotificationBlockReason(result.reason)}.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fallo desconocido al correr la sonda.';
      setLastEvent(message);
    } finally {
      setBusy(false);
    }
  };

  const runScheduled = async (
    label: string,
    callback: () => Promise<QaScheduleResult>,
  ) => {
    setBusy(true);
    try {
      const ready = await ensurePermissions();
      if (!ready) return;

      const result = await callback();
      setLastEvent(
        result.id
          ? `${label} programada para ${formatFireAt(result.fireAt)}.`
          : result.diagnostic
            ? `No pudimos programar ${label.toLowerCase()}: ${result.diagnostic}`
            : `No pudimos programar ${label.toLowerCase()}.`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Fallo desconocido al programar QA.';
      setLastEvent(message);
    } finally {
      setBusy(false);
    }
  };

  const runRemotePushDiagnostic = async () => {
    setBusy(true);
    try {
      const ready = await ensurePermissions();
      if (!ready) return;

      const diagnostic = await getExpoPushTokenDiagnostic();
      const userId = profile?.id ?? user?.id ?? null;
      if (diagnostic.token && userId) {
        await registerPushToken(userId);
      }

      if (diagnostic.token) {
        const preview = `${diagnostic.token.slice(0, 18)}...`;
        setLastEvent(
          `Push remoto listo (${diagnostic.permissionStatus}). ProjectId ${diagnostic.projectId ?? 'n/a'} · token ${preview}.`,
        );
        return;
      }

      setLastEvent(
        `Push remoto no listo (${diagnostic.permissionStatus}). ${diagnostic.error ?? 'Expo no devolvio token.'}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo diagnosticar push remoto.';
      setLastEvent(message);
    } finally {
      setBusy(false);
    }
  };

  const readRemotePushTokenOnly = async () => {
    setBusy(true);
    try {
      const ready = await ensurePermissions();
      if (!ready) return;

      const diagnostic = await getExpoPushTokenDiagnostic();
      if (diagnostic.token) {
        setLastEvent(`TOKEN COMPLETO: ${diagnostic.token}`);
        return;
      }

      setLastEvent(
        `Push remoto no listo (${diagnostic.permissionStatus}). ${diagnostic.error ?? 'Expo no devolvio token.'}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo leer el token remoto.';
      setLastEvent(message);
    } finally {
      setBusy(false);
    }
  };

  if (!QA_LAB_ENABLED) {
    return (
      <SafeScreen padHorizontal={false} padBottom>
        <Header title="Laboratorio de notificaciones" showBack color={Colors.warning} />
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
      <Header title="Laboratorio de notificaciones" showBack color={Colors.brand} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <NoticeCard
          title="Disparador QA local"
          body={readinessCopy}
          tone="info"
        />

        <Card>
          <SectionHeader
            eyebrow="Push remoto"
            title="Diagnostico de token"
            subtitle="Comprueba projectId, permiso y si Expo devuelve token remoto para este build."
          />
          <Button
            fullWidth
            color={Colors.success}
            disabled={busy}
            onPress={() => {
              void runRemotePushDiagnostic();
            }}
          >
            {busy ? 'Revisando...' : 'Diagnosticar push remoto'}
          </Button>
          <Button
            fullWidth
            variant="secondary"
            color={Colors.brand}
            disabled={busy}
            onPress={() => {
              void readRemotePushTokenOnly();
            }}
          >
            {busy ? 'Leyendo...' : 'Mostrar token remoto'}
          </Button>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Agua"
            title="Recordatorio con acciones"
            subtitle="Debe mostrar acciones para registrar agua o abrir el quick log."
          />
          <Button
            fullWidth
            color={Colors.brand}
            disabled={busy}
            onPress={() =>
              void runScheduled('Recordatorio de agua', () =>
                scheduleQaNotification('water_reminder', {
                  id: `qa_water_${Date.now()}`,
                  title: 'QA agua',
                  body: 'Valida registrar 250ml o abrir quick log.',
                  data: {
                    action: NOTIFICATION_ACTIONS.openQuickLog,
                    quickActionAmountMl: 250,
                    source: 'qa_notifications_lab',
                  },
                }),
              )
            }
          >
            {busy ? 'Programando...' : 'Agendar agua en 4s'}
          </Button>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Workout"
            title="Recordatorio con reingreso"
            subtitle="Debe abrir workout o marcar la rutina desde la propia notificacion."
          />
          <Button
            fullWidth
            color={Colors.info}
            disabled={busy}
            onPress={() =>
              void runScheduled('Recordatorio de workout', () =>
                scheduleQaNotification('workout_reminder', {
                  id: `qa_workout_${Date.now()}`,
                  title: 'QA workout',
                  body: 'Valida abrir la rutina o marcarla desde la notificacion.',
                  data: {
                    action: NOTIFICATION_ACTIONS.openWorkout,
                    source: 'qa_notifications_lab',
                  },
                }),
              )
            }
          >
            {busy ? 'Programando...' : 'Agendar workout en 4s'}
          </Button>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Quiet hours"
            title="Sonda de bloqueo inteligente"
            subtitle="Intenta programar un aviso contextual inmediato y confirma si la ventana silenciosa lo frena."
          />
          <Button
            fullWidth
            color={Colors.warning}
            disabled={busy}
            onPress={() => {
              void runQuietHoursProbe();
            }}
          >
            {busy ? 'Probando...' : 'Probar quiet hours ahora'}
          </Button>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Control"
            title="Limpieza rapida"
            subtitle="Util para repetir varias veces la prueba sin ruido."
          />
          <View style={styles.buttonStack}>
            <Button
              fullWidth
              variant="secondary"
              color={Colors.brand}
              disabled={busy}
              onPress={() => {
                setNotificationsEnabled(true);
                setLastEvent('Capa inteligente activada para seguir con la prueba.');
              }}
            >
              {notificationsEnabled ? 'Capa inteligente ya activa' : 'Activar capa inteligente'}
            </Button>
            <Button
              fullWidth
              variant="secondary"
              color={Colors.warning}
              disabled={busy}
              onPress={() => {
                setNotificationQuietHoursEnabled(!quietHoursEnabled);
                setLastEvent(
                  !quietHoursEnabled
                    ? 'Quiet hours activadas para la prueba.'
                    : 'Quiet hours desactivadas para la prueba.',
                );
              }}
            >
              {quietHoursEnabled ? 'Desactivar quiet hours' : 'Activar quiet hours'}
            </Button>
            <Button
              fullWidth
              variant="secondary"
              color={Colors.brand}
              disabled={busy}
              onPress={() => {
                void runScheduled('Limpieza', async () => {
                  await cancelAllNotifs();
                  return { fireAt: new Date(), id: 'cleared', diagnostic: null };
                });
              }}
            >
              Limpiar programadas
            </Button>
            <Button
              fullWidth
              variant="ghost"
              color={Colors.brand}
              onPress={() => void Linking.openSettings()}
            >
              Abrir ajustes del telefono
            </Button>
          </View>
        </Card>

        <Card>
          <SectionHeader
            eyebrow="Ultimo evento"
            title="Estado"
            subtitle="Sirve para saber si la notificacion quedo realmente programada."
          />
          <Text style={styles.eventText}>{lastEvent ?? 'Todavia no corriste ninguna prueba.'}</Text>
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
    paddingBottom: Spacing[8],
    gap: Spacing[4],
  },
  buttonStack: {
    gap: Spacing[3],
  },
  eventText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
});
