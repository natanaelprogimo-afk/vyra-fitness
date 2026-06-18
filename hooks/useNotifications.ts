import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { usePathname } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useFemaleSymptomPrediction } from '@/hooks/useFemaleSymptomPrediction';
import { supabase } from '@/lib/supabase';
import {
  buildProfileContextUpdate,
  getProfileContextMemory,
} from '@/lib/profile-context';
import {
  clampQuietHour,
  DEFAULT_NOTIFICATION_QUIET_HOUR_END,
  DEFAULT_NOTIFICATION_QUIET_HOUR_START,
  isWithinQuietHoursWindow,
} from '@/lib/notification-quiet-hours';
import {
  getNotificationPermissionsGranted,
  requestNotificationPermissions,
  registerPushToken,
  registerNotificationCategories,
  scheduleWaterReminders,
  scheduleSleepReminder,
  scheduleSleepSmartAlarm,
  scheduleSleepMorningLog,
  scheduleMentalCheckinReminder,
  scheduleDailySummaryReminder,
  scheduleWorkoutReminder,
  scheduleStreakAtRisk,
  scheduleOnboardingWelcomeReminder,
  scheduleFemalePredictionAlerts,
  cancelAllNotifs,
  cancelNotifsByType,
  scheduleNotif,
  getCombinedLowEngagementHours,
  getBackendTodayScheduledCount,
  type NotifType,
} from '@/lib/notifications';
import { captureError } from '@/lib/sentry';
import { NotificationMessages } from '@/constants/strings';
import {
  trackNotificationPermissionGranted,
  trackNotificationPermissionRequested,
} from '@/lib/analytics';

export interface NotifPreferences {
  water: boolean;
  sleep: boolean;
  mental: boolean;
  dailySummary: boolean;
  streakAtRisk: boolean;
  supplements: boolean;
  workout: boolean;
}

export type SmartNotificationBlockReason =
  | 'permissions_disabled'
  | 'notifications_paused'
  | 'screen_active'
  | 'daily_cap_local'
  | 'daily_cap_remote'
  | 'quiet_hours'
  | 'schedule_failed';

export type SmartNotificationScheduleResult =
  | { scheduled: true; id: string }
  | { scheduled: false; reason: SmartNotificationBlockReason };

const GLOBAL_MAX_NOTIFS_PER_DAY = 1;
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '';
const DEFAULT_PREFS: NotifPreferences = {
  water: true,
  sleep: true,
  mental: false,
  dailySummary: true,
  streakAtRisk: false,
  supplements: true,
  workout: false,
};

function parseIsoDay(value: string): string {
  return value.split('T')[0] ?? value;
}

function toMinute(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.min(59, Math.floor(parsed)));
}

function toMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
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

