import { useCallback, useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useNotifications } from '@/hooks/useNotifications';
import { completeWorkoutFromNotification, quickLogWaterFromNotification } from '@/lib/notification-actions';
import {
  NOTIFICATION_ACTIONS,
  registerNotificationCategories,
  setupNotificationResponseListener,
} from '@/lib/notifications';
import { Routes } from '@/constants/routes';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

function extractAction(data: Record<string, unknown> | undefined) {
  return typeof data?.action === 'string' ? data.action : null;
}

function extractType(
  response: Notifications.NotificationResponse,
  data: Record<string, unknown> | undefined,
) {
  const categoryIdentifier = response.notification.request.content.categoryIdentifier;
  if (typeof categoryIdentifier === 'string' && categoryIdentifier.trim()) {
    return categoryIdentifier;
  }

  return typeof data?.type === 'string' ? data.type : null;
}

function fallbackActionForType(type: string | null) {
  if (
    type === 'water_reminder' ||
    type === 'streak_at_risk' ||
    type === 'context_proactive'
  ) {
    return NOTIFICATION_ACTIONS.openQuickLog;
  }

  if (type === 'workout_reminder') {
    return NOTIFICATION_ACTIONS.openWorkout;
  }

  return null;
}

function extractQuickAmount(data: Record<string, unknown> | undefined) {
  const raw = data?.quickActionAmountMl;
  const parsed =
    typeof raw === 'number'
      ? raw
      : typeof raw === 'string'
        ? Number(raw)
        : NaN;
  return Number.isFinite(parsed) ? parsed : 250;
}

function extractNotificationData(response: Notifications.NotificationResponse) {
  const data = response.notification.request.content.data;
  return data && typeof data === 'object'
    ? (data as Record<string, unknown>)
    : undefined;
}

function buildResponseKey(response: Notifications.NotificationResponse) {
  return [
    response.notification.request.identifier,
    response.actionIdentifier || Notifications.DEFAULT_ACTION_IDENTIFIER,
  ].join(':');
}

function openQuickLogFromNotification() {
  router.replace(Routes.tabs.home as never);
  useUIStore.getState().openQuickLog();

  // Notification taps can race against route/bootstrap work on warm and cold launches.
  [250, 700, 1200].forEach((delayMs) => {
    setTimeout(() => {
      useUIStore.getState().openQuickLog();
    }, delayMs);
  });
}

export default function NotificationsBootstrap() {
  useNotifications();
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const hasResolvedProfile = useAuthStore((s) => s.hasResolvedProfile);
  const session = useAuthStore((s) => s.session);
  const [pendingResponses, setPendingResponses] = useState<Notifications.NotificationResponse[]>([]);
  const handledResponseKeysRef = useRef<Set<string>>(new Set());
  const canProcessResponses = isInitialized && (!session?.user || hasResolvedProfile);

  const enqueueResponse = useCallback((response: Notifications.NotificationResponse) => {
    setPendingResponses((current) => [...current, response]);
  }, []);

  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    const data = extractNotificationData(response);

    const directAction =
      response.actionIdentifier &&
      response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER
        ? response.actionIdentifier
        : null;
    const type = extractType(response, data);
    const action =
      directAction ??
      extractAction(data) ??
      fallbackActionForType(type);

    if (action === NOTIFICATION_ACTIONS.quickLogWater) {
      void (async () => {
        const saved = await quickLogWaterFromNotification(extractQuickAmount(data));
        if (!saved) {
          openQuickLogFromNotification();
        }
      })();
      return;
    }

    if (action === NOTIFICATION_ACTIONS.markWorkoutDone) {
      void (async () => {
        const summary = await completeWorkoutFromNotification();
        if (!summary) {
          router.replace(Routes.workout.index as never);
          return;
        }

        router.replace({
          pathname: Routes.workout.done,
          params: {
            sessionId: summary.sessionId,
            duration: String(summary.durationMin),
            volume: String(summary.totalVolume),
            sets: String(summary.setsCount),
            prs: String(summary.prs.length),
            name: summary.name,
          },
        } as never);
      })();
      return;
    }

    if (action === NOTIFICATION_ACTIONS.openQuickLog) {
      openQuickLogFromNotification();
      return;
    }

    if (action === NOTIFICATION_ACTIONS.openWorkout) {
      router.replace(Routes.workout.index as never);
      return;
    }

    router.replace(Routes.tabs.home as never);
  }, []);

  useEffect(() => {
    void registerNotificationCategories();

    const unsubscribe = setupNotificationResponseListener(enqueueResponse);

    void (async () => {
      const lastResponse = await Notifications.getLastNotificationResponseAsync();
      if (lastResponse) {
        enqueueResponse(lastResponse);
      }
    })();

    return unsubscribe;
  }, [enqueueResponse]);

  useEffect(() => {
    if (!canProcessResponses || pendingResponses.length === 0) return;

    const [response, ...rest] = pendingResponses;
    setPendingResponses(rest);

    const responseKey = buildResponseKey(response);
    if (handledResponseKeysRef.current.has(responseKey)) {
      return;
    }

    handledResponseKeysRef.current.add(responseKey);
    handleNotificationResponse(response);

    const notificationsApi = Notifications as typeof Notifications & {
      clearLastNotificationResponseAsync?: () => Promise<void>;
    };
    void notificationsApi.clearLastNotificationResponseAsync?.();
  }, [canProcessResponses, handleNotificationResponse, pendingResponses]);

  return null;
}
