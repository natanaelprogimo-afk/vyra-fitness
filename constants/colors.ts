// REDESIGNED: 2026-05-20 - palette aligns with VYRA exhaustive redesign system
import { Appearance, type ColorSchemeName } from 'react-native';

const ACTION_RGB = [255, 255, 255] as const;

const MODULE_COLORS = {
  workout: { main: '#00D4FF', dark: '#0099B8' },
  nutrition: { main: '#FF6B35', dark: '#D95522' },
  water: { main: '#00B4D8', dark: '#007F98' },
  sleep: { main: '#7B61FF', dark: '#5D44E0' },
  steps: { main: '#30D158', dark: '#1E9E40' },
  weight: { main: '#FFFFFF', dark: '#D0D0D6' },
  fasting: { main: '#FF9500', dark: '#CC7400' },
  recovery: { main: '#FFFFFF', dark: '#D0D0D6' },
  mental: { main: '#007AFF', dark: '#005CCC' },
  supplements: { main: '#BF5AF2', dark: '#9442C6' },
  female: { main: '#FF375F', dark: '#D62A4B' },
} as const;

type ModuleKey = keyof typeof MODULE_COLORS;
export type AppColorScheme = 'dark' | 'light' | 'midnight' | 'pastel' | 'forest' | 'ocean' | 'sunset';

function pair(left: string, right: string): [string, string] {
  return [left, right];
}

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

