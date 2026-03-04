// ============================================================
// VYRA FITNESS — Sentry Crash Reporting
// Configuración e helpers para reportar errores en producción
// ============================================================

import * as Sentry from '@sentry/react-native';

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? '';

export function initSentry() {
  if (!DSN) {
    console.warn('[Vyra/Sentry] No DSN configurado — crash reporting desactivado.');
    return;
  }

  Sentry.init({
    dsn: DSN,
    debug: __DEV__,
    environment: __DEV__ ? 'development' : 'production',
    enableNative: true,
    tracesSampleRate: __DEV__ ? 1.0 : 0.2,     // 20% de traces en producción
    beforeSend(event) {
      // Nunca enviar PII (datos personales identificables)
      if (event.user) {
        event.user = { id: event.user.id };     // Solo el ID, no email ni nombre
      }
      return event;
    },
  });
}

/**
 * Identificar al usuario en Sentry.
 * Solo enviar el ID — nunca email ni nombre (PII).
 */
export function setSentryUser(userId: string) {
  Sentry.setUser({ id: userId });
}

export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Reportar un error capturado manualmente.
 * Usar en bloques catch donde el error es inesperado.
 */
export function captureError(error: Error, context?: Record<string, unknown>) {
  if (__DEV__) {
    console.error('[Vyra/Error]', error.message, context);
    return;
  }
  Sentry.withScope((scope) => {
    if (context) {
      scope.setExtras(context);
    }
    Sentry.captureException(error);
  });
}

/**
 * Registrar un evento de breadcrumb.
 * Útil para trazar el flujo antes de un crash.
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

export { Sentry };