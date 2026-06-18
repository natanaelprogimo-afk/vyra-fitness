import { Colors } from './colors';

export type ModuleId =
  | 'water'
  | 'steps'
  | 'fasting'
  | 'sleep'
  | 'nutrition'
  | 'weight'
  | 'workout'
  | 'recovery'
  | 'mental'
  | 'supplements'
  | 'female';

export type ModuleTier = 'core' | 'contextual';

export interface ModuleDefinition {
  id: string;
  name: string;
  shortName?: string;
  emoji: string;
  color: string;
  route: string;
  description: string;
  tier: ModuleTier;
}

export const CORE_MODULE_IDS: ModuleId[] = ['workout', 'nutrition', 'sleep', 'water', 'steps'];
export const CONTEXTUAL_MODULE_IDS: ModuleId[] = ['fasting', 'female', 'supplements'];
export const DEFAULT_ACTIVE_MODULES: ModuleId[] = ['nutrition', 'water'];

const MODULE_PRIORITY: Record<ModuleId, number> = {
  workout: 0,
  nutrition: 1,
  sleep: 2,
  water: 3,
  steps: 4,
  fasting: 5,
  female: 6,
  supplements: 7,
  weight: 8,
  recovery: 9,
  mental: 10,
};

// Weight, recovery and mental still exist as cross-module data, but they are
// no longer part of the navigable module grid.
export const MODULES: ModuleDefinition[] = [
  {
    id: 'workout',
    name: 'Entreno',
    shortName: 'Entreno',
    emoji: '💪',
    color: Colors.workout,
    route: '/modules/workout',
    description: 'Rutina de hoy, sesiones y progreso de fuerza.',
    tier: 'core',
  },
  {
    id: 'nutrition',
    name: 'Nutrición',
    shortName: 'Nutri',
    emoji: '🍎',
    color: Colors.nutrition,
    route: '/modules/nutrition',
    description: 'Comidas, macros y decisiones simples para adherencia.',
    tier: 'core',
  },
  {
    id: 'sleep',
    name: 'Sueño',
    shortName: 'Sueño',
    emoji: '😴',
    color: Colors.sleep,
    route: '/modules/sleep',
    description: 'Horas, calidad y lectura de descanso reciente.',
    tier: 'core',
  },
  {
    id: 'water',
    name: 'Agua',
    shortName: 'Agua',
    emoji: '💧',
    color: Colors.water,
    route: '/modules/water',
    description: 'Hidratación diaria, meta y ritmo del día.',
    tier: 'core',
  },
  {
    id: 'steps',
    name: 'Pasos',
    shortName: 'Pasos',
    emoji: '👟',
    color: Colors.steps,
    route: '/modules/steps',
    description: 'Meta de movimiento, caminatas y consistencia semanal.',
    tier: 'core',
  },
  {
    id: 'fasting',
    name: 'Ayuno',
    shortName: 'Ayuno',
    emoji: '⏳',
    color: Colors.fasting,
    route: '/modules/fasting',
    description: 'Ventanas de ayuno y control del protocolo activo.',
    tier: 'contextual',
  },
  {
    id: 'female',
    name: 'Salud femenina',
    shortName: 'Ciclo',
    emoji: '🌸',
    color: Colors.female,
    route: '/modules/female',
    description: 'Ciclo, síntomas y ajustes por fase.',
    tier: 'contextual',
  },
  {
    id: 'supplements',
    name: 'Suplementos',
    shortName: 'Suples',
    emoji: '💊',
    color: Colors.supplements,
    route: '/modules/supplements',
    description: 'Stack, recordatorios y adherencia.',
    tier: 'contextual',
  },
];

export const GridModules: ModuleId[] = MODULES.map((module) => module.id as ModuleId);
export const Modules = MODULES;

export function getModulePriority(moduleId: ModuleId): number {
  return MODULE_PRIORITY[moduleId] ?? 999;
}

export function sortModuleIds(moduleIds: ModuleId[]): ModuleId[] {
  return [...new Set(moduleIds)].sort((left, right) => getModulePriority(left) - getModulePriority(right));
}

