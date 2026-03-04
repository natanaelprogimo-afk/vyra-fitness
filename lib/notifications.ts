import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';

// Configurar cómo se muestran las notificaciones cuando la app está en primer plano
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ── Tipos de notificación Vyra ─────────────────────────────────────────────
export type NotifType =
  | 'water_reminder'
  | 'fasting_phase'
  | 'fasting_complete'
  | 'step_milestone'
  | 'sleep_bedtime'
  | 'mental_checkin'
  | 'daily_summary'
  | 'streak_at_risk'
  | 'coach_proactive'
  | 'supplement_reminder'
  | 'workout_reminder';

export interface ScheduledNotif {
  id:        string;
  type:      NotifType;
  title:     string;
  body:      string;
  trigger:   Notifications.NotificationTriggerInput;
  data?:     Record<string, unknown>;
}

// ── Permisos ───────────────────────────────────────────────────────────────
export async function requestNotificationPermissions(): Promise<boolean> {
  // Device check skipped - assuming device environment

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return false;

  // Crear canal de Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('vyra-default', {
      name:       'Vyra',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7C3AED',
      sound:      'default',
    });

    await Notifications.setNotificationChannelAsync('vyra-fasting', {
      name:       'Vyra — Ayuno',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500],
      lightColor: '#F59E0B',
      sound:      'default',
    });

    await Notifications.setNotificationChannelAsync('vyra-reminders', {
      name:       'Vyra — Recordatorios',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound:      'default',
    });
  }

  return true;
}

// ── Registrar token de push (para notifs remotas desde backend) ────────────
export async function registerPushToken(userId: string): Promise<void> {
  try {
    // Assuming device - Device module not available
    // const isDevice = true;
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
    });
    if (!token || !userId) return;

    // Guardar en profiles para que el backend pueda enviar notifs remotas
    await supabase
      .from('profiles')
      .update({ push_token: token })
      .eq('id', userId);
  } catch (err) {
    captureError(err instanceof Error ? err : new Error(String(err)), { action: 'registerPushToken' });
  }
}

// ── Programar notificación local ───────────────────────────────────────────
export async function scheduleNotif(notif: ScheduledNotif): Promise<string | null> {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      identifier: notif.id,
      content: {
        title:    notif.title,
        body:     notif.body,
        data:     notif.data ?? {},
        sound:    'default',
        categoryIdentifier: notif.type,
      },
      trigger: notif.trigger,
    });
    return id;
  } catch (err) {
    captureError(err instanceof Error ? err : new Error(String(err)), { action: `scheduleNotif.${notif.type}` });
    return null;
  }
}

// ── Cancelar notificación por ID ───────────────────────────────────────────
export async function cancelNotif(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {}
}

// ── Cancelar todas las notificaciones de un tipo ──────────────────────────
export async function cancelNotifsByType(type: NotifType): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const toCancel = scheduled.filter((n) => n.identifier.startsWith(type));
    await Promise.all(toCancel.map((n) => cancelNotif(n.identifier)));
  } catch {}
}

