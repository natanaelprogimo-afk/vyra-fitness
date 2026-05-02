import { getProfileContextMemory } from '@/lib/profile-context';
import type { UserProfile } from '@/types/user';

export type WidgetFocus =
  | 'summary'
  | 'balance'
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
    description: 'Tu cierre del día, la racha y la siguiente acción importante.',
    widgetLabel: 'resumen del día',
    focusCue: 'cierre claro',
  },
  {
    id: 'balance',
    title: 'VYRA Balance',
    shortTitle: 'Balance',
    description: 'Tu balance del día, el tono general y la siguiente acción importante.',
    widgetLabel: 'balance del día',
    focusCue: 'balance visible',
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
    title: 'Recuperación',
    shortTitle: 'Recup.',
    description: 'Carga interna y recomendación del día.',
    widgetLabel: 'recuperación del día',
    focusCue: 'día más ligero',
  },
  {
    id: 'steps',
    title: 'Pasos',
    shortTitle: 'Pasos',
    description: 'Movimiento actual y cuánto falta para cerrar la meta.',
    widgetLabel: 'pasos de hoy',
    focusCue: 'movimiento al frente',
  },
  {
    id: 'water',
    title: 'Agua',
    shortTitle: 'Agua',
    description: 'Progreso de hidratación y lo que queda del objetivo.',
    widgetLabel: 'hidratación del día',
    focusCue: 'agua a la vista',
  },
  {
    id: 'sleep',
    title: 'Sueño',
    shortTitle: 'Sueño',
    description: 'Última noche y lectura breve de descanso.',
    widgetLabel: 'sueño de anoche',
    focusCue: 'descanso primero',
  },
  {
    id: 'nutrition',
    title: 'Nutrición',
    shortTitle: 'Nutri',
    description: 'Calorías, proteína y cierre nutricional del día.',
    widgetLabel: 'nutrición del día',
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
    description: 'Último registro y tendencia breve.',
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
    body: 'Deja el dato clave y la acción principal en poco espacio.',
    installBody: 'Ideal para ver lo importante rápido desde la pantalla de inicio.',
  },
  expanded: {
    id: 'expanded',
    title: 'Expandido',
    installTitle: 'Expandido 4 x 2',
    body: 'Muestra resumen, contexto y foco del día en una vista más amplia.',
    installBody: 'Ideal cuando quieres más contexto sin tener que abrir la app.',
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
      title: 'Todavía no tienes un widget activo.',
      body: pinSupported
        ? 'Empieza por el formato que mejor te ahorre abrir la app.'
        : 'Tu teléfono no deja agregarlo desde aquí, pero igual puedes ponerlo manualmente y luego afinar el enfoque.',
    };
  }

  if (installedCount === 1) {
    return {
      id: 'partial',
      coverageLabel: 'Parcial',
      nextMode: 'Completar',
      returnMode: 'Completar',
      title: 'Ya tienes un widget activo, pero aún puedes completar la vista.',
      body: 'Sumar el segundo formato te da más contexto sin meter ruido.',
    };
  }

  return {
    id: 'full',
    coverageLabel: 'Completa',
    nextMode: pinSupported ? 'Ajustar' : 'Manual',
    returnMode: pinSupported ? 'Lista' : 'Manual',
    title: 'Tu pantalla de inicio ya está bien cubierta.',
    body: 'Con ambos formatos activos, ahora lo importante es elegir el foco correcto y dejarlo simple.',
  };
}

const LEGACY_WIDGET_FOCUS_ALIASES: Record<string, WidgetFocus> = {
  kora: 'balance',
};

function getContextMemory(profile: UserProfile | null): Record<string, unknown> {
  return getProfileContextMemory(profile);
}

export function isWidgetFocusAllowed(profile: UserProfile | null, focus: WidgetFocus): boolean {
  void profile;
  void focus;
  return true;
}

export function getWidgetFocus(profile: UserProfile | null): WidgetFocus {
  const memory = getContextMemory(profile);
  const raw = memory.widget_focus;
  if (typeof raw === 'string') {
    const normalized = raw.trim().toLowerCase();
    const resolvedAlias = LEGACY_WIDGET_FOCUS_ALIASES[normalized];
    const nextFocus = (
      resolvedAlias ??
      (normalized === 'summary' ||
      normalized === 'balance' ||
      normalized === 'steps' ||
      normalized === 'water' ||
      normalized === 'workout' ||
      normalized === 'sleep' ||
      normalized === 'nutrition' ||
      normalized === 'fasting' ||
      normalized === 'recovery' ||
      normalized === 'weight' ||
      normalized === 'female'
        ? normalized
        : null)
    ) as WidgetFocus | null;

    if (nextFocus) {
      return isWidgetFocusAllowed(profile, nextFocus) ? nextFocus : 'summary';
    }
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
