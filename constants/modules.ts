// constants/modules.ts — COMPLETO (fusiona modules_additions)

import { Colors } from './colors';

// ─── MÓDULOS PRINCIPALES ─────────────────────────────────────────────────────

export interface ModuleDefinition {
  id: string;
  name: string;
  emoji: string;
  color: string;
  route: string;
  description: string;
}

export const MODULES: ModuleDefinition[] = [
  {
    id:          'water',
    name:        'Hidratación',
    emoji:       '💧',
    color:       Colors.water,
    route:       '/modules/water',
    description: 'Registrá tu consumo diario de líquidos',
  },
  {
    id:          'steps',
    name:        'Pasos y Actividad',
    emoji:       '🚶',
    color:       Colors.steps,
    route:       '/modules/steps',
    description: 'Seguí tus pasos y sesiones de cardio',
  },
  {
    id:          'fasting',
    name:        'Ayuno Intermitente',
    emoji:       '⏳',
    color:       Colors.fasting,
    route:       '/modules/fasting',
    description: 'Controlá tu ventana de ayuno y sus fases',
  },
  {
    id:          'sleep',
    name:        'Sueño',
    emoji:       '😴',
    color:       Colors.sleep,
    route:       '/modules/sleep',
    description: 'Registrá la calidad y duración de tu sueño',
  },
  {
    id:          'nutrition',
    name:        'Nutrición',
    emoji:       '🍎',
    color:       Colors.nutrition,
    route:       '/modules/nutrition',
    description: 'Loggea comidas y seguí tus macros',
  },
  {
    id:          'weight',
    name:        'Peso y Composición',
    emoji:       '⚖️',
    color:       Colors.weight,
    route:       '/modules/weight',
    description: 'Seguí tu peso y progreso corporal',
  },
  {
    id:          'workout',
    name:        'Entrenamientos',
    emoji:       '💪',
    color:       Colors.workout,
    route:       '/modules/workout',
    description: 'Registrá tus sesiones y PRs',
  },
  {
    id:          'mental',
    name:        'Salud Mental',
    emoji:       '🧠',
    color:       Colors.mental,
    route:       '/modules/mental/history',
    description: 'Check-in diario de bienestar emocional',
  },
  {
    id:          'supplements',
    name:        'Suplementos',
    emoji:       '💊',
    color:       Colors.brand,
    route:       '/modules/supplements',
    description: 'Recordatorios y adherencia de suplementos',
  },
  {
    id:          'female',
    name:        'Salud Femenina',
    emoji:       '🌸',
    color:       Colors.female,
    route:       '/modules/female',
    description: 'Ciclo menstrual y adaptaciones por fase',
  },
];

// Type alias for easier imports
export type ModuleId = 'water' | 'steps' | 'fasting' | 'sleep' | 'nutrition' | 'weight' | 'workout' | 'mental' | 'supplements' | 'female';

// Aliases for backward compatibility
export const GridModules: ModuleId[] = MODULES.map(m => m.id as ModuleId);
export const Modules = MODULES;

// ─── TIPOS DE BEBIDA — DRINK_TYPES (fusionado de modules_additions) ──────────

export interface DrinkType {
  id: string;
  label: string;
  emoji: string;
  factor: number; // factor de hidratación
  isAlcohol?: boolean;
}

export const DRINK_TYPES: DrinkType[] = [
  { id: 'water',       label: 'Agua pura',         emoji: '💧',  factor: 1.0  },
  { id: 'electrolyte', label: 'Agua c/ electrolitos', emoji: '⚡', factor: 1.05 },
  { id: 'sports',      label: 'Bebida deportiva',   emoji: '🥤',  factor: 1.0  },
  { id: 'tea',         label: 'Té / Infusión',      emoji: '🍵',  factor: 0.85 },
  { id: 'coffee',      label: 'Café',               emoji: '☕',  factor: 0.75 },
  { id: 'juice',       label: 'Jugo natural',       emoji: '🍊',  factor: 0.90 },
  { id: 'milk',        label: 'Leche',              emoji: '🥛',  factor: 0.90 },
  { id: 'alcohol',     label: 'Alcohol',            emoji: '🍺',  factor: 0.0,  isAlcohol: true },
];