function average(values: number[], fallback: number) {
  if (!values.length) return fallback;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

type ProfileLike = {
  context_memory_json?: unknown;
} | null | undefined;

function getProfileMemory(profile: ProfileLike): Record<string, unknown> {
  return getProfileContextMemory(profile);
}

function parseStoredPrefs(profile: ProfileLike): NotifPreferences {
  const memory = getProfileMemory(profile);
  const raw =
    memory.notification_prefs && typeof memory.notification_prefs === 'object'
      ?  (memory.notification_prefs as Record<string, unknown>)
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

function parseStoredQuietHours(profile: ProfileLike) {
  const memory = getProfileMemory(profile);
  const raw =
    memory.notification_quiet_hours && typeof memory.notification_quiet_hours === 'object'
      ? (memory.notification_quiet_hours as Record<string, unknown>)
      : {};

  return {
    enabled: raw.enabled !== undefined ? Boolean(raw.enabled) : true,
    start: clampQuietHour(Number(raw.start), DEFAULT_NOTIFICATION_QUIET_HOUR_START),
    end: clampQuietHour(Number(raw.end), DEFAULT_NOTIFICATION_QUIET_HOUR_END),
  };
}

export function useNotifications() {
  const pathname = usePathname();
  const { profile, updateProfile, user } = useAuthStore();
  const settings = useSettingsStore();
  const femalePredictionAlertsEnabled = useSettingsStore((state) => state.femalePredictionAlertsEnabled);
  const { upcomingAlerts: femaleUpcomingAlerts } = useFemaleSymptomPrediction();

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionResolved, setPermissionResolved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prefsReady, setPrefsReady] = useState(false);
  const [smartNotifsSentToday, setSmartNotifsSentToday] = useState(0);
  const [smartNotifsDate, setSmartNotifsDate] = useState(parseIsoDay(new Date().toISOString()));
  const [prefs, setPrefs] = useState<NotifPreferences>(parseStoredPrefs(profile));
  const [deliveryMode, setDeliveryMode] = useState<'local' | 'remote'>('local');

  const isWorkoutActive = pathname.includes('/modules/workout/session');
  const isFastingActive = pathname.includes('/modules/fasting');
  const isMentalCheckin = pathname.includes('/readiness');

  const requestPermissions = useCallback(async () => {
    trackNotificationPermissionRequested('notifications_settings');
    const granted = await requestNotificationPermissions();
    setPermissionGranted(granted);
    setPermissionResolved(true);
    if (granted) {
      trackNotificationPermissionGranted('notifications_settings');
    }
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
      const payload = await res.json().catch((e) => {
        console.debug?.('[useNotifications] adaptive-plan response parse failed', e);
        return null;
      });
      return payload && typeof payload === 'object' ? payload : null;
    } catch {
      return null;
    }
  }, [profile?.id]);

  useEffect(() => {
    let alive = true;

    const syncPermissionStatus = async () => {
      const granted = await getNotificationPermissionsGranted();
      if (!alive) return;
      setPermissionGranted(granted);
      setPermissionResolved(true);
    };

    void syncPermissionStatus();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    void registerNotificationCategories();
  }, []);

  const pushRegistrationUserId = profile?.id ?? user?.id ?? null;

  useEffect(() => {
    if (pushRegistrationUserId && permissionGranted) {
      void registerPushToken(pushRegistrationUserId);
    }
  }, [permissionGranted, pushRegistrationUserId]);

  useEffect(() => {
    const memory = getProfileMemory(profile);
    if (typeof memory.notification_enabled === 'boolean') {
      settings.setNotificationsEnabled(memory.notification_enabled);
    }
    const quietHours = parseStoredQuietHours(profile);
    settings.setNotificationQuietHoursEnabled(quietHours.enabled);
    settings.setNotificationQuietHoursStart(quietHours.start);
    settings.setNotificationQuietHoursEnd(quietHours.end);
    setPrefs(parseStoredPrefs(profile));
    setPrefsReady(true);
  }, [
    profile?.context_memory_json,
    profile?.id,
    settings.setNotificationQuietHoursEnabled,
    settings.setNotificationQuietHoursEnd,
    settings.setNotificationQuietHoursStart,
    settings.setNotificationsEnabled,
  ]);

  const getPreferredWaterReminderHour = useCallback(async (): Promise<number> => {
    if (!profile?.id) return 11;

    const memory = getProfileMemory(profile);
    const ignoredByType =
      memory.notification_ignored_hours && typeof memory.notification_ignored_hours === 'object'
        ?  (memory.notification_ignored_hours as Record<string, unknown>)
        : {};
    const ignoredFromProfile = Array.isArray(ignoredByType.water)
      ?  (ignoredByType.water as unknown[])
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

  const getWorkoutReminderPlan = useCallback(() => {
    const workoutState = useWorkoutStore.getState();
    const startedHours: number[] = [];
    const startedMinutes: number[] = [];

    for (const entry of workoutState.history.slice(0, 24)) {
      const startedAt = new Date(entry.started_at);
      const hour = startedAt.getHours();
      if (hour < 6 || hour > 22) continue;
      startedHours.push(hour);
      startedMinutes.push(startedAt.getMinutes());
    }

    const activeSession = workoutState.activeSession;
    if (activeSession) {
      const startedAt = new Date(activeSession.startedAt);
      startedHours.push(startedAt.getHours());
      startedMinutes.push(startedAt.getMinutes());
    }

    const recommended = workoutState.getRecommendedRoutine().routine;
    const hour = clampHour(average(startedHours, 18), 18);
    const minute = toMinute(average(startedMinutes, 30), 30);

    if (activeSession) {
      return {
        hour,
        minute,
        title: NotificationMessages.routineStillOpen,
        body: NotificationMessages.routineStillOpenDesc.replace('${name}', activeSession.name),
      };
    }

    if (recommended) {
      return {
        hour,
        minute,
        title: NotificationMessages.recommendedRoutineReady,
        body: NotificationMessages.recommendedRoutineDesc.replace('${name}', recommended.name),
      };
    }

    return {
      hour,
      minute,
      title: NotificationMessages.movementBlockReady,
      body: NotificationMessages.movementBlockCta,
    };
  }, []);

  const getReminderCopy = useCallback(async () => {
    const displayName = profile?.name?.trim() || 'Tu racha';
    const waterGoal = profile?.water_goal_ml ?? 2200;

    if (!profile?.id) {
      return {
        waterTitle: NotificationMessages.hydrationReminder,
        waterBody: NotificationMessages.hydrationReminderDesc.replace('${name}', displayName),
        streakTitle: NotificationMessages.streakAtRisk,
        streakBody: NotificationMessages.streakAtRiskDesc.replace('${name}', displayName),
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
      ?  Math.max(1, Math.round((Date.now() - lastWaterAt.getTime()) / (1000 * 60 * 60)))
      : null;

    const logsToday = logsRes.reduce((sum, result) => sum + (result.count ?? 0), 0);
    const hasNoLogsToday = logsToday === 0;

    const waterBody = hoursSinceWater
      ?  `${displayName}, llevás ${hoursSinceWater}h desde tu último registro y hoy vas ${formatLiters(totalMl)}L/${formatLiters(waterGoal)}L.`
      : `${displayName}, hoy vas ${formatLiters(totalMl)}L de ${formatLiters(waterGoal)}L. Un vaso más ya cuenta.`;

    const streak = Math.max(0, profile?.streak ?? profile?.current_streak ?? 0);
    const streakBody = hasNoLogsToday
      ?  `${displayName}, tu racha de ${streak} días termina hoy. Un log de 10 segundos la salva.`
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
    if (!permissionResolved) return;
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
      const workoutPlan = getWorkoutReminderPlan();
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

      const plans: Array<{ priority: number; run: () => Promise<void> }> = [];

      if (prefs.streakAtRisk) {
        const streakHourFromServer = serverPlan?.streak?.hour;
        const streakMinuteFromServer = serverPlan?.streak?.minute;
        const streakHour = Number.isFinite(streakHourFromServer)
          ?  clampHour(streakHourFromServer as number, 21)
          : pickFirstAllowedHour([21, 20, 19], streakBlocked, 21);
        const streakMinute = Number.isFinite(streakMinuteFromServer)
          ?  toMinute(streakMinuteFromServer, 0)
          : 0;
        plans.push({
          priority: 88,
          run: () =>
            remoteDeliveryEnabled
              ? Promise.resolve()
              : scheduleStreakAtRisk({
                  title: serverPlan?.copy?.streakTitle || copy.streakTitle,
                  body: serverPlan?.copy?.streakBody || copy.streakBody,
                  hour: streakHour,
                  minute: streakMinute,
                }),
        });
      }

      if (prefs.water) {
        const serverWaterHour = serverPlan?.water?.hour;
        const serverWaterMinute = serverPlan?.water?.minute;
        plans.push({
          priority: 95,
          run: () =>
            remoteDeliveryEnabled
              ? Promise.resolve()
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
        });
      }

      if (prefs.workout) {
        plans.push({
          priority: 90,
          run: () =>
            remoteDeliveryEnabled
              ? Promise.resolve()
              : scheduleWorkoutReminder(workoutPlan),
        });
      }

      if (prefs.sleep) {
        const preferredSleepHour = Math.max(21, Math.min(23, Math.floor(sleepMinutes / 60)));
        const serverSleepHour = serverPlan?.sleep?.hour;
        const serverSleepMinute = serverPlan?.sleep?.minute;
        const sleepHour = Number.isFinite(serverSleepHour)
          ?  clampHour(serverSleepHour as number, preferredSleepHour)
          : pickFirstAllowedHour([preferredSleepHour, 22, 21, 23], sleepBlocked, preferredSleepHour);
        const sleepMinute = Number.isFinite(serverSleepMinute)
          ?  toMinute(serverSleepMinute, sleepMinutes % 60)
          : sleepMinutes % 60;
        const wakeReminderTotalMinutes = Math.max(6 * 60, Math.min(10 * 60 + 30, wakeMinutes + 30));
        const wakeReminderHour = Math.floor(wakeReminderTotalMinutes / 60);
        const wakeReminderMinute = wakeReminderTotalMinutes % 60;
        plans.push({
          priority: 92,
          run: () =>
            remoteDeliveryEnabled
              ? Promise.resolve()
              : Promise.all([
                  scheduleSleepReminder(sleepHour, sleepMinute),
                  ...(settings.sleepSmartAlarmEnabled
                    ? [
                        scheduleSleepSmartAlarm({
                          bedtimeMinute: sleepMinutes,
                          windowStartMinute: settings.sleepSmartAlarmWindowStart,
                          windowEndMinute: settings.sleepSmartAlarmWindowEnd,
                        }),
                      ]
                    : []),
                  scheduleSleepMorningLog(wakeReminderHour, wakeReminderMinute),
                ]).then(() => undefined),
        });
      }

      if (prefs.dailySummary) {
        const serverSummaryHour = serverPlan?.summary?.hour;
        const serverSummaryMinute = serverPlan?.summary?.minute;
        const summaryHour = Number.isFinite(serverSummaryHour)
          ?  clampHour(serverSummaryHour as number, 21)
          : pickFirstAllowedHour([21, 20, 19], summaryBlocked, 21);
        const summaryMinute = Number.isFinite(serverSummaryMinute)
          ?  toMinute(serverSummaryMinute, 0)
          : 0;
        plans.push({
          priority: 76,
          run: () =>
            remoteDeliveryEnabled
              ? Promise.resolve()
              : scheduleDailySummaryReminder(summaryHour, summaryMinute),
        });
      }

      if (prefs.mental) {
        const serverMentalHour = serverPlan?.mental?.hour;
        const serverMentalMinute = serverPlan?.mental?.minute;
        const mentalHour = pickFirstAllowedHour(
          Number.isFinite(serverMentalHour)
            ?  [clampHour(serverMentalHour as number, wakeHour), wakeHour, Math.min(11, wakeHour + 1), 9, 8]
            : [wakeHour, Math.min(11, wakeHour + 1), 9, 8],
          mentalBlocked,
          Number.isFinite(serverMentalHour) ? clampHour(serverMentalHour as number, wakeHour) : wakeHour,
        );
        const mentalMinute = Number.isFinite(serverMentalMinute)
          ?  toMinute(serverMentalMinute, wakeMinute)
          : wakeMinute;
        plans.push({
          priority: 72,
          run: () =>
            remoteDeliveryEnabled
              ? Promise.resolve()
              : scheduleMentalCheckinReminder(mentalHour, mentalMinute),
        });
      }

      const selected = [...plans]
        .sort((left, right) => right.priority - left.priority)
        .slice(0, cap);
      await Promise.all(selected.map((plan) => plan.run()));

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

      if (profile?.female_health_enabled && femalePredictionAlertsEnabled && femaleUpcomingAlerts.length) {
        const wakeMinutesForFemale = profile?.wake_time_minutes ?? 420;
        const preferredHour = Math.max(8, Math.min(20, Math.floor(wakeMinutesForFemale / 60) + 1));
        const preferredMinute = wakeMinutesForFemale % 60;
        await scheduleFemalePredictionAlerts(
          femaleUpcomingAlerts.map((alert) => {
            const triggerDate = new Date(alert.notifyAt);
            triggerDate.setHours(preferredHour, preferredMinute, 0, 0);
            return {
              id: alert.id,
              title: alert.title,
              body: alert.body,
              triggerDate,
              symptom: alert.symptom,
              nextDateStart: alert.prediction.nextDateStart,
            };
          }),
        );
      } else {
        await cancelNotifsByType('female_prediction');
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
    getWorkoutReminderPlan,
    permissionGranted,
    permissionResolved,
    prefsReady,
    prefs.dailySummary,
    prefs.mental,
    prefs.sleep,
    prefs.streakAtRisk,
    prefs.water,
    profile?.female_health_enabled,
    profile?.id,
    profile?.wake_time_minutes,
    profile?.sleep_time_minutes,
    profile?.wake_time_minutes,
    settings.maxNotifsPerDay,
    femalePredictionAlertsEnabled,
    femaleUpcomingAlerts,
    settings.notificationsEnabled,
    settings.sleepSmartAlarmEnabled,
    settings.sleepSmartAlarmWindowStart,
    settings.sleepSmartAlarmWindowEnd,
  ]);

  const scheduleSmartNotificationDetailed = useCallback(
    async (input: {
      type: NotifType;
      title: string;
      body: string;
      date: Date;
      id?: string;
    }): Promise<SmartNotificationScheduleResult> => {
      if (!permissionGranted) return { scheduled: false, reason: 'permissions_disabled' };
      if (!settings.notificationsEnabled) return { scheduled: false, reason: 'notifications_paused' };
      if (isWorkoutActive || isFastingActive || isMentalCheckin) {
        return { scheduled: false, reason: 'screen_active' };
      }

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
      if (smartNotifsSentToday >= cap) return { scheduled: false, reason: 'daily_cap_local' };
      if (remoteScheduledToday >= cap) return { scheduled: false, reason: 'daily_cap_remote' };

      const targetMinutes = toMinutes(input.date);
      if (
        isWithinQuietHoursWindow(
          targetMinutes,
          settings.notificationQuietHoursStart,
          settings.notificationQuietHoursEnd,
          settings.notificationQuietHoursEnabled,
        )
      ) return { scheduled: false, reason: 'quiet_hours' };

      const id = input.id ?? `${input.type}_${Date.now()}`;
      const result = await scheduleNotif({
        id,
        type: input.type,
        title: input.title,
        body: input.body,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: input.date,
        },
      });

      if (!result) return { scheduled: false, reason: 'schedule_failed' };
      setSmartNotifsSentToday((prev) => prev + 1);
      return { scheduled: true, id };
    },
    [
      isFastingActive,
      isMentalCheckin,
      isWorkoutActive,
      permissionGranted,
      settings.maxNotifsPerDay,
      settings.notificationQuietHoursEnabled,
      settings.notificationQuietHoursEnd,
      settings.notificationQuietHoursStart,
      settings.notificationsEnabled,
      smartNotifsDate,
      smartNotifsSentToday,
    ],
  );

  const scheduleSmartNotification = useCallback(
    async (input: {
      type: NotifType;
      title: string;
      body: string;
      date: Date;
      id?: string;
    }) => {
      const result = await scheduleSmartNotificationDetailed(input);
      return result.scheduled;
    },
    [scheduleSmartNotificationDetailed],
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
          enabled: settings.notificationQuietHoursEnabled,
          start: settings.notificationQuietHoursStart,
          end: settings.notificationQuietHoursEnd,
        },
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          ...buildProfileContextUpdate({ memory: nextMemory }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;
      updateProfile(buildProfileContextUpdate({ memory: nextMemory }));
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'useNotifications.savePrefs',
      });
    }
  }, [
    prefs,
    profile,
    settings.maxNotifsPerDay,
    settings.notificationQuietHoursEnabled,
    settings.notificationQuietHoursEnd,
    settings.notificationQuietHoursStart,
    setupAllNotifications,
    updateProfile,
  ]);

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
          ...buildProfileContextUpdate({ memory: nextMemory }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (!error) {
        updateProfile(buildProfileContextUpdate({ memory: nextMemory }));
      }
    } catch (err) {
      captureError(err instanceof Error ? err : new Error(String(err)), {
        action: 'useNotifications.disableAll',
      });
    }
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
    scheduleSmartNotificationDetailed,
    smartNotifsSentToday,
    deliveryMode,
  };
}