function buildPalette(scheme: AppColorScheme) {
  const isLight = scheme === 'light';
  const isMidnight = scheme === 'midnight';
  const isPastel = scheme === 'pastel';
  const isForest = scheme === 'forest';
  const isOcean = scheme === 'ocean';
  const isSunset = scheme === 'sunset';

  // Define color palettes for each theme
  let base: string;
  let surface1: string;
  let surface2: string;
  let surface3: string;
  let surface4: string;
  let textPrimary: string;
  let textSecondary: string;
  let textTertiary: string;
  let textDisabled: string;
  let borderStrong: string;
  let borderSubtle: string;
  let borderFocus: string;

  if (isLight) {
    base = '#F5F6FA';
    surface1 = '#FFFFFF';
    surface2 = '#F1F3F9';
    surface3 = '#E9EDF5';
    surface4 = '#E1E6F0';
    textPrimary = '#141419';
    textSecondary = 'rgba(20,20,25,0.70)';
    textTertiary = 'rgba(20,20,25,0.45)';
    textDisabled = 'rgba(20,20,25,0.25)';
    borderStrong = 'rgba(20,20,25,0.12)';
    borderSubtle = 'rgba(20,20,25,0.06)';
    borderFocus = 'rgba(20,20,25,0.22)';
  } else if (isMidnight) {
    // Midnight: Oscuro profundo con acentos azules fríos, optimizado para menos fatiga ocular
    base = '#111111';
    surface1 = '#1A1A1F';
    surface2 = '#222229';
    surface3 = '#2A2A33';
    surface4 = '#32323E';
    textPrimary = '#F0F0F6';
    textSecondary = 'rgba(240,240,246,0.75)';
    textTertiary = 'rgba(240,240,246,0.50)';
    textDisabled = 'rgba(240,240,246,0.30)';
    borderStrong = 'rgba(100,200,255,0.15)';
    borderSubtle = 'rgba(100,200,255,0.06)';
    borderFocus = 'rgba(100,200,255,0.40)';
  } else if (isPastel) {
    // Pastel: Colores suaves y relajantes
    base = '#FBF9F6';
    surface1 = '#FFFDF9';
    surface2 = '#F5F2ED';
    surface3 = '#EDE8E0';
    surface4 = '#E5DED4';
    textPrimary = '#4A4644';
    textSecondary = 'rgba(74,70,68,0.75)';
    textTertiary = 'rgba(74,70,68,0.50)';
    textDisabled = 'rgba(74,70,68,0.30)';
    borderStrong = 'rgba(200,180,160,0.20)';
    borderSubtle = 'rgba(200,180,160,0.08)';
    borderFocus = 'rgba(200,180,160,0.35)';
  } else if (isForest) {
    // Forest: Verdes naturales y tonos tierra
    base = '#0F1610';
    surface1 = '#1A2219';
    surface2 = '#233024';
    surface3 = '#2C3E2F';
    surface4 = '#354C38';
    textPrimary = '#E8F0E5';
    textSecondary = 'rgba(232,240,229,0.75)';
    textTertiary = 'rgba(232,240,229,0.50)';
    textDisabled = 'rgba(232,240,229,0.30)';
    borderStrong = 'rgba(100,180,120,0.15)';
    borderSubtle = 'rgba(100,180,120,0.06)';
    borderFocus = 'rgba(100,180,120,0.40)';
  } else if (isOcean) {
    // Ocean: Azules profundos como el océano
    base = '#0A1420';
    surface1 = '#132338';
    surface2 = '#1C3454';
    surface3 = '#254870';
    surface4 = '#2E5C8C';
    textPrimary = '#E0F0FF';
    textSecondary = 'rgba(224,240,255,0.75)';
    textTertiary = 'rgba(224,240,255,0.50)';
    textDisabled = 'rgba(224,240,255,0.30)';
    borderStrong = 'rgba(100,180,255,0.15)';
    borderSubtle = 'rgba(100,180,255,0.06)';
    borderFocus = 'rgba(100,180,255,0.40)';
  } else if (isSunset) {
    // Sunset: Naranjas, rosas y cálidos
    base = '#1F1012';
    surface1 = '#3D1F2A';
    surface2 = '#5C3B48';
    surface3 = '#7B5765';
    surface4 = '#9A7382';
    textPrimary = '#FFDFCC';
    textSecondary = 'rgba(255,223,204,0.75)';
    textTertiary = 'rgba(255,223,204,0.50)';
    textDisabled = 'rgba(255,223,204,0.30)';
    borderStrong = 'rgba(255,150,100,0.15)';
    borderSubtle = 'rgba(255,150,100,0.06)';
    borderFocus = 'rgba(255,150,100,0.40)';
  } else {
    // Dark (default): Optimizado con #111111 para reducir fatiga ocular
    base = '#111111';
    surface1 = '#1A1A1F';
    surface2 = '#222229';
    surface3 = '#2A2A33';
    surface4 = '#32323E';
    textPrimary = '#FFFFFF';
    textSecondary = 'rgba(255,255,255,0.70)';
    textTertiary = 'rgba(255,255,255,0.45)';
    textDisabled = 'rgba(255,255,255,0.25)';
    borderStrong = 'rgba(255,255,255,0.12)';
    borderSubtle = 'rgba(255,255,255,0.04)';
    borderFocus = 'rgba(255,255,255,0.35)';
  }

  return {
    action: '#FFFFFF',
    primary: '#FFFFFF',
    actionPressed: isLight ? '#E8EAF1' : '#E9E9EC',
    actionDim: isLight ? '#DADDE6' : '#CFCFD5',
    actionBg: isLight ? 'rgba(20,20,25,0.06)' : 'rgba(255,255,255,0.08)',
    actionBorder: isLight ? 'rgba(20,20,25,0.14)' : 'rgba(255,255,255,0.16)',
    actionGlow: isLight ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.10)',
    actionPulse: isLight ? 'rgba(20,20,25,0.10)' : 'rgba(255,255,255,0.14)',

    secondary: '#007AFF',
    secondaryPressed: '#0062CC',
    secondaryDim: '#5AA7FF',
    secondaryBg: isLight ? 'rgba(0,122,255,0.08)' : 'rgba(255,255,255,0.08)',
    secondaryBorder: isLight ? 'rgba(0,122,255,0.18)' : 'rgba(255,255,255,0.16)',
    secondaryGlow: isLight ? 'rgba(0,122,255,0.10)' : 'rgba(255,255,255,0.10)',
    secondaryPulse: isLight ? 'rgba(0,122,255,0.14)' : 'rgba(255,255,255,0.14)',

    base,
    background: base,
    surface: surface1,
    elevated: surface2,
    overlaySurface: surface2,
    overlaySurface2: surface4,
    glassSurface: isLight ? 'rgba(255,255,255,0.92)' : 'rgba(20,20,25,0.82)',

    bgBase: base,
    bgPrimary: base,
    bgPrimarySoft: surface1,
    bgSurface: surface1,
    bgElevated: surface2,
    bgOverlay: surface2,
    bgOverlay2: surface4,
    bgFloating: surface1,
    bgGlass: isLight ? 'rgba(255,255,255,0.92)' : 'rgba(20,20,25,0.82)',

    surface1,
    surface2,
    surface3,

    border: borderStrong,
    border2: isLight ? 'rgba(20,20,25,0.16)' : 'rgba(255,255,255,0.12)',
    borderSubtle,
    borderStrong,
    divider: borderSubtle,
    borderFocus,

    textPrimary,
    text: textPrimary,
    textSecondary,
    textMuted: textTertiary,
    textDisabled,
    gray400: textTertiary,
    gray500: textSecondary,
    gray600: textPrimary,

    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
    info: '#007AFF',
    excellent: '#34C759',
    danger: '#FF3B30',

    successBg: withOpacity('#34C759', isLight ? 0.12 : 0.14),
    primaryLight: withOpacity('#FFFFFF', isLight ? 0.4 : 0.08),
    successDim: withOpacity('#34C759', isLight ? 0.08 : 0.12),
    errorBg: withOpacity('#FF3B30', isLight ? 0.12 : 0.15),
    warningBg: withOpacity('#FF9500', isLight ? 0.12 : 0.14),
    infoBg: withOpacity('#007AFF', isLight ? 0.1 : 0.14),

    brand: '#FFFFFF',
    brandDark: isLight ? '#141419' : '#DADAE0',
    brandLight: isLight ? '#FFFFFF' : '#FFFFFF',
    premium: '#FFD60A',
    premiumBg: withOpacity('#FFD60A', isLight ? 0.12 : 0.14),

    overlay: isLight ? 'rgba(20,20,25,0.42)' : 'rgba(0,0,0,0.70)',
    overlayLight: isLight ? 'rgba(255,255,255,0.92)' : 'rgba(28,28,36,0.84)',
    glass: isLight ? 'rgba(255,255,255,0.92)' : 'rgba(20,20,25,0.82)',
    glassLight: isLight ? 'rgba(255,255,255,0.96)' : 'rgba(28,28,36,0.88)',

    workout: MODULE_COLORS.workout.main,
    workoutDark: MODULE_COLORS.workout.dark,
    workoutBg: withOpacity(MODULE_COLORS.workout.main, isLight ? 0.12 : 0.14),
    nutrition: MODULE_COLORS.nutrition.main,
    nutritionDark: MODULE_COLORS.nutrition.dark,
    nutritionBg: withOpacity(MODULE_COLORS.nutrition.main, isLight ? 0.12 : 0.14),
    water: MODULE_COLORS.water.main,
    waterDark: MODULE_COLORS.water.dark,
    waterBg: withOpacity(MODULE_COLORS.water.main, isLight ? 0.12 : 0.14),
    sleep: MODULE_COLORS.sleep.main,
    sleepDark: MODULE_COLORS.sleep.dark,
    sleepBg: withOpacity(MODULE_COLORS.sleep.main, isLight ? 0.12 : 0.14),
    steps: MODULE_COLORS.steps.main,
    stepsDark: MODULE_COLORS.steps.dark,
    stepsBg: withOpacity(MODULE_COLORS.steps.main, isLight ? 0.12 : 0.14),
    weight: MODULE_COLORS.weight.main,
    weightDark: MODULE_COLORS.weight.dark,
    weightBg: withOpacity(MODULE_COLORS.weight.main, isLight ? 0.08 : 0.10),
    fasting: MODULE_COLORS.fasting.main,
    fastingDark: MODULE_COLORS.fasting.dark,
    fastingBg: withOpacity(MODULE_COLORS.fasting.main, isLight ? 0.12 : 0.14),
    recovery: MODULE_COLORS.recovery.main,
    recoveryDark: MODULE_COLORS.recovery.dark,
    recoveryBg: withOpacity(MODULE_COLORS.recovery.main, isLight ? 0.08 : 0.10),
    mental: MODULE_COLORS.mental.main,
    mentalDark: MODULE_COLORS.mental.dark,
    mentalBg: withOpacity(MODULE_COLORS.mental.main, isLight ? 0.12 : 0.14),
    supplements: MODULE_COLORS.supplements.main,
    supplementsDark: MODULE_COLORS.supplements.dark,
    supplementsBg: withOpacity(MODULE_COLORS.supplements.main, isLight ? 0.12 : 0.14),
    female: MODULE_COLORS.female.main,
    femaleDark: MODULE_COLORS.female.dark,
    femaleBg: withOpacity(MODULE_COLORS.female.main, isLight ? 0.12 : 0.14),

    rarityCommon: textTertiary,
    rarityRare: MODULE_COLORS.mental.main,
    rarityEpic: MODULE_COLORS.supplements.main,
    rarityLegendary: '#FFD60A',

    transparent: 'transparent',
    white: '#FFFFFF',
    black: '#0A0A0F',

    gradients: {
      brand: pair('#FFFFFF', isLight ? '#E8EAF1' : '#D7D7DD'),
      brandLight: pair('#FFFFFF', isLight ? '#F7F8FB' : '#EDEDF2'),
      premium: pair('#FFD60A', '#FFB800'),
      water: pair(MODULE_COLORS.water.main, MODULE_COLORS.water.dark),
      steps: pair(MODULE_COLORS.steps.main, MODULE_COLORS.steps.dark),
      fasting: pair(MODULE_COLORS.fasting.main, MODULE_COLORS.fasting.dark),
      sleep: pair(MODULE_COLORS.sleep.main, MODULE_COLORS.sleep.dark),
      nutrition: pair(MODULE_COLORS.nutrition.main, MODULE_COLORS.nutrition.dark),
      weight: pair(MODULE_COLORS.weight.main, MODULE_COLORS.weight.dark),
      workout: pair(MODULE_COLORS.workout.main, MODULE_COLORS.workout.dark),
      mental: pair(MODULE_COLORS.mental.main, MODULE_COLORS.mental.dark),
      female: pair(MODULE_COLORS.female.main, MODULE_COLORS.female.dark),
      surface: pair(surface2, surface1),
      dark: pair(surface2, base),
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
  preference: 'dark' | 'light' | 'system' | 'midnight' | 'pastel' | 'forest' | 'ocean' | 'sunset',
  systemColorScheme?: ColorSchemeName | null,
): AppColorScheme {
  if (preference === 'system') {
    return systemColorScheme === 'light' ? 'light' : 'dark';
  }
  return preference as AppColorScheme;
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
  const entry = MODULE_COLORS[module as ModuleKey] ?? MODULE_COLORS.workout;
  const hex = entry.main.replace('#', '');
  const value = Number.parseInt(hex, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255] as const;
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
