import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { supabase } from '@/lib/supabase';
import {
  requestNotificationPermissions,
  registerPushToken,
  scheduleWaterReminders,
  scheduleSleepReminder,
  scheduleMentalCheckinReminder,
  scheduleDailySummaryReminder,
  scheduleStreakAtRisk,
  scheduleOnboardingWelcomeReminder,
  cancelAllNotifs,
  cancelNotifsByType,
  scheduleNotif,
  getCombinedLowEngagementHours,
  getBackendTodayScheduledCount,
  type NotifType,
} from '@/lib/notifications';
import { captureError } from '@/lib/sentry';

export interface NotifPreferences {
  water: boolean;
  sleep: boolean;
  mental: boolean;
  dailySummary: boolean;
  streakAtRisk: boolean;
  supplements: boolean;
  workout: boolean;
}

const GLOBAL_MAX_NOTIFS_PER_DAY = 3;
const QUIET_HOUR_START = 22;
const QUIET_HOUR_END = 7;
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';
const DEFAULT_PREFS: NotifPreferences = {
  water: true,
  sleep: true,
  mental: true,
  dailySummary: true,
  streakAtRisk: true,
  supplements: true,
  workout: false,
};

function parseIsoDay(value: string): string {
  return value.split('T')[0] ?? value;
}

function toHour(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.min(23, Math.floor(parsed)));
}

function toMinute(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.min(59, Math.floor(parsed)));
}

function toMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function isWithinSleepWindow(minutes: number, sleepStart: number, wake: number): boolean {
  if (sleepStart === wake) return false;
  if (sleepStart < wake) {
    return minutes >= sleepStart && minutes <= wake;
  }
  return minutes >= sleepStart || minutes <= wake;
}

function isWithinGlobalQuietHours(minutes: number): boolean {
  const start = QUIET_HOUR_START * 60;
  const end = QUIET_HOUR_END * 60;
  return isWithinSleepWindow(minutes, start, end);
}

function clampHour(hour: number, fallback = 11): number {
  if (!Number.isFinite(hour)) return fallback;
  return Math.max(8, Math.min(21, Math.round(hour)));
}

function pickFirstAllowedHour(candidates: number[], blocked: Set<number>, fallback: number): number {
  for (const candidate of candidates) {
    if (!blocked.has(candidate)) return candidate;
  }
  return fallback;
}

function formatLiters(ml: number): string {
  return (ml / 1000).toFixed(1);
}

type ProfileLike = { coach_memory_json?: unknown } | null | undefined;

function getProfileMemory(profile: ProfileLike): Record<string, unknown> {
  if (profile?.coach_memory_json && typeof profile.coach_memory_json === 'object') {
    return profile.coach_memory_json as Record<string, unknown>;
  }
  return {};
}

function parseStoredPrefs(profile: ProfileLike): NotifPreferences {
  const memory = getProfileMemory(profile);
  const raw =
    memory.notification_prefs && typeof memory.notification_prefs === 'object'
      ? (memory.notification_prefs as Record<string, unknown>)
      : {};

  return {
    water: raw.water !== undefined ? Boolean(raw.water) : DEFAULT_PREFS.water,
    sleep: raw.sleep !== undefined ? Boolean(raw.sleep) : DEFAULT_PREFS.sleep,
    mental: raw.mental !== undefined ? Boolean(raw.mental) : DEFAULT_PREFS.mental,
    dailySummary: raw.dailySummary !== undefined ? Boolean(raw.dailySummary) : DEFAULT_PREFS.dailySummary,
    streakAtRisk: raw.streakAtRisk !== undefined ? Boolean(raw.streakAtRisk) : DEFAULT_PREFS.streakAtRisk,
    supplements: raw.supplements !== undefined ? Boolean(raw.supplements) : DEFAULT_PREFS.supplements,
    workout: raw.workout !== undefined ? Boolean(raw.workout) : DEFAULT_PREFS.workout,
  };
}