// ── Cancelar TODAS las notificaciones ─────────────────────────────────────
export async function cancelAllNotifs(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ─── NOTIFICACIONES PREDEFINIDAS ─────────────────────────────────────────

// Recordatorios de agua — hora:minuto diario
export async function scheduleWaterReminders(times: { hour: number; minute: number }[]): Promise<void> {
  await cancelNotifsByType('water_reminder');
  for (const [i, time] of times.entries()) {
    await scheduleNotif({
      id:    `water_reminder_${i}`,
      type:  'water_reminder',
      title: '💧 ¡Hora de hidratarte!',
      body:  'No te olvides de tomar agua. Tu cuerpo te lo agradece.',
      trigger: {
        type:    'daily',
        hour:    time.hour,
        minute:  time.minute,
        repeats: true,
      } as any,
    });
  }
}

// Recordatorio de sueño — hora de acostarse
export async function scheduleSleepReminder(bedHour: number, bedMinute: number): Promise<void> {
  await cancelNotifsByType('sleep_bedtime');
  // Avisar 30 minutos antes
  let warnMinute = bedMinute - 30;
  let warnHour   = bedHour;
  if (warnMinute < 0) { warnMinute += 60; warnHour--; }
  if (warnHour   < 0) warnHour = 23;

  await scheduleNotif({
    id:    'sleep_bedtime_warn',
    type:  'sleep_bedtime',
    title: '😴 Preparate para dormir',
    body:  `Quedan 30 minutos para tu hora de sueño. Empezá a relajarte.`,
    trigger: {
      type:    'daily',
      hour:    warnHour,
      minute:  warnMinute,
      repeats: true,
    } as any,
  });
}

// Recordatorio de check-in mental — mañana
export async function scheduleMentalCheckinReminder(hour = 8, minute = 30): Promise<void> {
  await cancelNotifsByType('mental_checkin');
  await scheduleNotif({
    id:    'mental_checkin_morning',
    type:  'mental_checkin',
    title: '🧠 ¿Cómo arrancás el día?',
    body:  'Hacé tu check-in mental de hoy en Vyra. Son 2 minutos.',
    trigger: {
      type:    'daily',
      hour,
      minute,
      repeats: true,
    } as any,
  });
}

// Resumen diario — tarde/noche
export async function scheduleDailySummaryReminder(hour = 21, minute = 0): Promise<void> {
  await cancelNotifsByType('daily_summary');
  await scheduleNotif({
    id:    'daily_summary_evening',
    type:  'daily_summary',
    title: '📊 Resumen del día',
    body:  '¡Mirá cómo cerraste el día! Tu readiness score y lo que lograste.',
    trigger: {
      type:    'daily',
      hour,
      minute,
      repeats: true,
    } as any,
  });
}

// Racha en peligro — solo si el usuario no hizo ningún log hoy a las 20hs
export async function scheduleStreakAtRisk(): Promise<void> {
  await cancelNotifsByType('streak_at_risk');
  await scheduleNotif({
    id:    'streak_at_risk_20h',
    type:  'streak_at_risk',
    title: '🔥 ¡Tu racha está en peligro!',
    body:  'Todavía no registraste nada hoy. Hacé 1 log para salvar la racha.',
    trigger: {
      type:    'daily',
      hour:    20,
      minute:  0,
      repeats: true,
    } as any,
    data: { action: 'open_quick_log' },
  });
}

// Notificación de fase de ayuno (disparada desde useFasting)
export async function scheduleFastingPhaseNotif(
  phaseName: string,
  triggerDate: Date,
): Promise<void> {
  await scheduleNotif({
    id:    `fasting_phase_${triggerDate.getTime()}`,
    type:  'fasting_phase',
    title: `⏳ Fase: ${phaseName}`,
    body:  `Acabás de entrar a la fase ${phaseName}. ¡Seguí así!`,
    trigger: { date: triggerDate } as any,
  });
}

// Ayuno completado
export async function scheduleFastingCompleteNotif(triggerDate: Date): Promise<void> {
  await scheduleNotif({
    id:    `fasting_complete_${triggerDate.getTime()}`,
    type:  'fasting_complete',
    title: '🎉 ¡Ayuno completado!',
    body:  '¡Terminaste tu ayuno! Registrá cómo te sentís en la app.',
    trigger: { date: triggerDate } as any,
  });
}

// Recordatorio de suplemento (disparado desde useSupplements)
export async function scheduleSupplementReminder(
  supplementName: string,
  hour: number,
  minute: number,
): Promise<void> {
  await scheduleNotif({
    id:    `supplement_reminder_${supplementName.replace(/\s/g, '_')}_${hour}_${minute}`,
    type:  'supplement_reminder',
    title: `💊 Recordatorio: ${supplementName}`,
    body:  `Es tu hora de tomar ${supplementName}. ¡No te lo saltes!`,
    trigger: {
      type:    'daily',
      hour,
      minute,
      repeats: true,
    } as any,
  });
}

// ── Listener de respuesta a notificaciones ────────────────────────────────
export function setupNotificationResponseListener(
  handler: (notification: Notifications.Notification) => void,
): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    handler(response.notification);
  });
  return () => sub.remove();
}