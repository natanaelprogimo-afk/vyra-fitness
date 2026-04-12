import type { UserProfile } from '@/types/user';

export type WidgetFocus =
  | 'summary'
  | 'kora'
  | 'steps'
  | 'water'
  | 'workout'
  | 'sleep'
  | 'nutrition'
  | 'fasting'
  | 'recovery'
  | 'weight'
  | 'female';

export interface WidgetFocusOption {
  id: WidgetFocus;
  title: string;
  shortTitle: string;
  description: string;
  widgetLabel: string;
  launcherCue: string;
}

export const WIDGET_FOCUS_OPTIONS: WidgetFocusOption[] = [
  { id: 'summary', title: 'Resumen diario', shortTitle: 'Resumen', description: 'VYRA Score, racha y accion prioritaria.', widgetLabel: 'Cierre y score del dia', launcherCue: 'score y foco rapido' },
  { id: 'kora', title: 'Kora', shortTitle: 'Kora', description: 'Estado emocional y mensaje del dia.', widgetLabel: 'Companera y mensaje del dia', launcherCue: 'companera al frente' },
  { id: 'workout', title: 'Entreno', shortTitle: 'Entreno', description: 'Programa activo y sesiones de la semana.', widgetLabel: 'Programa activo y proximo bloque', launcherCue: 'entreno primero' },
  { id: 'recovery', title: 'Recovery', shortTitle: 'Recovery', description: 'Carga interna, HRV y recomendacion de hoy.', widgetLabel: 'Carga y retorno de hoy', launcherCue: 'recuperacion visible' },
  { id: 'steps', title: 'Pasos', shortTitle: 'Pasos', description: 'Progreso actual de movimiento.', widgetLabel: 'Meta de pasos y ritmo actual', launcherCue: 'movimiento primero' },
  { id: 'water', title: 'Agua', shortTitle: 'Agua', description: 'Objetivo y ritmo de hidratacion.', widgetLabel: 'Hidratacion y meta del dia', launcherCue: 'agua visible' },
  { id: 'sleep', title: 'Sueno', shortTitle: 'Sueno', description: 'Ultima noche y score de descanso.', widgetLabel: 'Ultima noche y score', launcherCue: 'descanso primero' },
  { id: 'nutrition', title: 'Nutricion', shortTitle: 'Nutricion', description: 'Calorias, proteina y cierre del dia.', widgetLabel: 'Calorias y cierre de macros', launcherCue: 'nutricion a un toque' },
  { id: 'fasting', title: 'Ayuno', shortTitle: 'Ayuno', description: 'Ventana actual, horas y fase.', widgetLabel: 'Ventana y fase actual', launcherCue: 'ayuno visible' },
  { id: 'weight', title: 'Peso', shortTitle: 'Peso', description: 'Ultimo registro y tendencia semanal.', widgetLabel: 'Ultimo peso y tendencia', launcherCue: 'peso al frente' },
  { id: 'female', title: 'Ciclo femenino', shortTitle: 'Ciclo', description: 'Fase actual y contexto rapido.', widgetLabel: 'Fase y contexto del ciclo', launcherCue: 'fase actual arriba' },
];

export type WidgetSurfaceKind = 'compact' | 'expanded';

export interface WidgetSurfaceDefinition {
  id: WidgetSurfaceKind;
  title: string;
  installTitle: string;
  body: string;
  installBody: string;
}

export const WIDGET_SURFACE_DEFINITIONS: Record<WidgetSurfaceKind, WidgetSurfaceDefinition> = {
  compact: {
    id: 'compact',
    title: 'Compacto',
    installTitle: 'Compacto 2 x 2',
    body: 'Score, racha y siguiente accion en la salida mas rapida del escritorio.',
    installBody: 'Score, racha y siguiente accion en una vista pequena para consultas rapidas.',
  },
  expanded: {
    id: 'expanded',
    title: 'Expandido',
    installTitle: 'Expandido 4 x 2',
    body: 'Semana, contexto y foco del dia cuando necesitas una lectura mas completa.',
    installBody: 'Incluye score, racha, semana y contexto principal del dia para una lectura mas completa.',
  },
};

