// ============================================================
// VYRA FITNESS - Theme System 2026
// Tipografia, espaciado, radios, sombras y timings base.
// ============================================================

export const FontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  display: 'Inter_700Bold',
  mono: 'Inter_700Bold',
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  '2xl': 30,
  '3xl': 36,
  '4xl': 44,
  '5xl': 52,
  '6xl': 60,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

export const LineHeight = {
  tight: 1.08,
  snug: 1.24,
  normal: 1.56,
  relaxed: 1.64,
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
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 34,
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
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 3,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.3,
    shadowRadius: 34,
    elevation: 10,
  },
  brand: {
    shadowColor: '#7B6DFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.26,
    shadowRadius: 26,
    elevation: 10,
  },
  premium: {
    shadowColor: '#5ABEFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 26,
    elevation: 10,
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
  header: 66,
  button: 56,
  buttonSm: 44,
  buttonLg: 60,
  input: 56,
  inputSm: 42,
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
  normal: 250,
  slow: 400,
  slower: 600,
  slowest: 1000,
  countUp: 1500,
} as const;

export const Easing = {
  spring: { damping: 15, stiffness: 200 },
  springBouncy: { damping: 10, stiffness: 180 },
  springSnappy: { damping: 20, stiffness: 300 },
} as const;

// Compatibility helpers: explicit types and a stable `md` alias export
export type FontSizeType = typeof FontSize;
export const FontSizeMd = FontSize.md;