export function useNotifications() {
  const pathname = usePathname();
  const { profile, updateProfile } = useAuthStore();
  const settings = useSettingsStore();

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prefsReady, setPrefsReady] = useState(false);
  const [smartNotifsSentToday, setSmartNotifsSentToday] = useState(0);
  const [smartNotifsDate, setSmartNotifsDate] = useState(parseIsoDay(new Date().toISOString()));
  const [prefs, setPrefs] = useState<NotifPreferences>(parseStoredPrefs(profile));
  const [deliveryMode, setDeliveryMode] = useState<'local' | 'remote'>('local');

  const isWorkoutActive =
    pathname.includes('/modules/workout/session') ||
    pathname.includes('/modules/workout/active');
  const isFastingActive = pathname.includes('/modules/fasting');
  const isMentalCheckin = pathname.includes('/modules/mental');

  const requestPermissions = useCallback(async () => {
    const granted = await requestNotificationPermissions();
    setPermissionGranted(granted);
    return granted;
  }, []);

  const fetchServerAdaptivePlan = useCallback(async (): Promise<{
    water?: { hour?: number; minute?: number };
    sleep?: { hour?: number; minute?: number };
    mental?: { hour?: number; minute?: number };
    summary?: { hour?: number; minute?: number };
    streak?: { hour?: number; minute?: number };
    deliveryMode?: 'local' | 'remote';
    remoteReady?: boolean;
    timezoneOffsetMinutes?: number | null;
    copy?: {
      waterTitle?: string;
      waterBody?: string;
      streakTitle?: string;
      streakBody?: string;
    };
  } | null> => {
    try {
      if (!profile?.id || !BACKEND_URL) return null;
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return null;

      const res = await fetch(`${BACKEND_URL}/api/notifications/adaptive-plan`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return null;
      const payload = await res.json().catch(() => null);
      return payload && typeof payload === 'object' ? payload : null;
    } catch {
      return null;
    }
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.id) return;
    void requestPermissions();
  }, [profile?.id, requestPermissions]);

  useEffect(() => {
    if (profile?.id && permissionGranted) {
      void registerPushToken(profile.id);
    }
  }, [profile?.id, permissionGranted]);

  useEffect(() => {
    const memory = getProfileMemory(profile);
    if (typeof memory.notification_enabled === 'boolean') {
      settings.setNotificationsEnabled(memory.notification_enabled);
    }
    setPrefs(parseStoredPrefs(profile));
    setPrefsReady(true);
  }, [profile?.coach_memory_json, profile?.id, settings.setNotificationsEnabled]);

  const getPreferredWaterReminderHour = useCallback(async (): Promise<number> => {
    if (!profile?.id) return 11;

    const memory = getProfileMemory(profile);
    const ignoredByType =
      memory.notification_ignored_hours && typeof memory.notification_ignored_hours === 'object'
        ? (memory.notification_ignored_hours as Record<string, unknown>)
        : {};
    const ignoredFromProfile = Array.isArray(ignoredByType.water)
      ? (ignoredByType.water as unknown[])
          .map((item) => Number(item))
          .filter((value) => Number.isFinite(value))
      : [];
    const lowEngagementHours = await getCombinedLowEngagementHours('water_reminder');
    const blockedHours = new Set<number>([...ignoredFromProfile, ...lowEngagementHours]);

    const from = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('water_logs')
      .select('logged_at')
      .eq('user_id', profile.id)
      .gte('logged_at', from)
      .order('logged_at', { ascending: false })
      .limit(120);

    if (error || !data?.length) return 11;

    const histogram = new Map<number, number>();
    for (const row of data) {
      const hour = new Date(row.logged_at).getHours();
      if (hour < 8 || hour > 21) continue;
      if (blockedHours.has(hour)) continue;
      histogram.set(hour, (histogram.get(hour) ?? 0) + 1);
    }

    if (!histogram.size) {
      const safeFallback = [10, 11, 12, 15, 17].find((hour) => !blockedHours.has(hour));
      return safeFallback ?? 11;
    }
    const [bestHour] = [...histogram.entries()].sort((a, b) => b[1] - a[1])[0]!;
    return clampHour(bestHour);
  }, [profile]);

  const getReminderCopy = useCallback(async () => {
    const displayName = profile?.name?.trim() || 'Tu racha';
    const waterGoal = profile?.water_goal_ml ?? 2200;

    if (!profile?.id) {
      return {
        waterTitle: '💧 Hora de hidratarte',
        waterBody: `${displayName}, hoy todavía podés acercarte a tu meta.`,
        streakTitle: '🔥 Tu racha está en peligro',
        streakBody: `${displayName}, hacé 1 log rápido hoy y la mantenés viva.`,
      };
    }

    const today = parseIsoDay(new Date().toISOString());
    const start = `${today}T00:00:00.000Z`;

    const [waterRes, logsRes] = await Promise.all([
      supabase
        .from('water_logs')
        .select('hydration_equivalent_ml, logged_at')
        .eq('user_id', profile.id)
        .gte('logged_at', start)
        .order('logged_at', { ascending: false })
        .limit(50),
      Promise.all([
        supabase.from('water_logs').select('id', { count: 'exact', head: true }).eq('user_id', profile.id).gte('logged_at', start),
        supabase.from('step_logs').select('id', { count: 'exact', head: true }).eq('user_id', profile.id).eq('logged_date', today),
        supabase.from('meals').select('id', { count: 'exact', head: true }).eq('user_id', profile.id).gte('logged_at', start),
        supabase.from('sleep_logs').select('id', { count: 'exact', head: true }).eq('user_id', profile.id).gte('end_time', start),
        supabase.from('mental_checkins').select('id', { count: 'exact', head: true }).eq('user_id', profile.id).eq('check_date', today),
      ]),
    ]);

    const waterRows = waterRes.data ?? [];
    const totalMl = waterRows.reduce((sum, row) => sum + (row.hydration_equivalent_ml ?? 0), 0);
    const lastWaterAt = waterRows[0]?.logged_at ? new Date(waterRows[0].logged_at) : null;
    const hoursSinceWater = lastWaterAt
      ? Math.max(1, Math.round((Date.now() - lastWaterAt.getTime()) / (1000 * 60 * 60)))
      : null;

    const logsToday = logsRes.reduce((sum, result) => sum + (result.count ?? 0), 0);
    const hasNoLogsToday = logsToday === 0;

    const waterBody = hoursSinceWater
      ? `${displayName}, llevás ${hoursSinceWater}h desde tu último registro y hoy vas ${formatLiters(totalMl)}L/${formatLiters(waterGoal)}L.`
      : `${displayName}, hoy vas ${formatLiters(totalMl)}L de ${formatLiters(waterGoal)}L. Un vaso más ya cuenta.`;

    const streak = Math.max(0, profile?.streak ?? profile?.current_streak ?? 0);
    const streakBody = hasNoLogsToday
      ? `${displayName}, tu racha de ${streak} días termina hoy. Un log de 10 segundos la salva.`
      : `${displayName}, te falta un último empujón para cerrar tu día y proteger la racha de ${streak} días.`;

    return {
      waterTitle: '💧 Recordatorio inteligente',
      waterBody,
      streakTitle: '🔥 Racha en riesgo',
      streakBody,
    };
  }, [profile?.current_streak, profile?.id, profile?.name, profile?.streak, profile?.water_goal_ml]);

  const setupAllNotifications = useCallback(async () => {
    if (!prefsReady) return;
    if (!profile?.id) return;
    if (!permissionGranted || !settings.notificationsEnabled) {
      await cancelAllNotifs();
      return;
    }

    setLoading(true);
    try {
      await cancelAllNotifs();

      const cap = Math.max(
        1,
        Math.min(settings.maxNotifsPerDay ?? GLOBAL_MAX_NOTIFS_PER_DAY, GLOBAL_MAX_NOTIFS_PER_DAY),
      );

      const wakeMinutes = profile?.wake_time_minutes ?? 420;
      const sleepMinutes = profile?.sleep_time_minutes ?? 1380;
      const wakeHour = Math.max(7, Math.min(10, Math.floor(wakeMinutes / 60)));
      const wakeMinute = wakeMinutes % 60;
      const serverPlan = await fetchServerAdaptivePlan();
      const remoteDeliveryEnabled = serverPlan?.deliveryMode === 'remote';
      setDeliveryMode(remoteDeliveryEnabled ? 'remote' : 'local');
      const waterHour = serverPlan?.water?.hour ?? await getPreferredWaterReminderHour();
      const copy = await getReminderCopy();
      const [sleepLowHours, mentalLowHours, summaryLowHours, streakLowHours] = await Promise.all([
        getCombinedLowEngagementHours('sleep_bedtime'),
        getCombinedLowEngagementHours('mental_checkin'),
        getCombinedLowEngagementHours('daily_summary'),
        getCombinedLowEngagementHours('streak_at_risk'),
      ]);
      const sleepBlocked = new Set<number>(sleepLowHours);
      const mentalBlocked = new Set<number>(mentalLowHours);
      const summaryBlocked = new Set<number>(summaryLowHours);
      const streakBlocked = new Set<number>(streakLowHours);

      const plans: Array<() => Promise<void>> = [];

      if (prefs.streakAtRisk) {
        const streakHourFromServer = serverPlan?.streak?.hour;
        const streakMinuteFromServer = serverPlan?.streak?.minute;
        const streakHour = Number.isFinite(streakHourFromServer)
          ? clampHour(streakHourFromServer as number, 21)
          : pickFirstAllowedHour([21, 20, 19], streakBlocked, 21);
        const streakMinute = Number.isFinite(streakMinuteFromServer)
          ? toMinute(streakMinuteFromServer, 0)
          : 0;
        plans.push(() =>
          remoteDeliveryEnabled
            ? cancelNotifsByType('streak_at_risk')
            : scheduleStreakAtRisk({
                title: serverPlan?.copy?.streakTitle || copy.streakTitle,
                body: serverPlan?.copy?.streakBody || copy.streakBody,
                hour: streakHour,
                minute: streakMinute,
              }),
        );
      } else {
        plans.push(() => cancelNotifsByType('streak_at_risk'));
      }

      if (prefs.sleep) {
        const preferredSleepHour = Math.max(21, Math.min(23, Math.floor(sleepMinutes / 60)));
        const serverSleepHour = serverPlan?.sleep?.hour;
        const serverSleepMinute = serverPlan?.sleep?.minute;
        const sleepHour = Number.isFinite(serverSleepHour)
          ? clampHour(serverSleepHour as number, preferredSleepHour)
          : pickFirstAllowedHour([preferredSleepHour, 22, 21, 23], sleepBlocked, preferredSleepHour);
        const sleepMinute = Number.isFinite(serverSleepMinute)
          ? toMinute(serverSleepMinute, sleepMinutes % 60)
          : sleepMinutes % 60;
        plans.push(() =>
          remoteDeliveryEnabled
            ? cancelNotifsByType('sleep_bedtime')
            : scheduleSleepReminder(sleepHour, sleepMinute),
        );
      } else {
        plans.push(() => cancelNotifsByType('sleep_bedtime'));
      }

      if (prefs.dailySummary) {
        const serverSummaryHour = serverPlan?.summary?.hour;
        const serverSummaryMinute = serverPlan?.summary?.minute;
        const summaryHour = Number.isFinite(serverSummaryHour)
          ? clampHour(serverSummaryHour as number, 21)
          : pickFirstAllowedHour([21, 20, 19], summaryBlocked, 21);
        const summaryMinute = Number.isFinite(serverSummaryMinute)
          ? toMinute(serverSummaryMinute, 0)
          : 0;
        plans.push(() =>
          remoteDeliveryEnabled
            ? cancelNotifsByType('daily_summary')
            : scheduleDailySummaryReminder(summaryHour, summaryMinute),
        );
      } else {
        plans.push(() => cancelNotifsByType('daily_summary'));
      }

      if (prefs.water) {
        const serverWaterHour = serverPlan?.water?.hour;
        const serverWaterMinute = serverPlan?.water?.minute;
        plans.push(() =>
          remoteDeliveryEnabled
            ? cancelNotifsByType('water_reminder')
            : scheduleWaterReminders(
                [{
                  hour: Number.isFinite(serverWaterHour) ? clampHour(serverWaterHour as number, waterHour) : waterHour,
                  minute: Number.isFinite(serverWaterMinute) ? toMinute(serverWaterMinute, 0) : 0,
                }],
                {
                  title: serverPlan?.copy?.waterTitle || copy.waterTitle,
                  body: serverPlan?.copy?.waterBody || copy.waterBody,
                },
              ),
        );
      } else {
        plans.push(() => cancelNotifsByType('water_reminder'));
      }

      if (prefs.mental) {
        const serverMentalHour = serverPlan?.mental?.hour;
        const serverMentalMinute = serverPlan?.mental?.minute;
        const mentalHour = pickFirstAllowedHour(
          Number.isFinite(serverMentalHour)
            ? [clampHour(serverMentalHour as number, wakeHour), wakeHour, Math.min(11, wakeHour + 1), 9, 8]
            : [wakeHour, Math.min(11, wakeHour + 1), 9, 8],
          mentalBlocked,
          Number.isFinite(serverMentalHour) ? clampHour(serverMentalHour as number, wakeHour) : wakeHour,
        );
        const mentalMinute = Number.isFinite(serverMentalMinute)
          ? toMinute(serverMentalMinute, wakeMinute)
          : wakeMinute;
        plans.push(() =>
          remoteDeliveryEnabled
            ? cancelNotifsByType('mental_checkin')
            : scheduleMentalCheckinReminder(mentalHour, mentalMinute),
        );
      } else {
        plans.push(() => cancelNotifsByType('mental_checkin'));
      }

      const selected = plans.slice(0, cap);
      await Promise.all(selected.map((run) => run()));

      const memory = getProfileMemory(profile);
      const rawOnboardingAt =
        typeof memory.onboarding_completed_at === 'string' ? memory.onboarding_completed_at : '';
      if (rawOnboardingAt) {
        const onboardingDate = new Date(rawOnboardingAt);
        if (!Number.isNaN(onboardingDate.getTime())) {
          const triggerDate = new Date(onboardingDate.getTime() + 24 * 60 * 60 * 1000);
          if (triggerDate.getTime() > Date.now()) {
            await scheduleOnboardingWelcomeReminder(triggerDate, profile?.name);
          }
        }
      }
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'useNotifications.setupAll',
      });
    } finally {
      setLoading(false);
    }
  }, [
    getReminderCopy,
    fetchServerAdaptivePlan,
    getPreferredWaterReminderHour,
    permissionGranted,
    prefsReady,
    prefs.dailySummary,
    prefs.mental,
    prefs.sleep,
    prefs.streakAtRisk,
    prefs.water,
    profile?.id,
    profile?.sleep_time_minutes,
    profile?.wake_time_minutes,
    settings.maxNotifsPerDay,
    settings.notificationsEnabled,
  ]);

  const scheduleSmartNotification = useCallback(
    async (input: {
      type: NotifType;
      title: string;
      body: string;
      date: Date;
      id?: string;
    }) => {
      if (!permissionGranted || !settings.notificationsEnabled) return false;
      if (isWorkoutActive || isFastingActive || isMentalCheckin) return false;

      const today = parseIsoDay(new Date().toISOString());
      if (today !== smartNotifsDate) {
        setSmartNotifsDate(today);
        setSmartNotifsSentToday(0);
      }

      const cap = Math.max(
        1,
        Math.min(settings.maxNotifsPerDay ?? GLOBAL_MAX_NOTIFS_PER_DAY, GLOBAL_MAX_NOTIFS_PER_DAY),
      );
      const remoteScheduledToday = await getBackendTodayScheduledCount();
      if (smartNotifsSentToday >= cap) return false;
      if (remoteScheduledToday >= cap) return false;

      const targetMinutes = toMinutes(input.date);
      if (isWithinGlobalQuietHours(targetMinutes)) return false;

      const id = input.id ?? `${input.type}_${Date.now()}`;
      const result = await scheduleNotif({
        id,
        type: input.type,
        title: input.title,
        body: input.body,
        trigger: { date: input.date } as any,
      });

      if (!result) return false;
      setSmartNotifsSentToday((prev) => prev + 1);
      return true;
    },
    [
      isFastingActive,
      isMentalCheckin,
      isWorkoutActive,
      permissionGranted,
      settings.maxNotifsPerDay,
      settings.notificationsEnabled,
      smartNotifsDate,
      smartNotifsSentToday,
    ],
  );

  useEffect(() => {
    void setupAllNotifications();
  }, [setupAllNotifications]);

  const updatePref = useCallback((key: keyof NotifPreferences, value: boolean) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const savePrefs = useCallback(async () => {
    await setupAllNotifications();

    if (!profile?.id) return;

    try {
      const memory = getProfileMemory(profile);
      const nextMemory = {
        ...memory,
        notification_enabled: settings.notificationsEnabled,
        notification_utc_offset_minutes: -new Date().getTimezoneOffset(),
        notification_prefs: {
          ...prefs,
          maxNotifsPerDay: Math.max(
            1,
            Math.min(settings.maxNotifsPerDay ?? GLOBAL_MAX_NOTIFS_PER_DAY, GLOBAL_MAX_NOTIFS_PER_DAY),
          ),
        },
        notification_quiet_hours: {
          start: QUIET_HOUR_START,
          end: QUIET_HOUR_END,
        },
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          coach_memory_json: nextMemory,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;
      updateProfile({ coach_memory_json: nextMemory as Record<string, unknown> });
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'useNotifications.savePrefs',
      });
    }
  }, [prefs, profile, settings.maxNotifsPerDay, setupAllNotifications, updateProfile]);

  const disableAll = useCallback(async () => {
    await cancelAllNotifs();
    settings.setNotificationsEnabled(false);
    const nextPrefs = {
      water: false,
      sleep: false,
      mental: false,
      dailySummary: false,
      streakAtRisk: false,
      supplements: false,
      workout: false,
    };
    setPrefs(nextPrefs);

    if (!profile?.id) return;
    try {
      const memory = getProfileMemory(profile);
      const nextMemory = {
        ...memory,
        notification_enabled: false,
        notification_prefs: nextPrefs,
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          coach_memory_json: nextMemory,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (!error) {
        updateProfile({ coach_memory_json: nextMemory as Record<string, unknown> });
      }
    } catch {}
  }, [profile, settings, updateProfile]);

  return {
    permissionGranted,
    loading,
    prefs,
    updatePref,
    savePrefs,
    disableAll,
    requestPermissions,
    setupAllNotifications,
    scheduleSmartNotification,
    smartNotifsSentToday,
    deliveryMode,
  };
}