export interface WidgetCoverageStateCopy {
  id: 'empty' | 'partial' | 'full';
  coverageLabel: string;
  nextMode: string;
  returnMode: string;
  title: string;
  body: string;
}

export function getWidgetCoverageStateCopy(
  installedCount: number,
  pinSupported: boolean,
): WidgetCoverageStateCopy {
  if (installedCount <= 0) {
    return {
      id: 'empty',
      coverageLabel: pinSupported ? 'Vacia' : 'Manual',
      nextMode: pinSupported ? 'Pin sugerido' : 'Manual',
      returnMode: 'Montar',
      title: 'El launcher todavia no cubre el retorno del dia.',
      body: pinSupported
        ? 'Conviene fijar primero la salida mas util y dejar la lectura larga para despues.'
        : 'Tu launcher pide montaje manual, asi que la prioridad es dejar una vista estable antes de afinar foco.',
    };
  }

  if (installedCount === 1) {
    return {
      id: 'partial',
      coverageLabel: 'Parcial',
      nextMode: 'Completar',
      returnMode: 'Completar',
      title: 'El launcher ya sostiene una lectura, pero sigue dejando un hueco visible.',
      body: 'Una segunda superficie termina de cerrar score, semana y siguiente accion sin volver a abrir toda la app.',
    };
  }

  return {
    id: 'full',
    coverageLabel: 'Completa',
    nextMode: pinSupported ? 'Afinar' : 'Manual',
    returnMode: pinSupported ? 'Sostener' : 'Manual',
    title: 'El launcher ya cubre el dia con una pareja compacta y expandida.',
    body: 'Con la cobertura lista, el siguiente ajuste real es dejar el foco correcto y no meter mas friccion.',
  };
}

const FREE_WIDGET_FOCUS = new Set<WidgetFocus>(['summary', 'steps', 'water', 'sleep']);

function getCoachMemory(profile: UserProfile | null): Record<string, unknown> {
  return profile?.coach_memory_json && typeof profile.coach_memory_json === 'object'
    ? (profile.coach_memory_json as Record<string, unknown>)
    : {};
}

function isPremiumProfile(profile: UserProfile | null): boolean {
  if (!profile?.is_premium) return false;
  if (!profile.premium_expires_at) return true;
  return new Date(profile.premium_expires_at) > new Date();
}

export function isWidgetFocusAllowed(profile: UserProfile | null, focus: WidgetFocus): boolean {
  if (isPremiumProfile(profile)) return true;
  return FREE_WIDGET_FOCUS.has(focus);
}

export function getWidgetFocus(profile: UserProfile | null): WidgetFocus {
  const memory = getCoachMemory(profile);
  const raw = memory.widget_focus;
  if (
    raw === 'summary' ||
    raw === 'kora' ||
    raw === 'steps' ||
    raw === 'water' ||
    raw === 'workout' ||
    raw === 'sleep' ||
    raw === 'nutrition' ||
    raw === 'fasting' ||
    raw === 'recovery' ||
    raw === 'weight' ||
    raw === 'female'
  ) {
    return isWidgetFocusAllowed(profile, raw) ? raw : 'summary';
  }
  return 'summary';
}

export function withWidgetFocus(
  memory: Record<string, unknown> | null | undefined,
  focus: WidgetFocus,
): Record<string, unknown> {
  return {
    ...(memory ?? {}),
    widget_focus: focus,
  };
}

export function getWidgetFocusOption(focus: WidgetFocus): WidgetFocusOption {
  return WIDGET_FOCUS_OPTIONS.find((option) => option.id === focus) ?? WIDGET_FOCUS_OPTIONS[0]!;
}
