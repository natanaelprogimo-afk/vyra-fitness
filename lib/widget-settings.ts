import { getProfileContextMemory } from '@/lib/profile-context';
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
  focusCue: string;
}

export const WIDGET_FOCUS_OPTIONS: WidgetFocusOption[] = [
  {
    id: 'summary',
    title: 'Resumen diario',
    shortTitle: 'Resumen',
    description: 'Tu cierre del dia, la racha y la siguiente accion importante.',
    widgetLabel: 'resumen del dia',
    focusCue: 'cierre claro',
  },
  {
    id: 'kora',
    title: 'Pulso emocional',
    shortTitle: 'Pulso',
    description: 'Estado emocional y mensaje corto del dia.',
    widgetLabel: 'pulso emocional',
    focusCue: 'tono del dia',
  },
  {
    id: 'workout',
    title: 'Entreno',
    shortTitle: 'Entreno',
    description: 'Programa activo, bloque actual y continuidad de la semana.',
    widgetLabel: 'entreno de hoy',
    focusCue: 'entreno primero',
  },
  {
    id: 'recovery',
    title: 'Recuperacion',
    shortTitle: 'Recup.',
    description: 'Carga interna y recomendacion del dia.',
    widgetLabel: 'recuperacion del dia',
    focusCue: 'dia mas ligero',
  },
  {
    id: 'steps',
    title: 'Pasos',
    shortTitle: 'Pasos',
    description: 'Movimiento actual y cuanto falta para cerrar la meta.',
    widgetLabel: 'pasos de hoy',
    focusCue: 'movimiento al frente',
  },
  {
    id: 'water',
    title: 'Agua',
    shortTitle: 'Agua',
    description: 'Progreso de hidratacion y lo que queda del objetivo.',
    widgetLabel: 'hidratacion del dia',
    focusCue: 'agua a la vista',
  },
  {
    id: 'sleep',
    title: 'Sueno',
    shortTitle: 'Sueno',
    description: 'Ultima noche y lectura breve de descanso.',
    widgetLabel: 'sueno de anoche',
    focusCue: 'descanso primero',
  },
  {
    id: 'nutrition',
    title: 'Nutricion',
    shortTitle: 'Nutri',
    description: 'Calorias, proteina y cierre nutricional del dia.',
    widgetLabel: 'nutricion del dia',
    focusCue: 'comida al frente',
  },
  {
    id: 'fasting',
    title: 'Ayuno',
    shortTitle: 'Ayuno',
    description: 'Ventana activa y tiempo que resta o ya cumpliste.',
    widgetLabel: 'ayuno actual',
    focusCue: 'ventana actual',
  },
  {
    id: 'weight',
    title: 'Peso',
    shortTitle: 'Peso',
    description: 'Ultimo registro y tendencia breve.',
    widgetLabel: 'peso actual',
    focusCue: 'peso a mano',
  },
  {
    id: 'female',
    title: 'Ciclo femenino',
    shortTitle: 'Ciclo',
    description: 'Fase actual y contexto breve del ciclo.',
    widgetLabel: 'ciclo actual',
    focusCue: 'fase actual',
  },
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
    body: 'Deja el dato clave y la accion principal en poco espacio.',
    installBody: 'Ideal para ver lo importante rapido desde la pantalla de inicio.',
  },
  expanded: {
    id: 'expanded',
    title: 'Expandido',
    installTitle: 'Expandido 4 x 2',
    body: 'Muestra resumen, contexto y foco del dia en una vista mas amplia.',
    installBody: 'Ideal cuando quieres mas contexto sin tener que abrir la app.',
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
      coverageLabel: pinSupported ? 'Sin widget' : 'Manual',
      nextMode: pinSupported ? 'Agregar' : 'Manual',
      returnMode: 'Empezar',
      title: 'Todavia no tienes un widget activo.',
      body: pinSupported
        ? 'Empieza por el formato que mejor te ahorre abrir la app.'
        : 'Tu telefono no deja agregarlo desde aqui, pero igual puedes ponerlo manualmente y luego afinar el enfoque.',
    };
  }

  if (installedCount === 1) {
    return {
      id: 'partial',
      coverageLabel: 'Parcial',
      nextMode: 'Completar',
      returnMode: 'Completar',
      title: 'Ya tienes un widget activo, pero aun puedes completar la vista.',
      body: 'Sumar el segundo formato te da mas contexto sin meter ruido.',
    };
  }

  return {
    id: 'full',
    coverageLabel: 'Completa',
    nextMode: pinSupported ? 'Ajustar' : 'Manual',
    returnMode: pinSupported ? 'Lista' : 'Manual',
    title: 'Tu pantalla de inicio ya esta bien cubierta.',
    body: 'Con ambos formatos activos, ahora lo importante es elegir el foco correcto y dejarlo simple.',
  };
}

const FREE_WIDGET_FOCUS = new Set<WidgetFocus>(['summary', 'steps', 'water', 'sleep']);

function getContextMemory(profile: UserProfile | null): Record<string, unknown> {
  return getProfileContextMemory(profile);
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
  const memory = getContextMemory(profile);
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
