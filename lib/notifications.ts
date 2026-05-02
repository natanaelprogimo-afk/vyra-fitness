import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
// import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  buildProfileContextUpdate,
  getProfileContextMemory,
  PROFILE_CONTEXT_MEMORY_SELECT,
} from '@/lib/profile-context';
import { supabase } from '@/lib/supabase';
import { captureError } from '@/lib/sentry';
import { asRecord, getAuthHeaders, requestJson } from '@/services/backend/client';

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
  | 'context_proactive'
  | 'supplement_reminder'
  | 'workout_reminder';

const NOTIF_TYPE_SET = new Set<NotifType>([
  'water_reminder',
  'fasting_phase',
  'fasting_complete',
  'step_milestone',
  'sleep_bedtime',
  'mental_checkin',
  'daily_summary',
  'streak_at_risk',
  'context_proactive',
  'supplement_reminder',
  'workout_reminder',
]);

function isNotifType(value: string): value is NotifType {
  return NOTIF_TYPE_SET.has(value as NotifType);
}

export interface ScheduledNotif {
  id:        string;
  type:      NotifType;
  title:     string;
  body:      string;
  trigger:   Notifications.NotificationTriggerInput;
  data?:     Record<string, unknown>;
}

const NOTIF_ENGAGEMENT_KEY = '@vyra_notif_engagement_v1';
type EngagementKind = 'scheduled' | 'opened' | 'actioned';
type HourBucket = Record<string, { scheduled: number; opened: number; actioned: number }>;
type NotifEngagementStore = Partial<Record<NotifType, HourBucket>>;
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';
const IOS_NOTIFICATION_SOUND = Platform.OS === 'ios' ? 'default' : undefined;
type TriggerShape = Partial<{ type: string; hour: number; date: string | number | Date }>;
type NotificationHoursResponse = { hours?: unknown[] };
type NotificationCountResponse = { scheduled?: unknown };

export type PushTokenDiagnostic = {
  permissionStatus: string;
  granted: boolean;
  projectId: string | null;
  token: string | null;
  error: string | null;
};

export const NOTIFICATION_ACTIONS = {
  openQuickLog: 'open_quick_log',
  quickLogWater: 'quick_log_water',
  openWorkout: 'open_workout',
  markWorkoutDone: 'mark_workout_done',
} as const;

function getCurrentUtcOffsetMinutes(): number {
  return -new Date().getTimezoneOffset();
}

function resolveExpoProjectId(): string | null {
  const envProjectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim();
  if (envProjectId) return envProjectId;

  const easConfigProjectId = Constants.easConfig?.projectId;
  if (typeof easConfigProjectId === 'string' && easConfigProjectId.trim().length > 0) {
    return easConfigProjectId.trim();
  }

  const extra = Constants.expoConfig?.extra as
    | { eas?: { projectId?: string | null } | null }
    | undefined;
  const extraProjectId = extra?.eas?.projectId;
  return typeof extraProjectId === 'string' && extraProjectId.trim().length > 0
    ? extraProjectId.trim()
    : null;
}