export function getModuleDefinition(moduleId: string): ModuleDefinition | undefined {
  return MODULES.find((module) => module.id === moduleId);
}

export interface DrinkType {
  id: string;
  label: string;
  emoji: string;
  factor: number;
  isAlcohol?: boolean;
}

export const DRINK_TYPES: DrinkType[] = [
  { id: 'water', label: 'Agua pura', emoji: '💧', factor: 1.0 },
  { id: 'electrolyte', label: 'Agua con electrolitos', emoji: '⚡', factor: 1.05 },
  { id: 'sports', label: 'Bebida deportiva', emoji: '🥤', factor: 1.0 },
  { id: 'tea', label: 'Té o infusión', emoji: '🍵', factor: 0.85 },
  { id: 'coffee', label: 'Café', emoji: '☕', factor: 0.75 },
  { id: 'juice', label: 'Jugo natural', emoji: '🍊', factor: 0.9 },
  { id: 'milk', label: 'Leche', emoji: '🥛', factor: 0.9 },
  { id: 'alcohol', label: 'Alcohol', emoji: '🍺', factor: 0.0, isAlcohol: true },
];

export function getDrinkType(id: string): DrinkType {
  return DRINK_TYPES.find((drink) => drink.id === id) ?? DRINK_TYPES[0];
}

export const WATER_QUICK_AMOUNTS = [150, 200, 250, 350, 500, 750] as const;

export interface FastingProtocol {
  id: string;
  label: string;
  fastHours: number;
  eatHours: number;
  requiresMedicalDisclaimer: boolean;
  description: string;
}

export const FASTING_PROTOCOLS: FastingProtocol[] = [
  {
    id: '16_8',
    label: '16:8',
    fastHours: 16,
    eatHours: 8,
    requiresMedicalDisclaimer: false,
    description: '16 horas de ayuno, 8 de ventana de comida.',
  },
  {
    id: '18_6',
    label: '18:6',
    fastHours: 18,
    eatHours: 6,
    requiresMedicalDisclaimer: false,
    description: '18 horas de ayuno, 6 de ventana.',
  },
  {
    id: '20_4',
    label: '20:4',
    fastHours: 20,
    eatHours: 4,
    requiresMedicalDisclaimer: true,
    description: '20 horas de ayuno, 4 de ventana.',
  },
  {
    id: 'omad',
    label: 'OMAD',
    fastHours: 23,
    eatHours: 1,
    requiresMedicalDisclaimer: true,
    description: 'Una sola comida al día.',
  },
  {
    id: '24h',
    label: '24 horas',
    fastHours: 24,
    eatHours: 0,
    requiresMedicalDisclaimer: true,
    description: 'Ayuno completo de 24 horas.',
  },
  {
    id: '5_2',
    label: '5:2',
    fastHours: 0,
    eatHours: 0,
    requiresMedicalDisclaimer: true,
    description: '5 días normal y 2 días de 500 kcal.',
  },
  {
    id: 'custom',
    label: 'Personalizado',
    fastHours: 0,
    eatHours: 0,
    requiresMedicalDisclaimer: false,
    description: 'Defines las horas exactas de tu ventana.',
  },
];

export const MEAL_TYPES = [
  { id: 'breakfast', label: 'Desayuno', emoji: '🌅' },
  { id: 'lunch', label: 'Almuerzo', emoji: '☀️' },
  { id: 'dinner', label: 'Cena', emoji: '🌙' },
  { id: 'snack', label: 'Merienda', emoji: '🍎' },
  { id: 'other', label: 'Otro', emoji: '🍽️' },
] as const;

export const DEFAULT_STEP_GOAL = 10000;
export const STEP_MILESTONE_INTERVAL = 1000;

export const SCORE_WEIGHTS = {
  hydration: 0.2,
  activity: 0.2,
  sleep: 0.25,
  nutrition: 0.15,
  mental: 0.2,
} as const;

export const SCORE_STRESS_CAP_THRESHOLD = 8;
export const SCORE_STRESS_CAP_VALUE = 75;
