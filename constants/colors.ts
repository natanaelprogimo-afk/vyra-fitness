// ============================================================
// VYRA FITNESS - Design Tokens 2026
// Paleta AMOLED oscura + acentos por modulo.
// ============================================================

const MODULE_RGB = {
  workout: [139, 92, 255],
  nutrition: [0, 214, 138],
  water: [0, 153, 238],
  sleep: [112, 117, 255],
  steps: [232, 156, 0],
  weight: [217, 62, 140],
  fasting: [240, 90, 36],
  recovery: [5, 150, 105],
  mental: [179, 156, 255],
  supplements: [240, 193, 75],
  female: [224, 101, 163],
  coach: [34, 167, 240],
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
  // Base
  bgBase: '#070B14',
  surface1: '#0F1726',
  surface2: '#131E31',
  surface3: '#18253B',
  borderSubtle: '#24324A',
  borderStrong: '#3F577A',

  // Backwards-compatible aliases
  bgPrimary: '#070B14',
  bgPrimarySoft: '#0F1726',
  bgSurface: '#0F1726',
  bgElevated: '#131E31',
  bgFloating: '#131E31',
  border: '#24324A',
  divider: '#24324A',

  // Text
  textPrimary: '#F6F9FF',
  textSecondary: '#AAB8CF',
  textMuted: '#7F8DA5',
  textDisabled: '#5B6880',

  // Brand
  brand: '#7B6DFF',
  brandDark: '#6556F2',
  brandLight: '#AEA7FF',
  borderFocus: 'rgba(123,109,255,0.35)',

  // Overlays / glass
  overlay: 'rgba(7,11,20,0.84)',
  overlayLight: 'rgba(19,30,49,0.68)',
  glass: 'rgba(15,23,38,0.78)',
  glassLight: 'rgba(19,30,49,0.62)',

  // Modules
  workout: '#8D7BFF',
  workoutDark: '#6A58E8',
  workoutBg: 'rgba(141,123,255,0.18)',
  nutrition: '#00D68A',
  nutritionDark: '#00B977',
  nutritionBg: 'rgba(0,214,138,0.18)',
  water: '#36B7FF',
  waterDark: '#1496E7',
  waterBg: 'rgba(54,183,255,0.18)',
  sleep: '#8C92FF',
  sleepDark: '#6A72ED',
  sleepBg: 'rgba(140,146,255,0.18)',
  steps: '#E89C00',
  stepsDark: '#C88400',
  stepsBg: 'rgba(232,156,0,0.18)',
  weight: '#EC6AA9',
  weightDark: '#CF4D8E',
  weightBg: 'rgba(236,106,169,0.18)',
  fasting: '#F05A24',
  fastingDark: '#D94B18',
  fastingBg: 'rgba(240,90,36,0.18)',
  recovery: '#23C38A',
  recoveryDark: '#13A26F',
  recoveryBg: 'rgba(35,195,138,0.18)',
  mental: '#C6B6FF',
  mentalDark: '#AA95F7',
  mentalBg: 'rgba(198,182,255,0.18)',
  supplements: '#F0C14B',
  supplementsDark: '#D4A731',
  supplementsBg: 'rgba(240,193,75,0.18)',
  female: '#F18FC0',
  femaleDark: '#D86CA4',
  femaleBg: 'rgba(241,143,192,0.18)',
  coach: '#5ABEFF',
  coachDark: '#2A9DE9',
  coachBg: 'rgba(90,190,255,0.18)',

  // System
  success: '#22C55E',
  successBg: 'rgba(34,197,94,0.18)',
  error: '#EF4444',
  errorBg: 'rgba(239,68,68,0.18)',
  warning: '#F59E0B',
  warningBg: 'rgba(245,158,11,0.18)',
  info: '#38BDF8',
  infoBg: 'rgba(56,189,248,0.18)',

  // Gamification / premium
  coins: '#FFCE54',
  coinsBg: 'rgba(255,206,84,0.18)',
  premium: '#5ABEFF',
  premiumBg: 'rgba(90,190,255,0.18)',
  xp: '#B1A2FF',

  // Rarity
  rarityCommon: '#8892A3',
  rarityRare: '#22A7F0',
  rarityEpic: '#B39CFF',
  rarityLegendary: '#F0C14B',

  // Utilities
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',

  gradients: {
    brand: ['#9487FF', '#6556F2'] as const,
    brandLight: ['#C2BBFF', '#7B6DFF'] as const,
    premium: ['#7B6DFF', '#5ABEFF'] as const,
    water: ['#78D3FF', '#1496E7'] as const,
    steps: ['#F4B942', '#E89C00'] as const,
    fasting: ['#FF8A5C', '#F05A24'] as const,
    sleep: ['#B8BCFF', '#6A72ED'] as const,
    nutrition: ['#3DE0A3', '#00D68A'] as const,
    weight: ['#F39BC2', '#CF4D8E'] as const,
    workout: ['#B8AFFF', '#7B6DFF'] as const,
    mental: ['#E1D7FF', '#AA95F7'] as const,
    female: ['#F7B5D7', '#D86CA4'] as const,
    coach: ['#8FD8FF', '#2A9DE9'] as const,
    surface: ['#18253B', '#0F1726'] as const,
    dark: ['#131E31', '#070B14'] as const,
  },
} as const;

export type ColorKey = keyof typeof Colors;
export type ModuleColor =
  | 'coach'
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
  if (focusMode) return Colors.brand;
  return Colors[module];
}

export function getModuleRgb(module: ModuleColor, focusMode = false): readonly number[] {
  if (focusMode) return MODULE_RGB.workout;
  return MODULE_RGB[module as ModuleRgbKey] ?? MODULE_RGB.workout;
}

export function getModuleBg(module: ModuleColor, opacity = 0.18, focusMode = false): string {
  return withOpacity(getModuleColor(module, focusMode), opacity);
}

export function getModuleGlow(module: ModuleColor, opacity = 0.35, focusMode = false): string {
  return withOpacity(getModuleColor(module, focusMode), opacity);
}

export function getModuleRgbString(module: ModuleColor, focusMode = false): string {
  return rgbToString(getModuleRgb(module, focusMode));
}
