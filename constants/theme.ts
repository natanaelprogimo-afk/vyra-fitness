export const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  display: 'Inter_800ExtraBold',
  mono: 'JetBrainsMono_600SemiBold',
} as const;

export const FontSize = {
  xs: 11,
  sm: 12,
  base: 13,
  md: 15,
  lg: 17,
  xl: 22,
  '2xl': 28,
  '3xl': 42,
  '4xl': 56,
  '5xl': 72,
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
} as const;

export const Spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
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
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
  '2xl': 20,
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
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 3,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 30,
    elevation: 10,
  },
  brand: {
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 8,
  },
  premium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
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
  tabBar: 64,
  header: 56,
  button: 56,
  buttonSm: 48,
  buttonLg: 60,
  input: 56,
  inputSm: 44,
  bottomSheet: {
    snap1: '40%',
    snap2: '75%',
    full: '95%',
  },
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
  normal: 200,
  slow: 400,
  slower: 600,
  slowest: 1000,
  countUp: 800,
} as const;

export const Easing = {
  spring: { damping: 18, stiffness: 220 },
  springBouncy: { damping: 12, stiffness: 180 },
  springSnappy: { damping: 20, stiffness: 300 },
} as const;

export type FontSizeType = typeof FontSize;
export const FontSizeMd = FontSize.md;