export async function getExpoPushTokenDiagnostic(): Promise<PushTokenDiagnostic> {
  const permissions = await Notifications.getPermissionsAsync().catch((e) => {
    console.debug?.('[notifications] getPermissionsAsync failed', e);
    return null;
  });
  const permissionStatus = permissions?.status ?? 'unknown';
  const granted = permissions?.granted === true || permissionStatus === 'granted';
  const projectId = resolveExpoProjectId();

  if (!projectId) {
    return {
      permissionStatus,
      granted,
      projectId: null,
      token: null,
      error: 'Missing Expo projectId for push token registration.',
    };
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    return {
      permissionStatus,
      granted,
      projectId,
      token: typeof token === 'string' && token.trim().length > 0 ? token : null,
      error: token ? null : 'Expo did not return a push token.',
    };
  } catch (error) {
    return {
      permissionStatus,
      granted,
      projectId,
      token: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function resolveAndroidChannelId(type: NotifType): string {
  if (type === 'fasting_phase' || type === 'fasting_complete') return 'vyra-fasting';
  if (type === 'context_proactive') return 'vyra-context';
  if (type === 'streak_at_risk') return 'vyra-important';
  return 'vyra-reminders';
}

function buildNotificationActions(type: NotifType): Notifications.NotificationAction[] {
  if (type === 'water_reminder' || type === 'streak_at_risk' || type === 'context_proactive') {
    return [
      {
        identifier: NOTIFICATION_ACTIONS.quickLogWater,
        buttonTitle: 'Registrar 250ml',
      },
      {
        identifier: NOTIFICATION_ACTIONS.openQuickLog,
        buttonTitle: 'Ver opciones',
      },
    ];
  }

  if (type === 'workout_reminder') {
    return [
      {
        identifier: NOTIFICATION_ACTIONS.openWorkout,
        buttonTitle: 'Abrir rutina',
      },
      {
        identifier: NOTIFICATION_ACTIONS.markWorkoutDone,
        buttonTitle: 'Marcar rutina',
      },
    ];
  }

  return [];
}

function sanitizeNotificationData(
  data?: Record<string, unknown>,
): Record<string, string | number | boolean | null> | undefined {
  if (!data) return undefined;

  const sanitized: Record<string, string | number | boolean | null> = {};

  for (const [key, value] of Object.entries(data)) {
    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      sanitized[key] = value;
      continue;
    }

    if (value instanceof Date) {
      sanitized[key] = value.toISOString();
      continue;
    }

    try {
      sanitized[key] = JSON.stringify(value);
    } catch {
      sanitized[key] = String(value);
    }
  }

  return sanitized;
}

function normalizeTriggerInput(
  trigger: Notifications.NotificationTriggerInput,
  channelId?: string,
): Notifications.NotificationTriggerInput {
  const androidChannel = Platform.OS === 'android' ? channelId : undefined;

  const buildDateTrigger = (value: unknown): Notifications.NotificationTriggerInput => {
    const parsed = value instanceof Date ? value : new Date(value as string | number);
    if (Number.isNaN(parsed.getTime())) return trigger;
    return {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: parsed,
      ...(androidChannel ? { channelId: androidChannel } : {}),
    } as Notifications.NotificationTriggerInput;
  };

  if (trigger instanceof Date || typeof trigger === 'number') {
    return buildDateTrigger(trigger);
  }

  if (!trigger || typeof trigger !== 'object') return trigger;

  if ('date' in trigger && !('type' in trigger)) {
    return buildDateTrigger((trigger as { date: unknown }).date);
  }

  if ('type' in trigger && androidChannel && !('channelId' in trigger)) {
    return {
      ...(trigger as Record<string, unknown>),
      channelId: androidChannel,
    } as Notifications.NotificationTriggerInput;
  }

  return trigger;
}

function extractTriggerHour(trigger: Notifications.NotificationTriggerInput): number | null {
  if (trigger instanceof Date) {
    return Number.isNaN(trigger.getTime()) ? null : trigger.getHours();
  }
  if (!trigger || typeof trigger !== 'object') return null;
  const triggerShape = trigger as TriggerShape;
  if (triggerShape.type === 'daily') {
    const hour = Number(triggerShape.hour);
    if (Number.isFinite(hour)) return Math.max(0, Math.min(23, hour));
  }
  if ('date' in trigger && triggerShape.date !== undefined) {
    const rawDate = triggerShape.date;
    const date = rawDate instanceof Date ? rawDate : new Date(rawDate);
    if (!Number.isNaN(date.getTime())) return date.getHours();
  }
  return null;
}

async function readEngagementStore(): Promise<NotifEngagementStore> {
  try {
    const raw = await AsyncStorage.getItem(NOTIF_ENGAGEMENT_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object'
      ?  (parsed as NotifEngagementStore)
      : {};
  } catch {
    return {};
  }
}

async function writeEngagementStore(store: NotifEngagementStore): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIF_ENGAGEMENT_KEY, JSON.stringify(store));
  } catch {
    return;
  }
}

