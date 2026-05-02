import { Appearance, type ColorSchemeName } from 'react-native';

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
  supplements: [100, 116, 139],
  female: [192, 132, 252],
} as const;

type ModuleRgbKey = keyof typeof MODULE_RGB;
export type AppColorScheme = 'dark' | 'light';

function rgbToString(rgb: readonly number[]) {
  return rgb.join(',');
}

function pair(left: string, right: string): [string, string] {
  return [left, right];
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

function buildPalette(scheme: AppColorScheme) {
  const isLight = scheme === 'light';

  return {
    action: '#FF4500',
    actionPressed: '#CC3700',
    actionDim: '#CC3700',
    actionBg: withOpacity('#FF4500', isLight ? 0.12 : 0.1),
    actionBorder: withOpacity('#FF4500', isLight ? 0.28 : 0.25),
    actionGlow: withOpacity('#FF4500', isLight ? 0.16 : 0.12),
    actionPulse: withOpacity('#FF4500', isLight ? 0.24 : 0.2),

    base: isLight ? '#F3F5F8' : '#07070A',
    surface: isLight ? '#FFFFFF' : '#111115',
    elevated: isLight ? '#F8FAFC' : '#18181D',
    overlaySurface: isLight ? '#EEF2F6' : '#1E1E25',
    overlaySurface2: isLight ? '#E4E9F0' : '#26262E',
    glassSurface: isLight ? 'rgba(255,255,255,0.78)' : 'rgba(18,18,23,0.75)',

    bgBase: isLight ? '#F3F5F8' : '#07070A',
    bgPrimary: isLight ? '#F3F5F8' : '#07070A',
    bgPrimarySoft: isLight ? '#FFFFFF' : '#111115',
    bgSurface: isLight ? '#FFFFFF' : '#111115',
    bgElevated: isLight ? '#F8FAFC' : '#18181D',
    bgOverlay: isLight ? '#EEF2F6' : '#1E1E25',
    bgOverlay2: isLight ? '#E4E9F0' : '#26262E',
    bgFloating: isLight ? '#FFFFFF' : '#1E1E25',
    bgGlass: isLight ? 'rgba(255,255,255,0.78)' : 'rgba(18,18,23,0.75)',

    surface1: isLight ? '#FFFFFF' : '#111115',
    surface2: isLight ? '#F8FAFC' : '#18181D',
    surface3: isLight ? '#EEF2F6' : '#1E1E25',

    border: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.06)',
    border2: isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.10)',
    borderSubtle: isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.06)',
    borderStrong: isLight ? 'rgba(15,23,42,0.16)' : 'rgba(255,255,255,0.14)',
    divider: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.06)',
    borderFocus: withOpacity('#FF4500', isLight ? 0.36 : 0.32),

    textPrimary: isLight ? '#111827' : '#F0F0F3',
    textSecondary: isLight ? '#475569' : '#9090A0',
    textMuted: isLight ? '#64748B' : '#55555F',
    textDisabled: isLight ? '#94A3B8' : '#32323A',

    success: isLight ? '#0D9F6E' : '#00E87A',
    error: isLight ? '#DC2626' : '#EF4444',
    warning: isLight ? '#D97706' : '#F59E0B',
    info: isLight ? '#0F766E' : '#9090A0',
    excellent: isLight ? '#0284C7' : '#38BDF8',

    successBg: isLight ? withOpacity('#0D9F6E', 0.12) : 'rgba(0,232,122,0.12)',
    successDim: isLight ? withOpacity('#0D9F6E', 0.1) : 'rgba(0,232,122,0.10)',
    errorBg: isLight ? withOpacity('#DC2626', 0.12) : 'rgba(239,68,68,0.12)',
    warningBg: isLight ? withOpacity('#D97706', 0.12) : 'rgba(245,158,11,0.12)',
    infoBg: isLight ? withOpacity('#0F766E', 0.1) : 'rgba(144,144,160,0.12)',

    brand: '#FF4500',
    brandDark: '#CC3700',
    brandLight: isLight ? '#FF8E66' : '#FF7A45',

    overlay: isLight ? 'rgba(15,23,42,0.22)' : 'rgba(7,7,10,0.88)',
    overlayLight: isLight ? 'rgba(255,255,255,0.76)' : 'rgba(17,17,21,0.76)',
    glass: isLight ? 'rgba(255,255,255,0.78)' : 'rgba(18,18,23,0.75)',
    glassLight: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(24,24,29,0.84)',

    workout: '#FF5533',
    workoutDark: '#E04A2B',
    workoutBg: withOpacity('#FF5533', isLight ? 0.12 : 0.1),
    nutrition: '#1FCB70',
    nutritionDark: '#19A55A',
    nutritionBg: withOpacity('#1FCB70', isLight ? 0.12 : 0.1),
    water: '#06B6D4',
    waterDark: '#0891B2',
    waterBg: withOpacity('#06B6D4', isLight ? 0.12 : 0.1),
    sleep: '#7C3AED',
    sleepDark: '#6D28D9',
    sleepBg: withOpacity('#7C3AED', isLight ? 0.12 : 0.1),
    steps: '#84CC16',
    stepsDark: '#65A30D',
    stepsBg: withOpacity('#84CC16', isLight ? 0.12 : 0.1),
    weight: '#9090A0',
    weightDark: '#737380',
    weightBg: withOpacity('#9090A0', isLight ? 0.12 : 0.1),
    fasting: '#F59E0B',
    fastingDark: '#D97706',
    fastingBg: withOpacity('#F59E0B', isLight ? 0.12 : 0.1),
    recovery: '#9090A0',
    recoveryDark: '#737380',
    recoveryBg: withOpacity('#9090A0', isLight ? 0.12 : 0.1),
    mental: '#9090A0',
    mentalDark: '#737380',
    mentalBg: withOpacity('#9090A0', isLight ? 0.12 : 0.1),
    supplements: '#64748B',
    supplementsDark: '#475569',
    supplementsBg: withOpacity('#64748B', isLight ? 0.12 : 0.1),
    female: '#C084FC',
    femaleDark: '#A855F7',
    femaleBg: withOpacity('#C084FC', isLight ? 0.12 : 0.1),

    premium: isLight ? '#111827' : '#F0F0F3',
    premiumBg: isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.06)',

    rarityCommon: '#A1A1AA',
    rarityRare: '#0EA5E9',
    rarityEpic: '#8B5CF6',
    rarityLegendary: '#F59E0B',

    transparent: 'transparent',
    white: '#FFFFFF',
    black: '#000000',

    gradients: {
      brand: pair('#FF4500', '#CC3700'),
      brandLight: pair(isLight ? '#FF9A73' : '#FF7A45', '#FF4500'),
      premium: isLight ? pair('#FFFFFF', '#EEF2F6') : pair('#1E1E25', '#111115'),
      water: pair('#06B6D4', '#0891B2'),
      steps: pair('#84CC16', '#65A30D'),
      fasting: pair('#F59E0B', '#D97706'),
      sleep: pair('#8B5CF6', '#7C3AED'),
      nutrition: pair('#1FCB70', '#19A55A'),
      weight: pair('#9090A0', '#737380'),
      workout: pair('#FF5533', '#E04A2B'),
      mental: pair('#9090A0', '#737380'),
      female: pair('#C084FC', '#A855F7'),
      surface: isLight ? pair('#FFFFFF', '#F3F5F8') : pair('#1E1E25', '#111115'),
      dark: isLight ? pair('#FFFFFF', '#EEF2F6') : pair('#111115', '#07070A'),
    },
  };
}

type ThemePalette = ReturnType<typeof buildPalette>;

function clonePalette(palette: ThemePalette): ThemePalette {
  return {
    ...palette,
    gradients: { ...palette.gradients },
  };
}

function getDefaultScheme(): AppColorScheme {
  return Appearance.getColorScheme() === 'light' ? 'light' : 'dark';
}

let currentColorScheme: AppColorScheme = getDefaultScheme();

export const Colors: ThemePalette = clonePalette(buildPalette(currentColorScheme));

export function resolveColorSchemePreference(
  preference: 'dark' | 'light' | 'system',
  systemColorScheme?: ColorSchemeName | null,
): AppColorScheme {
  if (preference === 'dark' || preference === 'light') return preference;
  return systemColorScheme === 'light' ? 'light' : 'dark';
}

export function applyRuntimeColorScheme(scheme: AppColorScheme) {
  currentColorScheme = scheme;
  const next = clonePalette(buildPalette(scheme));
  Object.assign(Colors, next);
}

export function getRuntimeColorScheme() {
  return currentColorScheme;
}

export type ColorKey = keyof ThemePalette;
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
