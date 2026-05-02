import type { ModuleId } from './modules';

export type LegacyRouteSurface =
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

export interface LegacyRouteMetaEntry {
  screenKey: string;
  title: string;
  surface: LegacyRouteSurface;
  moduleId?: ModuleId;
  tabKey?: 'home' | 'explore' | 'progress' | 'profile';
  aliasOf?: string;
}

// Legacy aliases stay available for compatibility, but they no longer define
// the visible taxonomy of the app.
export const LEGACY_ROUTE_META: Record<string, LegacyRouteMetaEntry> = {
  '/workout': {
    screenKey: 'workout_alias',
    title: 'Entreno',
    surface: 'module',
    moduleId: 'workout',
    aliasOf: '/modules/workout',
  },
  '/nutrition': {
    screenKey: 'nutrition_alias',
    title: 'Nutrición',
    surface: 'module',
    moduleId: 'nutrition',
    aliasOf: '/modules/nutrition',
  },
  '/growth/invite': {
    screenKey: 'referral_legacy',
    title: 'Invitar',
    surface: 'profile',
    aliasOf: '/profile/referral',
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
  '/modules/steps/calibration': {
    screenKey: 'steps_calibration',
    title: 'Calibración',
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
    title: 'Avisos de hidratación',
    surface: 'module',
    moduleId: 'water',
    aliasOf: '/modules/water/settings',
  },
  '/modules/workout/history': {
    screenKey: 'workout_history_alias',
    title: 'Entreno - Historial',
    surface: 'module',
    moduleId: 'workout',
    aliasOf: '/progress',
  },
  '/modules/workout/prs': {
    screenKey: 'workout_prs_alias',
    title: 'Entreno - Records',
    surface: 'module',
    moduleId: 'workout',
    aliasOf: '/progress',
  },
  '/modules/workout/stats': {
    screenKey: 'workout_stats_alias',
    title: 'Entreno - Estadisticas',
    surface: 'module',
    moduleId: 'workout',
    aliasOf: '/progress',
  },
  '/settings/notifications': {
    screenKey: 'settings_notifications_alias',
    title: 'Notificaciones',
    surface: 'settings',
    aliasOf: '/settings/notifications-settings',
  },
  '/settings/sessions': {
    screenKey: 'settings_sessions_alias',
    title: 'Sesiones',
    surface: 'settings',
    aliasOf: '/settings/account',
  },
  '/settings/theme': {
    screenKey: 'settings_theme_alias',
    title: 'Tema',
    surface: 'settings',
    aliasOf: '/settings/appearance',
  },
  '/settings/units': {
    screenKey: 'settings_units_alias',
    title: 'Unidades',
    surface: 'settings',
    aliasOf: '/settings/appearance',
  },
  '/settings/language': {
    screenKey: 'settings_language_alias',
    title: 'Idioma',
    surface: 'settings',
    aliasOf: '/settings/appearance',
  },
  '/settings/danger': {
    screenKey: 'settings_danger_alias',
    title: 'Eliminar cuenta',
    surface: 'settings',
    aliasOf: '/settings/account',
  },
};