async function getAuthToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

async function sendEngagementToBackend(input: {
  type: NotifType;
  kind: EngagementKind;
  hour: number;
  notificationId?: string;
  actionId?: string;
  source?: string;
}): Promise<void> {
  try {
    if (!BACKEND_URL) return;
    const token = await getAuthToken();
    if (!token) return;

    await fetch(`${BACKEND_URL}/api/notifications/engagement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: input.type,
        kind: input.kind,
        hour: input.hour,
        notificationId: input.notificationId ?? '',
        actionId: input.actionId ?? '',
        source: input.source ?? 'app',
      }),
    });
  } catch {
    return;
  }
}

async function recordEngagement(
  type: NotifType,
  kind: EngagementKind,
  hour: number,
  meta?: { notificationId?: string; actionId?: string; source?: string },
): Promise<void> {
  try {
    const store = await readEngagementStore();
    const byType = store[type] ?? {};
    const key = String(hour);
    const prev = byType[key] ?? { scheduled: 0, opened: 0, actioned: 0 };

    byType[key] = {
      scheduled: kind === 'scheduled' ? prev.scheduled + 1 : prev.scheduled,
      opened: kind === 'opened' ? prev.opened + 1 : prev.opened,
      actioned: kind === 'actioned' ? prev.actioned + 1 : prev.actioned,
    };

    store[type] = byType;
    await writeEngagementStore(store);
    await sendEngagementToBackend({
      type,
      kind,
      hour,
      notificationId: meta?.notificationId,
      actionId: meta?.actionId,
      source: meta?.source,
    });
  } catch {
    return;
  }
}

export async function getLowEngagementHours(
  type: NotifType,
  minScheduled = 4,
  minOpenRate = 0.2,
): Promise<number[]> {
  const store = await readEngagementStore();
  const buckets = store[type] ?? {};
  const hours: number[] = [];

  for (const [hourStr, values] of Object.entries(buckets)) {
    const hour = Number(hourStr);
    if (!Number.isFinite(hour)) continue;
    const scheduled = Number(values?.scheduled ?? 0);
    const opened = Number(values?.opened ?? 0);
    const openRate = scheduled > 0 ? opened / scheduled : 0;
    if (scheduled >= minScheduled && openRate < minOpenRate) {
      hours.push(hour);
    }
  }

  return hours;
}

export async function getLowEngagementHoursFromBackend(
  type: NotifType,
  minScheduled = 4,
  minOpenRate = 0.2,
): Promise<number[]> {
  try {
    if (!BACKEND_URL) return [];
    const token = await getAuthToken();
    if (!token) return [];

    const params = new URLSearchParams({
      type,
      minScheduled: String(minScheduled),
      minOpenRate: String(minOpenRate),
    });

    const res = await fetch(`${BACKEND_URL}/api/notifications/engagement/low-hours?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return [];
    const payload = (await res.json().catch((e) => {
      console.debug?.('[notifications] low-engagement response.json failed', e);
      return {};
    })) as NotificationHoursResponse;
    const parsedHours: number[] = [];
    if (Array.isArray(payload?.hours)) {
      for (const raw of payload.hours as unknown[]) {
        const hour = Number(raw);
        if (Number.isFinite(hour)) {
          parsedHours.push(Math.max(0, Math.min(23, Math.floor(hour))));
        }
      }
    }
    return [...new Set<number>(parsedHours)].sort((a, b) => a - b);
  } catch {
    return [];
  }
}

export async function getCombinedLowEngagementHours(
  type: NotifType,
  minScheduled = 4,
  minOpenRate = 0.2,
): Promise<number[]> {
  const [local, remote] = await Promise.all([
    getLowEngagementHours(type, minScheduled, minOpenRate),
    getLowEngagementHoursFromBackend(type, minScheduled, minOpenRate),
  ]);
  return [...new Set([...local, ...remote])].sort((a, b) => a - b);
}

export async function getBackendTodayScheduledCount(): Promise<number> {
  try {
    if (!BACKEND_URL) return 0;
    const token = await getAuthToken();
    if (!token) return 0;

    const res = await fetch(`${BACKEND_URL}/api/notifications/engagement/today-count`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return 0;
    const payload = (await res.json().catch((e) => {
      console.debug?.('[notifications] today-count response.json failed', e);
      return {};
    })) as NotificationCountResponse;
    const scheduled = Number(payload?.scheduled ?? 0);
    return Number.isFinite(scheduled) ? Math.max(0, Math.floor(scheduled)) : 0;
  } catch {
    return 0;
  }
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
    });

    await Notifications.setNotificationChannelAsync('vyra-fasting', {
      name:       'Vyra — Ayuno',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 500],
      lightColor: '#F59E0B',
    });

    await Notifications.setNotificationChannelAsync('vyra-reminders', {
      name:       'Vyra - Recordatorios',
      importance: Notifications.AndroidImportance.DEFAULT,
    });

    await Notifications.setNotificationChannelAsync('vyra-important', {
      name:       'Vyra - Alertas importantes',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 300, 200, 300],
      bypassDnd:  false,
    });

    await Notifications.setNotificationChannelAsync('vyra-context', {
      name:       'Vyra - Contexto',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 180, 120, 180],
    });
  }

  await registerNotificationCategories();

  return true;
}

