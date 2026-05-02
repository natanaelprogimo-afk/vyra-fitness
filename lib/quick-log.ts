import type { ModuleId } from '@/constants/modules';
import { Colors } from '@/constants/colors';
import { Routes } from '@/constants/routes';
import { getActiveModules } from '@/lib/active-modules';
import type { UserProfile } from '@/types/user';

export const QUICK_LOG_WEIGHT_ROUTE = '__quick_log_weight__';

export type QuickAction = {
  emoji: string;
  title: string;
  subtitle: string;
  route: string;
  moduleId: ModuleId;
  color: string;
};

export const QUICK_ACTIONS: QuickAction[] = [
  {
    emoji: '\u{1F4A7}',
    title: 'Registrar agua',
    subtitle: 'Agrega hidratación rápida',
    route: Routes.water.index,
    moduleId: 'water',
    color: Colors.water,
  },
  {
    emoji: '\u{1F34E}',
    title: 'Registrar comida',
    subtitle: 'Búsqueda, barcode o manual',
    route: '/modules/nutrition/log?mealType=snack',
    moduleId: 'nutrition',
    color: Colors.nutrition,
  },
  {
    emoji: '\u2696\uFE0F',
    title: 'Registrar peso',
    subtitle: 'Peso, ayunas y nota diaria',
    route: QUICK_LOG_WEIGHT_ROUTE,
    moduleId: 'weight',
    color: Colors.weight,
  },
  {
    emoji: '\u{1F634}',
    title: 'Registrar sueño',
    subtitle: 'Horas y calidad',
    route: Routes.sleep.index,
    moduleId: 'sleep',
    color: Colors.sleep,
  },
  {
    emoji: '\u{1F4AA}',
    title: 'Iniciar entreno',
    subtitle: 'Comienza sesión activa',
    route: Routes.workout.session,
    moduleId: 'workout',
    color: Colors.workout,
  },
];

function actionPriority(moduleId: ModuleId, hour: number): number {
  if (hour >= 6 && hour <= 10) {
    if (moduleId === 'weight') return 110;
    if (moduleId === 'sleep') return 100;
    if (moduleId === 'water') return 90;
  }

  if (hour >= 11 && hour <= 15) {
    if (moduleId === 'nutrition') return 100;
    if (moduleId === 'water') return 90;
  }

  if (hour >= 16 && hour <= 20) {
    if (moduleId === 'workout') return 100;
    if (moduleId === 'water') return 90;
    if (moduleId === 'nutrition') return 80;
  }

  if (hour >= 21 || hour <= 3) {
    if (moduleId === 'sleep') return 100;
    if (moduleId === 'water') return 80;
    if (moduleId === 'nutrition') return 70;
  }

  return 50;
}

export function getQuickLogActions(
  profile: UserProfile | null | undefined,
  hour = new Date().getHours(),
) {
  const activeModules = getActiveModules(profile);
  const allowed = new Set<ModuleId>([...activeModules, 'weight']);

  return QUICK_ACTIONS
    .filter((action) => allowed.has(action.moduleId))
    .sort((a, b) => actionPriority(b.moduleId, hour) - actionPriority(a.moduleId, hour));
}
