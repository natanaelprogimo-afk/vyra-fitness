// REDESIGNED: 2026-05-20 - theme tokens align with exhaustive redesign foundations
export const FontFamily = {
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
  black: 'DMSans_800ExtraBold',
  display: 'DMSans_700Bold',
  mono: 'DMSans_600SemiBold',
} as const;

export const FontSize = {
  '2.1xl': 10,
  xs: 11,
  sm: 12,
  base: 13,
  '2.25xl': 14,
  md: 15,
  '1.5xl': 18,
  lg: 17,
  'lg+': 20,
  xl: 24,
  '2xl': 28,
  '2.5xl': 32,
  '2.75xl': 36,
  '3xl': 40,
  '3.5xl': 44,
  '3.75xl': 48,
  '3.85xl': 30,
  '3.9xl': 52,
  '3.95xl': 56,
  '3.97xl': 34,
  '4xl': 64,
  '5xl': 80,
  '6xl': 96,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

export const LineHeight = {
  tight: 1.05,
  snug: 1.2,
  normal: 1.45,
  relaxed: 1.6,
  px2: 2,
  px4: 4,
  px7: 7,
  px8: 8,
  px10: 10,
  px18: 18,
  px20: 20,
  px21: 21,
  px22: 22,
  px24: 24,
  px28: 28,
  px30: 30,
  px32: 32,
  px34: 34,
  px36: 36,
  px40: 40,
  px42: 42,
  px44: 44,
  px48: 48,
  px52: 52,
  px56: 56,
  px64: 64,
  px72: 72,
  px76: 76,
  px96: 96,
  px115: 115,
} as const;

export const TextLeading = {
  xs: LineHeight.px18,
  sm: LineHeight.px20,
  base: LineHeight.px20,
  md: LineHeight.px22,
  lg: LineHeight.px24,
  '1.5xl': LineHeight.px28,
  'lg+': LineHeight.px28,
  xl: LineHeight.px30,
  '2xl': LineHeight.px34,
  '2.5xl': LineHeight.px40,
  '2.75xl': LineHeight.px44,
  '3xl': LineHeight.px48,
  '3.5xl': LineHeight.px52,
  '3.75xl': LineHeight.px56,
  '3.85xl': LineHeight.px36,
  '3.9xl': LineHeight.px56,
  '3.95xl': LineHeight.px64,
  '3.97xl': LineHeight.px40,
  '4xl': LineHeight.px72,
  '5xl': LineHeight.px96,
  '6xl': LineHeight.px115,
} as const;

export const Spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  xs: 8,
  2.5: 10,
  3: 12,
  sm: 12,
  3.5: 14,
  4: 16,
  md: 16,
  4.5: 18,
  5: 20,
  6: 24,
  lg: 24,
  7: 28,
  8: 32,
  xl: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const Radius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 24,
  full: 9999,
} as const;

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 14,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 22,
    elevation: 10,
  },
  brand: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 8,
  },
  premium: {
    shadowColor: '#FFD60A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 8,
  },
} as const;

export const IconSize = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

export const ComponentHeight = {
  tabBar: 68,
  header: 52,
  button: 52,
  buttonSm: 44,
  buttonLg: 56,
  input: 52,
  inputSm: 44,
  quickButton: 96,
  quickAction: 80,
  quickActionNutrition: 76,
  streakBadge: 44,
  weekDot: 36,
  metricIconWrap: 36,
  historyBars: 150,
  symptomButton: 42,
  cyclePhaseButton: 64,
  cycleNotesButton: 92,
  cycleSymptomsButton: 38,
  bottomSheet: {
    snap1: '40%',
    snap2: '75%',
    full: '90%',
  },
} as const;

export const ComponentWidth = {
  quickButton: '48%',
  quickAction: '47%',
  quickActionIcon: 38,
  metricCard: '48%',
  metricScrollItem: 214,
  cycleSymptomButton: 54,
  half: '50%',
  third: '33.33%',
  twoThirds: '66.66%',
} as const;

export const TouchTarget = {
  min: 44,
  comfortable: 48,
  large: 56,
} as const;

export const ZIndex = {
  base: 0,
  elevated: 10,
  dropdown: 20,
  modal: 30,
  toast: 40,
  overlay: 50,
  top: 99,
} as const;

export const Duration = {
  instant: 0,
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,
  slowest: 1000,
  countUp: 800,
} as const;

export const Easing = {
  spring: { damping: 15, stiffness: 150 },
  springBouncy: { damping: 12, stiffness: 170 },
  springSnappy: { damping: 18, stiffness: 220 },
} as const;

export type FontSizeType = typeof FontSize;
export const FontSizeMd = FontSize.md;