export async function registerNotificationCategories(): Promise<void> {
  const categoryTypes: NotifType[] = [
    'water_reminder',
    'streak_at_risk',
    'context_proactive',
    'workout_reminder',
  ];

  await Promise.all(
    categoryTypes.map(async (type) => {
      const actions = buildNotificationActions(type);
      if (!actions.length) return;
      try {
        await Notifications.setNotificationCategoryAsync(type, actions);
      } catch {
        return;
      }
    }),
  );
}

export async function getNotificationPermissionsGranted(): Promise<boolean> {
  try {
    const permissions = await Notifications.getPermissionsAsync();
    return permissions.granted === true || permissions.status === 'granted';
  } catch {
    return false;
  }
}

// ── Registrar token de push (para notifs remotas desde backend) ────────────
export async function registerPushToken(userId: string): Promise<void> {
  try {
    const projectId = resolveExpoProjectId();
    if (!projectId) {
      throw new Error('Missing Expo projectId for push token registration.');
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    if (!token || !userId) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select(PROFILE_CONTEXT_MEMORY_SELECT)
      .eq('id', userId)
      .single();

    const coachMemory = getProfileContextMemory(profile);
    const notificationUtcOffsetMinutes = getCurrentUtcOffsetMinutes();

    const headers = await getAuthHeaders();
    const response = await requestJson('/api/notifications/push-token', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        token,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
        notificationUtcOffsetMinutes,
      }),
    });

    if (!response.ok) {
      const payload = asRecord(response.data);
      const errorMessage =
        typeof payload?.error === 'string'
          ? payload.error
          : `Push token registration failed with status ${response.status}.`;
      throw new Error(errorMessage);
    }

    // Mirror the token locally so the current session sees the same state immediately.
    await supabase
      .from('profiles')
      .update({
        ...buildProfileContextUpdate({
          memory: {
            ...coachMemory,
            push_token: token,
            notification_utc_offset_minutes: notificationUtcOffsetMinutes,
          },
        }),
      })
      .eq('id', userId);
  } catch (err) {
    captureError(err instanceof Error ? err : new Error(String(err)), { action: 'registerPushToken' });
    throw err instanceof Error ? err : new Error(String(err));
  }
}

