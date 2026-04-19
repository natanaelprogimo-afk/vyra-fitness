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

  | 'growth'

  | 'legal'

  | 'special'

  | 'unknown';



export interface RouteMeta {

  pathname: string;

  screenKey: string;

  title: string;

  surface: RouteSurface;

  moduleId?: ModuleId;

  tabKey?: 'home' | 'progress';

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


const EXPLICIT_META: Record<string, Omit<RouteMeta, 'pathname'>> = {

  '/': { screenKey: 'home_tab', title: 'Inicio', surface: 'tabs', tabKey: 'home' },

  '/workout': { screenKey: 'workout_tab_alias', title: 'Entreno', surface: 'tabs', aliasOf: '/modules/workout' },

  '/nutrition': { screenKey: 'nutrition_tab_alias', title: 'Nutrición', surface: 'tabs', aliasOf: '/modules/nutrition' },

  '/progress': { screenKey: 'progress_tab', title: 'Progreso', surface: 'tabs', tabKey: 'progress' },

  '/profile/sheet': { screenKey: 'profile_sheet', title: 'Perfil', surface: 'profile' },

  '/shop': { screenKey: 'shop_alias_paywall', title: 'Premium', surface: 'premium', aliasOf: '/premium/paywall' },

  '/welcome': { screenKey: 'auth_welcome', title: 'Bienvenida', surface: 'auth' },

  '/login': { screenKey: 'auth_login', title: 'Login', surface: 'auth' },

  '/register': { screenKey: 'auth_register', title: 'Registro', surface: 'auth' },

  '/forgot-password': { screenKey: 'auth_forgot_password', title: 'Recuperar acceso', surface: 'auth' },

  '/reset-password': { screenKey: 'auth_reset_password', title: 'Nueva clave', surface: 'auth' },

  '/daily-summary': { screenKey: 'daily_summary_alias_progress', title: 'Tu progreso', surface: 'special', aliasOf: '/progress' },

  '/kora': { screenKey: 'kora_alias', title: 'Tu progreso', surface: 'special', aliasOf: '/progress' },

  '/referral': { screenKey: 'referral', title: 'Referidos', surface: 'growth' },

  '/premium/paywall': { screenKey: 'premium_paywall', title: 'Premium', surface: 'premium' },
  '/premium/manage': { screenKey: 'premium_manage', title: 'Gestion premium', surface: 'premium' },
  '/modules/progress/history': { screenKey: 'progress_history', title: 'Progreso - Historial', surface: 'module' },
  '/modules/progress/insights': { screenKey: 'progress_insights', title: 'Progreso - Insights', surface: 'module' },
  '/modules/fasting/history': {
    screenKey: 'fasting_history_alias',
    title: 'Ayuno intermitente',
    surface: 'module',
    moduleId: 'fasting',
    aliasOf: '/modules/fasting',
  },
  '/modules/female/symptoms': {
    screenKey: 'female_symptoms',
    title: 'Síntomas',
    surface: 'module',
    moduleId: 'female',
    aliasOf: '/modules/female',
  },
  '/modules/female/history': {
    screenKey: 'female_history_alias',
    title: 'Ciclo - Historial',
    surface: 'module',
    moduleId: 'female',
    aliasOf: '/modules/female',
  },
  '/modules/nutrition/food-detail': {
    screenKey: 'nutrition_food_detail',
    title: 'Detalle de alimento',
    surface: 'module',
    moduleId: 'nutrition',
    aliasOf: '/modules/nutrition/log',
  },
  '/modules/nutrition/search': {
    screenKey: 'nutrition_search_alias',
    title: 'Agregar comida',
    surface: 'module',
    moduleId: 'nutrition',
    aliasOf: '/modules/nutrition/log',
  },
  '/modules/nutrition/recipes': {
    screenKey: 'nutrition_recipes',
    title: 'Recetas',
    surface: 'module',
    moduleId: 'nutrition',
    aliasOf: '/modules/nutrition',
  },
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
  '/modules/steps/cardio-active': {
    screenKey: 'steps_cardio_active',
    title: 'Cardio activo',
    surface: 'module',
    moduleId: 'steps',
    aliasOf: '/modules/steps',
  },
  '/modules/steps/map': {
    screenKey: 'steps_map_alias',
    title: 'Pasos - Ruta',
    surface: 'module',
    moduleId: 'steps',
    aliasOf: '/modules/steps',
  },
  '/modules/steps/history': {
    screenKey: 'steps_history',
    title: 'Historial de pasos',
    surface: 'module',
    moduleId: 'steps',
  },
  '/modules/steps/calibration': {
    screenKey: 'steps_calibration',
    title: 'Calibracion',
    surface: 'module',
    moduleId: 'steps',
    aliasOf: '/modules/steps/settings',
  },
  '/modules/water/day': {
    screenKey: 'water_day',
    title: 'Registros de agua',
    surface: 'module',
    moduleId: 'water',
    aliasOf: '/modules/water',
  },
  '/modules/water/custom': {
    screenKey: 'water_custom',
    title: 'Registrar bebida',
    surface: 'module',
    moduleId: 'water',
    aliasOf: '/modules/water',
  },
  '/modules/water/drink-builder': {
    screenKey: 'water_drink_builder',
    title: 'Bebida personalizada',
    surface: 'module',
    moduleId: 'water',
    aliasOf: '/modules/water',
  },
  '/modules/water/reminders': {
    screenKey: 'water_reminders_alias',
    title: 'Avisos de hidratacion',
    surface: 'module',
    moduleId: 'water',
    aliasOf: '/modules/water/settings',
  },
  '/modules/workout/insights': {
    screenKey: 'workout_insights',
    title: 'Entreno - Insights',
    surface: 'module',
    moduleId: 'workout',
  },
  '/modules/workout/history': {
    screenKey: 'workout_history_alias',
    title: 'Entreno - Historial',
    surface: 'module',
    moduleId: 'workout',
    aliasOf: '/modules/workout/insights',
  },
  '/modules/workout/prs': {
    screenKey: 'workout_prs_alias',
    title: 'Entreno - Records',
    surface: 'module',
    moduleId: 'workout',
    aliasOf: '/modules/workout/insights',
  },
  '/modules/workout/stats': {
    screenKey: 'workout_stats_alias',
    title: 'Entreno - Estadisticas',
    surface: 'module',
    moduleId: 'workout',
    aliasOf: '/modules/workout/insights',
  },
  '/modules/workout/routines': {
    screenKey: 'workout_routines_alias',
    title: 'Entreno',
    surface: 'module',
    moduleId: 'workout',
    aliasOf: '/modules/workout',
  },
  '/modules/workout/exercises': {
    screenKey: 'workout_exercises_alias',
    title: 'Entreno',
    surface: 'module',
    moduleId: 'workout',
    aliasOf: '/modules/workout',
  },
  '/modules/workout/session-preview': {
    screenKey: 'workout_session_preview',
    title: 'Entreno - Preview',
    surface: 'module',
    moduleId: 'workout',
  },
  '/intelligence/why-vyra': { screenKey: 'why_vyra', title: 'Why Vyra', surface: 'special', aliasOf: '/' },
  '/settings/account': { screenKey: 'settings_account', title: 'Cuenta y seguridad', surface: 'settings' },
  '/settings/appearance': { screenKey: 'settings_appearance', title: 'Apariencia y region', surface: 'settings' },
  '/settings/notifications': { screenKey: 'settings_notifications_alias', title: 'Notificaciones', surface: 'settings', aliasOf: '/settings/notifications-settings' },
  '/settings/notifications-history': { screenKey: 'settings_notifications_history', title: 'Historial de notificaciones', surface: 'settings' },
  '/settings/notifications-settings': { screenKey: 'settings_notifications_settings', title: 'Notificaciones - Ajustes', surface: 'settings' },
  '/settings/sessions': { screenKey: 'settings_sessions_alias', title: 'Sesiones', surface: 'settings', aliasOf: '/settings/account' },
  '/settings/theme': { screenKey: 'settings_theme_alias', title: 'Tema', surface: 'settings', aliasOf: '/settings/appearance' },
  '/settings/units': { screenKey: 'settings_units_alias', title: 'Unidades', surface: 'settings', aliasOf: '/settings/appearance' },
  '/settings/language': { screenKey: 'settings_language_alias', title: 'Idioma', surface: 'settings', aliasOf: '/settings/appearance' },
  '/settings/danger': { screenKey: 'settings_danger_alias', title: 'Eliminar cuenta', surface: 'settings', aliasOf: '/settings/account' },
};


export function normalizePathname(pathname: string | null | undefined): string {

  if (!pathname) return '/';

  const [pathOnly] = pathname.split('??');

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

  if (pathname.startsWith('/growth')) return 'growth';

  if (pathname.startsWith('/legal')) return 'legal';

  if (pathname.startsWith('/premium')) return 'premium';

  if (pathname.startsWith('/modules')) return 'module';

  if (['/', '/workout', '/nutrition', '/progress'].includes(pathname)) return 'tabs';

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

