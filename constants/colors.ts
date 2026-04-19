const ACTION_RGB = [255, 69, 0] as const;

const MODULE_RGB = {
  workout: [255, 85, 51],
  nutrition: [31, 203, 112],
  water: [6, 182, 212],
  sleep: [139, 92, 246],
  steps: [132, 204, 22],
  weight: [144, 144, 160],
  fasting: [245, 158, 11],
  recovery: [144, 144, 160],
  mental: [144, 144, 160],
  supplements: [144, 144, 160],
  female: [192, 132, 252],
} as const;

type ModuleRgbKey = keyof typeof MODULE_RGB;

function rgbToString(rgb: readonly number[]) {
  return rgb.join(',');
}

export function withOpacity(hex: string, opacity: number): string {
  const safeOpacity = Math.max(0, Math.min(1, opacity));
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return hex;
  const value = Number.parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r},${g},${b},${safeOpacity})`;
}

export const Colors = {
  action: '#FF4500',
  actionPressed: '#CC3700',
  actionDim: '#CC3700',
  actionBg: 'rgba(255,69,0,0.10)',
  actionBorder: 'rgba(255,69,0,0.25)',
  actionGlow: 'rgba(255,69,0,0.06)',

  base: '#09090B',
  surface: '#111115',
  elevated: '#18181D',
  overlaySurface: '#1E1E25',
  overlaySurface2: '#26262E',

  bgBase: '#09090B',
  bgPrimary: '#09090B',
  bgPrimarySoft: '#111115',
  bgSurface: '#111115',
  bgElevated: '#18181D',
  bgOverlay: '#1E1E25',
  bgOverlay2: '#26262E',
  bgFloating: '#1E1E25',

  surface1: '#111115',
  surface2: '#18181D',
  surface3: '#1E1E25',

  border: 'rgba(255,255,255,0.06)',
  border2: 'rgba(255,255,255,0.10)',
  borderSubtle: 'rgba(255,255,255,0.06)',
  borderStrong: 'rgba(255,255,255,0.14)',
  divider: 'rgba(255,255,255,0.06)',
  borderFocus: 'rgba(255,69,0,0.32)',

  textPrimary: '#F0F0F3',
  textSecondary: '#9090A0',
  textMuted: '#55555F',
  textDisabled: '#32323A',

  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#9090A0',

  successBg: 'rgba(34,197,94,0.12)',
  errorBg: 'rgba(239,68,68,0.12)',
  warningBg: 'rgba(245,158,11,0.12)',
  infoBg: 'rgba(144,144,160,0.12)',

  brand: '#FF4500',
  brandDark: '#CC3700',
  brandLight: '#FF7A45',

  overlay: 'rgba(9,9,11,0.88)',
  overlayLight: 'rgba(17,17,21,0.76)',
  glass: 'rgba(17,17,21,0.92)',
  glassLight: 'rgba(24,24,29,0.84)',

  workout: '#FF5533',
  workoutDark: '#E04A2B',
  workoutBg: 'rgba(255,85,51,0.10)',
  nutrition: '#1FCB70',
  nutritionDark: '#19A55A',
  nutritionBg: 'rgba(31,203,112,0.10)',
  water: '#06B6D4',
  waterDark: '#0891B2',
  waterBg: 'rgba(6,182,212,0.10)',
  sleep: '#8B5CF6',
  sleepDark: '#7C3AED',
  sleepBg: 'rgba(139,92,246,0.10)',
  steps: '#84CC16',
  stepsDark: '#65A30D',
  stepsBg: 'rgba(132,204,22,0.10)',
  weight: '#9090A0',
  weightDark: '#737380',
  weightBg: 'rgba(144,144,160,0.10)',
  fasting: '#F59E0B',
  fastingDark: '#D97706',
  fastingBg: 'rgba(245,158,11,0.10)',
  recovery: '#9090A0',
  recoveryDark: '#737380',
  recoveryBg: 'rgba(144,144,160,0.10)',
  mental: '#9090A0',
  mentalDark: '#737380',
  mentalBg: 'rgba(144,144,160,0.10)',
  supplements: '#9090A0',
  supplementsDark: '#737380',
  supplementsBg: 'rgba(144,144,160,0.10)',
  female: '#C084FC',
  femaleDark: '#A855F7',
  femaleBg: 'rgba(192,132,252,0.10)',

  premium: '#F0F0F3',
  premiumBg: 'rgba(255,255,255,0.06)',

  rarityCommon: '#A1A1AA',
  rarityRare: '#A1A1AA',
  rarityEpic: '#A1A1AA',
  rarityLegendary: '#A1A1AA',

  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',

  gradients: {
    brand: ['#FF4500', '#CC3700'] as const,
    brandLight: ['#FF7A45', '#FF4500'] as const,
    premium: ['#1E1E25', '#111115'] as const,
    water: ['#06B6D4', '#0891B2'] as const,
    steps: ['#84CC16', '#65A30D'] as const,
    fasting: ['#F59E0B', '#D97706'] as const,
    sleep: ['#8B5CF6', '#7C3AED'] as const,
    nutrition: ['#1FCB70', '#19A55A'] as const,
    weight: ['#9090A0', '#737380'] as const,
    workout: ['#FF5533', '#E04A2B'] as const,
    mental: ['#9090A0', '#737380'] as const,
    female: ['#C084FC', '#A855F7'] as const,
    surface: ['#1E1E25', '#111115'] as const,
    dark: ['#111115', '#09090B'] as const,
  },
} as const;

export type ColorKey = keyof typeof Colors;
export type ModuleColor =
  | 'female'
  | 'fasting'
  | 'mental'
  | 'nutrition'
  | 'recovery'
  | 'sleep'
  | 'steps'
  | 'supplements'
  | 'water'
  | 'weight'
  | 'workout';

export function getModuleColor(module: ModuleColor, focusMode = false): string {
  if (focusMode) return Colors.action;
  return Colors[module];
}

export function getModuleRgb(module: ModuleColor, focusMode = false): readonly number[] {
  if (focusMode) return ACTION_RGB;
  return MODULE_RGB[module as ModuleRgbKey] ?? MODULE_RGB.workout;
}

export function getModuleBg(module: ModuleColor, opacity = 0.12, focusMode = false): string {
  return withOpacity(getModuleColor(module, focusMode), opacity);
}

export function getModuleGlow(module: ModuleColor, opacity = 0.18, focusMode = false): string {
  return withOpacity(getModuleColor(module, focusMode), opacity);
}

export function getModuleRgbString(module: ModuleColor, focusMode = false): string {
  return rgbToString(getModuleRgb(module, focusMode));
}
