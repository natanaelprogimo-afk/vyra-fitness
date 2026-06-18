import { LEGACY_ROUTE_META } from './legacyRouteMeta';
import type { ModuleId } from './modules';
import { getOnboardingStepMeta } from './onboardingFlow';

export type RouteSurface =
  | 'auth'
  | 'onboarding'
  | 'tabs'
  | 'module'
  | 'profile'
  | 'settings'
  | 'premium'
  | 'legal'
  | 'special'
  | 'unknown';

export interface RouteMeta {
  pathname: string;
  screenKey: string;
  title: string;
  surface: RouteSurface;
  moduleId?: ModuleId;
  tabKey?: 'home' | 'explore' | 'progress' | 'profile';
  aliasOf?: string;
}

const MODULE_TITLES: Record<ModuleId, string> = {
  water: 'Agua',
  steps: 'Pasos',
  fasting: 'Ayuno',
  sleep: 'Sueño',
  nutrition: 'Nutrición',
  weight: 'Peso',
  workout: 'Entreno',
  recovery: 'Descanso',
  mental: 'Mental',
  supplements: 'Suplementos',
  female: 'Salud femenina',
};

const CANONICAL_ROUTE_META: Record<string, Omit<RouteMeta, 'pathname'>> = {
  '/': { screenKey: 'home_tab', title: 'Inicio', surface: 'tabs', tabKey: 'home' },
  '/explore': { screenKey: 'explore_tab', title: 'Plan', surface: 'tabs', tabKey: 'explore' },
  '/progress': { screenKey: 'progress_tab', title: 'Progreso', surface: 'tabs', tabKey: 'progress' },
  '/profile/sheet': { screenKey: 'profile_sheet', title: 'Perfil', surface: 'profile', tabKey: 'profile' },
  '/profile/claim-account': { screenKey: 'profile_claim_account', title: 'Guardar cuenta', surface: 'profile' },
  '/profile/referral': { screenKey: 'profile_referral', title: 'Acceso heredado', surface: 'special' },
  '/welcome': { screenKey: 'auth_welcome', title: 'Bienvenida', surface: 'auth' },
  '/login': { screenKey: 'auth_login', title: 'Login', surface: 'auth' },
  '/register': { screenKey: 'auth_register', title: 'Registro', surface: 'auth' },
  '/forgot-password': { screenKey: 'auth_forgot_password', title: 'Recuperar acceso', surface: 'auth' },
  '/reset-password': { screenKey: 'auth_reset_password', title: 'Nueva clave', surface: 'auth' },
  '/readiness': { screenKey: 'readiness_today', title: 'VYRA Balance de hoy', surface: 'special' },
  '/referral': { screenKey: 'referral_public', title: 'Registro', surface: 'auth' },
  '/modules/progress/history': { screenKey: 'progress_history', title: 'Progreso - Historial', surface: 'module' },
  '/modules/progress/insights': { screenKey: 'progress_insights', title: 'Progreso - Insights', surface: 'module' },
  '/modules/sleep/history': {
    screenKey: 'sleep_history',
    title: 'Historial de sueño',
    surface: 'module',
    moduleId: 'sleep',
  },
  '/modules/sleep/log': {
    screenKey: 'sleep_log',
    title: 'Registrar sueño',
    surface: 'module',
    moduleId: 'sleep',
  },
  '/modules/sleep/insights': {
    screenKey: 'sleep_insights',
    title: 'Insights de sueño',
    surface: 'module',
    moduleId: 'sleep',
  },
  '/modules/workout/session-preview': {
    screenKey: 'workout_session_preview',
    title: 'Entreno - Preview',
    surface: 'module',
    moduleId: 'workout',
  },
  '/settings/account': {
    screenKey: 'settings_account',
    title: 'Cuenta y seguridad',
    surface: 'settings',
  },
  '/settings/appearance': {
    screenKey: 'settings_appearance',
    title: 'Apariencia y unidades',
    surface: 'settings',
  },
  '/settings/notifications-settings': {
    screenKey: 'settings_notifications_settings',
    title: 'Notificaciones - Ajustes',
    surface: 'settings',
  },
};

const EXPLICIT_META: Record<string, Omit<RouteMeta, 'pathname'>> = {
  ...LEGACY_ROUTE_META,
  ...CANONICAL_ROUTE_META,
};

export function normalizePathname(pathname: string | null | undefined): string {
  if (!pathname) return '/';
  const [pathOnly] = pathname.split('?');
  const trimmed = pathOnly.trim();
  if (!trimmed) return '/';
  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const collapsed = withLeadingSlash.replace(/\/{2,}/g, '/');
  if (collapsed.length > 1) {
    return collapsed.replace(/\/$/, '');
  }
  return collapsed;
}

function titleCase(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function inferModuleMeta(pathname: string): RouteMeta | null {
  if (!pathname.startsWith('/modules/')) return null;
  const parts = pathname.split('/').filter(Boolean);
  const moduleSlug = parts[1] as ModuleId | undefined;
  if (!moduleSlug || !(moduleSlug in MODULE_TITLES)) return null;
  const leaf = parts[2] ?? 'hub';
  return {
    pathname,
    screenKey: `${moduleSlug}_${leaf.replace(/-/g, '_')}`,
    title: leaf === 'hub' ? MODULE_TITLES[moduleSlug] : `${MODULE_TITLES[moduleSlug]} - ${titleCase(leaf)}`,
    surface: 'module',
    moduleId: moduleSlug,
  };
}

function inferSurface(pathname: string): RouteSurface {
  if (pathname.startsWith('/onboarding')) return 'onboarding';
  if (pathname.startsWith('/profile')) return 'profile';
  if (pathname.startsWith('/settings')) return 'settings';
  if (pathname.startsWith('/legal')) return 'legal';
  if (pathname.startsWith('/premium')) return 'premium';
  if (pathname.startsWith('/modules')) return 'module';
  if (['/', '/explore', '/progress'].includes(pathname)) return 'tabs';
  if (['/welcome', '/login', '/register', '/forgot-password', '/reset-password'].includes(pathname)) return 'auth';
  return 'unknown';
}

export function getRouteMeta(pathname: string | null | undefined): RouteMeta {
  const normalized = normalizePathname(pathname);
  const explicit = EXPLICIT_META[normalized];
  if (explicit) {
    return { pathname: normalized, ...explicit };
  }
  const moduleMeta = inferModuleMeta(normalized);
  if (moduleMeta) return moduleMeta;
  if (normalized.startsWith('/onboarding')) {
    const onboardingMeta = getOnboardingStepMeta(normalized);
    if (onboardingMeta) {
      return {
        pathname: normalized,
        screenKey: `onboarding_${onboardingMeta.stepKey}`,
        title: onboardingMeta.title,
        surface: 'onboarding',
      };
    }
    const parts = normalized.split('/').filter(Boolean);
    const leaf = parts[parts.length - 1] ?? 'step';
    return {
      pathname: normalized,
      screenKey: `onboarding_${leaf.replace(/-/g, '_')}`,
      title: `Onboarding - ${titleCase(leaf)}`,
      surface: 'onboarding',
    };
  }
  const segments = normalized.split('/').filter(Boolean);
  const leaf = segments[segments.length - 1] ?? 'home';
  return {
    pathname: normalized,
    screenKey: leaf.replace(/-/g, '_') || 'home',
    title: titleCase(leaf || 'home'),
    surface: inferSurface(normalized),
  };
}
