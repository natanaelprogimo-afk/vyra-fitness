import { Colors } from './colors';

export interface ModuleDefinition {
  id: string;
  name: string;
  shortName?: string;
  emoji: string;
  color: string;
  route: string;
  description: string;
}

// Weight and mental still exist as cross-module data, but they are no longer
// part of the navigable module grid.
export const MODULES: ModuleDefinition[] = [
  {
    id: 'water',
    name: 'Agua',
    shortName: 'Agua',
    emoji: '💧',
    color: Colors.water,
    route: '/modules/water',
    description: 'Registra tu consumo diario de líquidos',
  },
  {
    id: 'steps',
    name: 'Pasos',
    shortName: 'Pasos',
    emoji: '👟',
    color: Colors.steps,
    route: '/modules/steps',
    description: 'Sigue tus pasos y caminatas del día',
  },
  {
    id: 'fasting',
    name: 'Ayuno',
    shortName: 'Ayuno',
    emoji: '⏳',
    color: Colors.fasting,
    route: '/modules/fasting',
    description: 'Controla tu ventana de ayuno y su progreso',
  },
  {
    id: 'sleep',
    name: 'Sueño',
    shortName: 'Sueño',
    emoji: '😴',
    color: Colors.sleep,
    route: '/modules/sleep',
    description: 'Registra la calidad y duración de tu sueño',
  },
  {
    id: 'nutrition',
    name: 'Nutrición',
    shortName: 'Nutri',
    emoji: '🍎',
    color: Colors.nutrition,
    route: '/modules/nutrition',
    description: 'Registra comidas y sigue tus macros',
  },
  {
    id: 'workout',
    name: 'Entreno',
    shortName: 'Entreno',
    emoji: '💪',
    color: Colors.workout,
    route: '/modules/workout',
    description: 'Registra tus sesiones y PRs',
  },
  {
    id: 'supplements',
    name: 'Suplementos',
    shortName: 'Suples',
    emoji: '💊',
    color: Colors.brand,
    route: '/modules/supplements',
    description: 'Recordatorios y adherencia de suplementos',
  },
  {
    id: 'female',
    name: 'Ciclo',
    shortName: 'Ciclo',
    emoji: '🌸',
    color: Colors.female,
    route: '/modules/female',
    description: 'Ciclo menstrual y adaptaciones por fase',
  },
];

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

export const GridModules: ModuleId[] = MODULES.map((module) => module.id as ModuleId);
export const Modules = MODULES;

export interface DrinkType {
  id: string;
  label: string;
  emoji: string;
  factor: number;
  isAlcohol?: boolean;
}

export const DRINK_TYPES: DrinkType[] = [
  { id: 'water', label: 'Agua pura', emoji: '💧', factor: 1.0 },
  { id: 'electrolyte', label: 'Agua c/ electrolitos', emoji: '⚡', factor: 1.05 },
  { id: 'sports', label: 'Bebida deportiva', emoji: '🥤', factor: 1.0 },
  { id: 'tea', label: 'Té / infusión', emoji: '🍵', factor: 0.85 },
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
  isPremium: boolean;
  requiresMedicalDisclaimer: boolean;
  description: string;
}

export const FASTING_PROTOCOLS: FastingProtocol[] = [
  {
    id: '16_8',
    label: '16:8',
    fastHours: 16,
    eatHours: 8,
    isPremium: false,
    requiresMedicalDisclaimer: false,
    description: '16 horas de ayuno, 8 de ventana de comida.',
  },
  {
    id: '18_6',
    label: '18:6',
    fastHours: 18,
    eatHours: 6,
    isPremium: false,
    requiresMedicalDisclaimer: false,
    description: '18 horas de ayuno, 6 de ventana.',
  },
  {
    id: '20_4',
    label: '20:4',
    fastHours: 20,
    eatHours: 4,
    isPremium: true,
    requiresMedicalDisclaimer: true,
    description: '20 horas de ayuno, 4 de ventana.',
  },
  {
    id: 'omad',
    label: 'OMAD',
    fastHours: 23,
    eatHours: 1,
    isPremium: true,
    requiresMedicalDisclaimer: true,
    description: 'Una sola comida al día.',
  },
  {
    id: '24h',
    label: '24 horas',
    fastHours: 24,
    eatHours: 0,
    isPremium: true,
    requiresMedicalDisclaimer: true,
    description: 'Ayuno completo de 24 horas.',
  },
  {
    id: '5_2',
    label: '5:2',
    fastHours: 0,
    eatHours: 0,
    isPremium: true,
    requiresMedicalDisclaimer: true,
    description: '5 días normal + 2 días de 500 kcal.',
  },
  {
    id: 'custom',
    label: 'Personalizado',
    fastHours: 0,
    eatHours: 0,
    isPremium: true,
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
