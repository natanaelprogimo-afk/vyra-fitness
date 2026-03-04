// ============================================================
// VYRA FITNESS — Color System
// Usar SIEMPRE estas constantes. Nunca hardcodear colores.
// ============================================================

export const Colors = {
  // ─── Backgrounds ─────────────────────────────────────────
  bgPrimary:  '#0F0A1E',   // Fondo principal de pantallas
  bgSurface:  '#1A1033',   // Cards, modales, bottom sheets
  bgElevated: '#241648',   // Cards elevadas, dropdowns, tooltips

  // ─── Text ────────────────────────────────────────────────
  textPrimary:   '#FFFFFF',
  textSecondary: '#A09CB8',
  textMuted:     '#5C5478',

  // ─── Brand ───────────────────────────────────────────────
  brand:     '#7C3AED',
  brandDark: '#5B21B6',
  brandLight: '#9F67FF',

  // ─── Borders & Dividers ──────────────────────────────────
  border:        'rgba(255,255,255,0.08)',
  borderFocus:   'rgba(124,58,237,0.6)',
  divider:       'rgba(255,255,255,0.05)',

  // ─── Módulos de salud ────────────────────────────────────
  water:     '#06B6D4',
  waterDark: '#0891B2',
  waterBg:   'rgba(6,182,212,0.12)',

  steps:     '#10B981',
  stepsDark: '#059669',
  stepsBg:   'rgba(16,185,129,0.12)',

  fasting:     '#F59E0B',
  fastingDark: '#D97706',
  fastingBg:   'rgba(245,158,11,0.12)',

  sleep:     '#6366F1',
  sleepDark: '#4F46E5',
  sleepBg:   'rgba(99,102,241,0.12)',

  nutrition:     '#EC4899',
  nutritionDark: '#DB2777',
  nutritionBg:   'rgba(236,72,153,0.12)',

  weight:     '#8B5CF6',
  weightDark: '#7C3AED',
  weightBg:   'rgba(139,92,246,0.12)',

  workout:     '#EF4444',
  workoutDark: '#DC2626',
  workoutBg:   'rgba(239,68,68,0.12)',

  mental:     '#818CF8',
  mentalDark: '#6366F1',
  mentalBg:   'rgba(129,140,248,0.12)',

  female:     '#F472B6',
  femaleDark: '#EC4899',
  femaleBg:   'rgba(244,114,182,0.12)',

  recovery:     '#34D399',
  recoveryDark: '#10B981',
  recoveryBg:   'rgba(52,211,153,0.12)',

  supplements:     '#A78BFA',
  supplementsDark: '#7C3AED',
  supplementsBg:   'rgba(167,139,250,0.12)',

  // ─── Sistema ─────────────────────────────────────────────
  success:     '#10B981',
  successBg:   'rgba(16,185,129,0.15)',
  error:       '#EF4444',
  errorBg:     'rgba(239,68,68,0.15)',
  warning:     '#F59E0B',
  warningBg:   'rgba(245,158,11,0.15)',
  info:        '#06B6D4',
  infoBg:      'rgba(6,182,212,0.15)',

  // ─── Gamificación ────────────────────────────────────────
  coins:      '#F59E0B',
  coinsBg:    'rgba(245,158,11,0.15)',
  premium:    '#D97706',
  premiumBg:  'rgba(217,119,6,0.15)',
  xp:         '#A78BFA',

  // ─── Rareza de badges ────────────────────────────────────
  rarityCommon:    '#9CA3AF',
  rarityRare:      '#60A5FA',
  rarityEpic:      '#A78BFA',
  rarityLegendary: '#F59E0B',

  // ─── Utilidades ──────────────────────────────────────────
  transparent: 'transparent',
  overlay:     'rgba(0,0,0,0.6)',
  overlayLight:'rgba(15,10,30,0.85)',
  white:       '#FFFFFF',
  black:       '#000000',

  // ─── Gradientes (usar como arrays en LinearGradient) ─────
  gradients: {
    brand:      ['#7C3AED', '#5B21B6'] as const,
    brandLight: ['#9F67FF', '#7C3AED'] as const,
    water:      ['#06B6D4', '#0891B2'] as const,
    steps:      ['#10B981', '#059669'] as const,
    fasting:    ['#F59E0B', '#D97706'] as const,
    sleep:      ['#6366F1', '#4F46E5'] as const,
    nutrition:  ['#EC4899', '#DB2777'] as const,
    weight:     ['#8B5CF6', '#7C3AED'] as const,
    workout:    ['#EF4444', '#DC2626'] as const,
    mental:     ['#818CF8', '#6366F1'] as const,
    female:     ['#F472B6', '#EC4899'] as const,
    premium:    ['#F59E0B', '#D97706'] as const,
    dark:       ['#1A1033', '#0F0A1E'] as const,
    surface:    ['#241648', '#1A1033'] as const,
  },
} as const;

// Tipo derivado para type safety
export type ColorKey = keyof typeof Colors;
export type ModuleColor = 'water' | 'steps' | 'fasting' | 'sleep' | 'nutrition' | 'weight' | 'workout' | 'mental' | 'female' | 'recovery' | 'supplements';

// Helper: obtener color de módulo por nombre
export function getModuleColor(module: ModuleColor): string {
  return Colors[module];
}

// Helper: obtener color de fondo de módulo
export function getModuleBg(module: ModuleColor): string {
  return Colors[`${module}Bg` as keyof typeof Colors] as string;
}