// ── Programar notificación local ───────────────────────────────────────────
export async function scheduleNotif(notif: ScheduledNotif): Promise<string | null> {
  try {
    const androidChannelId = resolveAndroidChannelId(notif.type);
    const safeData = sanitizeNotificationData(notif.data);
    const normalizedTrigger = normalizeTriggerInput(notif.trigger, androidChannelId);
    const localData =
      Platform.OS === 'android'
        ? undefined
        : { type: notif.type, ...(safeData ?? {}) };
    const id = await Notifications.scheduleNotificationAsync({
      identifier: notif.id,
      content: {
        title:    notif.title,
        body:     notif.body,
        data:     localData,
        ...(IOS_NOTIFICATION_SOUND ? { sound: IOS_NOTIFICATION_SOUND } : {}),
        categoryIdentifier: notif.type,
        channelId: androidChannelId,
      } as Notifications.NotificationRequestInput['content'],
      trigger: normalizedTrigger,
    });

    const triggerHour = extractTriggerHour(normalizedTrigger);
    if (triggerHour !== null) {
      await recordEngagement(notif.type, 'scheduled', triggerHour, {
        notificationId: id,
        source: 'schedule_local',
      });
    }

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
  } catch {
    return;
  }
}

// ── Cancelar todas las notificaciones de un tipo ──────────────────────────
export async function cancelNotifsByType(type: NotifType): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const toCancel = scheduled.filter((n) => n.identifier.startsWith(type));
    await Promise.all(toCancel.map((n) => cancelNotif(n.identifier)));
  } catch {
    return;
  }
}

// ── Cancelar TODAS las notificaciones ─────────────────────────────────────
export async function cancelAllNotifs(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ─── NOTIFICACIONES PREDEFINIDAS ─────────────────────────────────────────

// Recordatorios de agua — hora:minuto diario
export async function scheduleWaterReminders(
  times: { hour: number; minute: number }[],
  copy?: { title?: string; body?: string },
): Promise<void> {
  await cancelNotifsByType('water_reminder');
  for (const [i, time] of times.entries()) {
    await scheduleNotif({
      id:    `water_reminder_${i}`,
      type:  'water_reminder',
      title: copy?.title ?? '💧 ¡Hora de hidratarte!',
      body:  copy?.body ?? 'No te olvides de tomar agua. Tu cuerpo te lo agradece.',
      trigger: {
        type:    'daily',
        hour:    time.hour,
        minute:  time.minute,
        repeats: true,
      } as Notifications.NotificationTriggerInput,
      data: {
        action: NOTIFICATION_ACTIONS.openQuickLog,
        quickActionAmountMl: 250,
        source: 'water_reminder',
      },
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
    } as Notifications.NotificationTriggerInput,
  });
}

// Recordatorio de check-in mental — mañana
export async function scheduleMentalCheckinReminder(hour = 8, minute = 30): Promise<void> {
  await cancelNotifsByType('mental_checkin');
  await scheduleNotif({
    id:    'mental_checkin_morning',
    type:  'mental_checkin',
    title: '🧠 ¿Cómo arrancás el día??',
    body:  'Hacé tu check-in mental de hoy en Vyra. Son 2 minutos.',
    trigger: {
      type:    'daily',
      hour,
      minute,
      repeats: true,
    } as Notifications.NotificationTriggerInput,
  });
}

// Resumen diario — tarde/noche
export async function scheduleDailySummaryReminder(hour = 21, minute = 0): Promise<void> {
  await cancelNotifsByType('daily_summary');
  await scheduleNotif({
    id:    'daily_summary_evening',
    type:  'daily_summary',
    title: '📊 Resumen del día',
    body:  '¡Mirá cómo cerraste el día! Tu estado del día y lo que lograste.',
    trigger: {
      type:    'daily',
      hour,
      minute,
      repeats: true,
    } as Notifications.NotificationTriggerInput,
  });
}

export async function scheduleWorkoutReminder(
  copy?: { title?: string; body?: string; hour?: number; minute?: number },
): Promise<void> {
  await cancelNotifsByType('workout_reminder');
  await scheduleNotif({
    id: 'workout_reminder_daily',
    type: 'workout_reminder',
    title: copy?.title ?? 'Tu rutina de hoy está lista',
    body: copy?.body ?? 'Abre tu bloque de hoy o marcalo rápido desde la notificacion.',
    trigger: {
      type: 'daily',
      hour: copy?.hour ?? 18,
      minute: copy?.minute ?? 30,
      repeats: true,
    } as Notifications.NotificationTriggerInput,
    data: {
      action: NOTIFICATION_ACTIONS.openWorkout,
      source: 'workout_reminder',
    },
  });
}

// Racha en peligro — solo si el usuario no hizo ningún log hoy a las 20hs
export async function scheduleStreakAtRisk(
  copy?: { title?: string; body?: string; hour?: number; minute?: number },
): Promise<void> {
  await cancelNotifsByType('streak_at_risk');
  await scheduleNotif({
    id:    'streak_at_risk_20h',
    type:  'streak_at_risk',
    title: copy?.title ?? '🔥 ¡Tu racha está en peligro!',
    body:  copy?.body ?? 'Todavía no registraste nada hoy. Hacé 1 log para salvar la racha.',
    trigger: {
      type:    'daily',
      hour:    copy?.hour ?? 20,
      minute:  copy?.minute ?? 0,
      repeats: true,
    } as Notifications.NotificationTriggerInput,
    data: {
      action: NOTIFICATION_ACTIONS.openQuickLog,
      quickActionAmountMl: 250,
      source: 'streak_at_risk',
    },
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
    trigger: { date: triggerDate } as Notifications.NotificationTriggerInput,
  });
}

// Ayuno completado
export async function scheduleFastingCompleteNotif(triggerDate: Date): Promise<void> {
  await scheduleNotif({
    id:    `fasting_complete_${triggerDate.getTime()}`,
    type:  'fasting_complete',
    title: '🎉 ¡Ayuno completado!',
    body:  '¡Terminaste tu ayuno! Registrá cómo te sentís en la app.',
    trigger: { date: triggerDate } as Notifications.NotificationTriggerInput,
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
    } as Notifications.NotificationTriggerInput,
  });
}