export function getDrinkType(id: string): DrinkType {
  return DRINK_TYPES.find(d => d.id === id) ?? DRINK_TYPES[0];
}

// ─── QUICK LOG AMOUNTS ───────────────────────────────────────────────────────

export const WATER_QUICK_AMOUNTS = [150, 200, 250, 350, 500, 750] as const;

// ─── FASTING PROTOCOLS ───────────────────────────────────────────────────────

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
    id:                       '16_8',
    label:                    '16:8',
    fastHours:                16,
    eatHours:                 8,
    isPremium:                false,
    requiresMedicalDisclaimer: false,
    description:              '16 horas de ayuno, 8 de ventana de comida. El más popular para principiantes.',
  },
  {
    id:                       '18_6',
    label:                    '18:6',
    fastHours:                18,
    eatHours:                 6,
    isPremium:                false,
    requiresMedicalDisclaimer: false,
    description:              '18 horas de ayuno, 6 de ventana. Nivel intermedio.',
  },
  {
    id:                       '20_4',
    label:                    '20:4',
    fastHours:                20,
    eatHours:                 4,
    isPremium:                true,
    requiresMedicalDisclaimer: true,
    description:              '20 horas de ayuno, 4 de ventana. Avanzado.',
  },
  {
    id:                       'omad',
    label:                    'OMAD',
    fastHours:                23,
    eatHours:                 1,
    isPremium:                true,
    requiresMedicalDisclaimer: true,
    description:              'Una sola comida al día. Solo para expertos con experiencia.',
  },
  {
    id:                       '24h',
    label:                    '24 horas',
    fastHours:                24,
    eatHours:                 0,
    isPremium:                true,
    requiresMedicalDisclaimer: true,
    description:              'Ayuno completo de 24 horas. Avanzado.',
  },
  {
    id:                       '5_2',
    label:                    '5:2',
    fastHours:                0, // especial — 2 días de 500kcal
    eatHours:                 0,
    isPremium:                true,
    requiresMedicalDisclaimer: true,
    description:              '5 días normal + 2 días de 500kcal. Protocolo flexible.',
  },
  {
    id:                       'custom',
    label:                    'Personalizado',
    fastHours:                0,
    eatHours:                 0,
    isPremium:                true,
    requiresMedicalDisclaimer: false,
    description:              'Definís vos las horas exactas de tu ventana de ayuno.',
  },
];

// ─── MEAL TYPES ──────────────────────────────────────────────────────────────

export const MEAL_TYPES = [
  { id: 'breakfast', label: 'Desayuno',  emoji: '🌅' },
  { id: 'lunch',     label: 'Almuerzo',  emoji: '☀️' },
  { id: 'dinner',    label: 'Cena',      emoji: '🌙' },
  { id: 'snack',     label: 'Merienda',  emoji: '🍎' },
  { id: 'other',     label: 'Otro',      emoji: '🍽️' },
] as const;

// ─── STEP GOALS ──────────────────────────────────────────────────────────────

export const DEFAULT_STEP_GOAL = 10000;
export const STEP_MILESTONE_INTERVAL = 1000; // cada 1.000 pasos → animación

// ─── SCORE WEIGHTS ───────────────────────────────────────────────────────────

export const SCORE_WEIGHTS = {
  hydration: 0.20,
  activity:  0.20,
  sleep:     0.25,
  nutrition: 0.15,
  mental:    0.20,
} as const;

export const SCORE_STRESS_CAP_THRESHOLD = 8; // si stress >= 8 → cap 75
export const SCORE_STRESS_CAP_VALUE     = 75;