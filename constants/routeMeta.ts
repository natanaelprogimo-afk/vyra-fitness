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

  | 'gamification'

  | 'legal'

  | 'special'

  | 'unknown';



export interface RouteMeta {

  pathname: string;

  screenKey: string;

  title: string;

  surface: RouteSurface;

  moduleId?: ModuleId;

  tabKey?: 'home' | 'workout' | 'nutrition' | 'progress' | 'profile' | 'quick-log' | 'shop';

  aliasOf?: string;

}



const MODULE_TITLES: Record<ModuleId, string> = {

  water: 'Agua',

  steps: 'Pasos',

  fasting: 'Ayuno',

  sleep: 'Sueno',

  nutrition: 'Nutricion',
  weight: 'Peso',
  workout: 'Entreno',
  recovery: 'Recovery',
  mental: 'Mental',
  supplements: 'Suplementos',
  female: 'Salud femenina',
};


const EXPLICIT_META: Record<string, Omit<RouteMeta, 'pathname'>> = {

  '/': { screenKey: 'home_tab', title: 'Hoy', surface: 'tabs', tabKey: 'home' },

  '/workout': { screenKey: 'workout_tab', title: 'Entreno', surface: 'tabs', tabKey: 'workout' },

  '/nutrition': { screenKey: 'nutrition_tab', title: 'Nutricion', surface: 'tabs', tabKey: 'nutrition' },

  '/progress': { screenKey: 'progress_tab', title: 'Progreso', surface: 'tabs', tabKey: 'progress' },

  '/profile': { screenKey: 'profile_tab', title: 'Perfil', surface: 'tabs', tabKey: 'profile' },

  '/log': { screenKey: 'quick_log', title: 'Registro rapido', surface: 'tabs', tabKey: 'quick-log' },

  '/shop': { screenKey: 'shop_tab', title: 'Tienda', surface: 'tabs', tabKey: 'shop' },

  '/welcome': { screenKey: 'auth_welcome', title: 'Bienvenida', surface: 'auth' },

  '/login': { screenKey: 'auth_login', title: 'Login', surface: 'auth' },

  '/register': { screenKey: 'auth_register', title: 'Registro', surface: 'auth' },

  '/forgot-password': { screenKey: 'auth_forgot_password', title: 'Recuperar acceso', surface: 'auth' },

  '/reset-password': { screenKey: 'auth_reset_password', title: 'Nueva clave', surface: 'auth' },

  '/daily-summary': { screenKey: 'daily_summary', title: 'Resumen diario', surface: 'special' },

  '/first-week': { screenKey: 'first_week', title: 'Primera semana', surface: 'special' },

  '/kora': { screenKey: 'kora', title: 'Kora', surface: 'special' },

  '/referral': { screenKey: 'referral', title: 'Referidos', surface: 'growth' },

  '/premium/paywall': { screenKey: 'premium_paywall', title: 'Premium', surface: 'premium' },
  '/premium/manage': { screenKey: 'premium_manage', title: 'Gestion premium', surface: 'premium' },
  '/premium/value': { screenKey: 'premium_value', title: 'Valor premium', surface: 'premium' },
  '/premium/pricing': { screenKey: 'premium_pricing', title: 'Pricing premium', surface: 'premium' },
  '/premium/economy': { screenKey: 'premium_economy', title: 'Economia VYRA', surface: 'premium' },
  '/store/shop': { screenKey: 'store_shop', title: 'Tienda', surface: 'premium', aliasOf: '/shop' },
  '/store/item-detail': { screenKey: 'store_item_detail', title: 'Detalle de item', surface: 'premium' },
  '/store/rewarded': { screenKey: 'store_rewarded', title: 'Ruta rewarded', surface: 'premium' },
  '/modules/coach': { screenKey: 'coach_hub', title: 'Coach', surface: 'module' },
  '/modules/coach/history': { screenKey: 'coach_history', title: 'Coach - Historial', surface: 'module' },
  '/modules/coach/settings': { screenKey: 'coach_settings', title: 'Coach - Ajustes', surface: 'module' },
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
    title: 'Sintomas',
    surface: 'module',
    moduleId: 'female',
  },
  '/modules/nutrition/food-detail': {
    screenKey: 'nutrition_food_detail',
    title: 'Detalle de alimento',
    surface: 'module',
    moduleId: 'nutrition',
  },
  '/modules/nutrition/search': {
    screenKey: 'nutrition_search_alias',
    title: 'Agregar comida',
    surface: 'module',
    moduleId: 'nutrition',
    aliasOf: '/modules/nutrition/log',
  },
  '/modules/nutrition/photo-log': {
    screenKey: 'nutrition_photo_log',
    title: 'Captura de comida',
    surface: 'module',
    moduleId: 'nutrition',
  },
  '/modules/nutrition/recipes': {
    screenKey: 'nutrition_recipes',
    title: 'Recetas',
    surface: 'module',
    moduleId: 'nutrition',
  },
  '/modules/nutrition/competition-checkin': {
    screenKey: 'nutrition_competition_checkin',
    title: 'Competition check-in',
    surface: 'module',
    moduleId: 'nutrition',
  },
  '/modules/nutrition/voice-log': {
    screenKey: 'nutrition_voice_log',
    title: 'Dictado de comida',
    surface: 'module',
    moduleId: 'nutrition',
  },
  '/modules/weight/log': {
    screenKey: 'weight_log',
    title: 'Registrar peso',
    surface: 'module',
    moduleId: 'weight',
  },
  '/modules/weight/photos': {
    screenKey: 'weight_photos',
    title: 'Fotos de progreso',
    surface: 'module',
    moduleId: 'weight',
  },
  '/modules/sleep/history': {
    screenKey: 'sleep_history_alias',
    title: 'Sueno',
    surface: 'module',
    moduleId: 'sleep',
    aliasOf: '/modules/sleep',
  },
  '/modules/sleep/log': {
    screenKey: 'sleep_log',
    title: 'Registrar sueno',
    surface: 'module',
    moduleId: 'sleep',
  },
  '/modules/sleep/insights': {
    screenKey: 'sleep_insights',
    title: 'Insights de sueno',
    surface: 'module',
    moduleId: 'sleep',
  },
  '/modules/steps/cardio-active': {
    screenKey: 'steps_cardio_active',
    title: 'Cardio activo',
    surface: 'module',
    moduleId: 'steps',
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
  },
  '/modules/water/day': {
    screenKey: 'water_day',
    title: 'Registros de agua',
    surface: 'module',
    moduleId: 'water',
  },
  '/modules/water/custom': {
    screenKey: 'water_custom',
    title: 'Registrar bebida',
    surface: 'module',
    moduleId: 'water',
  },
  '/modules/water/drink-builder': {
    screenKey: 'water_drink_builder',
    title: 'Bebida personalizada',
    surface: 'module',
    moduleId: 'water',
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
  '/modules/workout/active': {
    screenKey: 'workout_active',
    title: 'Modo activo',
    surface: 'module',
    moduleId: 'workout',
  },
  '/modules/workout/rest-timer': {
    screenKey: 'workout_rest_timer',
    title: 'Descanso inteligente',
    surface: 'module',
    moduleId: 'workout',
  },
  '/intelligence/why-vyra': { screenKey: 'why_vyra', title: 'Why Vyra', surface: 'special' },
  '/settings/account': { screenKey: 'profile_edit_alias', title: 'Editar perfil', surface: 'settings', aliasOf: '/profile/edit' },
  '/settings/notifications': { screenKey: 'profile_notifications_alias', title: 'Notificaciones', surface: 'settings', aliasOf: '/profile/notifications' },
  '/settings/notifications-history': { screenKey: 'profile_notifications_history_alias', title: 'Notificaciones - Historial', surface: 'settings', aliasOf: '/profile/notifications-history' },
  '/settings/notifications-settings': { screenKey: 'profile_notifications_settings_alias', title: 'Notificaciones - Ajustes', surface: 'settings', aliasOf: '/profile/notifications-settings' },
  '/settings/danger': { screenKey: 'profile_delete_account_alias', title: 'Eliminar cuenta', surface: 'settings', aliasOf: '/profile/delete-account' },
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

  if (pathname.startsWith('/growth')) return 'growth';

  if (pathname.startsWith('/gamification')) return 'gamification';

  if (pathname.startsWith('/legal')) return 'legal';

  if (pathname.startsWith('/premium')) return 'premium';

  if (pathname.startsWith('/modules')) return 'module';

  if (['/', '/workout', '/nutrition', '/progress', '/profile', '/log', '/shop'].includes(pathname)) return 'tabs';

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