export async function scheduleOnboardingWelcomeReminder(triggerDate: Date, displayName?: string): Promise<void> {
  await cancelNotif('onboarding_welcome_24h');
  if (triggerDate.getTime() <= Date.now()) return;

  const safeName = displayName && displayName.trim().length > 0 ? displayName.trim() : 'Tu racha';
  await scheduleNotif({
    id: 'onboarding_welcome_24h',
    type: 'context_proactive',
    title: 'Tu racha empieza hoy',
    body: `${safeName}, un log de agua de 10 segundos alcanza para arrancar fuerte.`,
    trigger: { date: triggerDate } as Notifications.NotificationTriggerInput,
    data: {
      action: NOTIFICATION_ACTIONS.openQuickLog,
      quickActionAmountMl: 250,
      source: 'onboarding_welcome_24h',
    },
  });
}

// ── Listener de respuesta a notificaciones ────────────────────────────────
export function setupNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void,
): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const notification = response.notification;
    const maybeType =
      notification.request.content.categoryIdentifier ||
      (typeof notification.request.content.data?.type === 'string'
        ?  String(notification.request.content.data.type)
        : '');
    if (typeof maybeType === 'string' && isNotifType(maybeType)) {
      const actionIdentifier = response.actionIdentifier;
      const kind: EngagementKind =
        actionIdentifier && actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER
          ?  'actioned'
          : 'opened';
      void recordEngagement(maybeType, kind, new Date().getHours(), {
        notificationId: notification.request.identifier,
        actionId: actionIdentifier,
        source: 'response_listener',
      });
    }
    handler(response);
  });
  return () => sub.remove();
}

