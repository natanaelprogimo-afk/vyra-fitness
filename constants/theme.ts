// ============================================================
// VYRA FITNESS — Theme System
// Tipografía, espaciado, sombras, border radius
// ============================================================

export const FontFamily = {
  regular:  'Inter_400Regular',
  medium:   'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold:     'Inter_700Bold',
  // Display para números grandes y títulos hero
  display:  'Inter_700Bold',
} as const;

export const FontSize = {
  xs:   12,
  sm:   14,
  base: 16,
  lg:   18,
  xl:   20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
} as const;

export const FontWeight = {
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
} as const;

export const LineHeight = {
  tight:   1.2,
  snug:    1.35,
  normal:  1.5,
  relaxed: 1.65,
} as const;

// ─── Espaciado (múltiplos de 4px) ────────────────────────────
export const Spacing = {
  0:   0,
  0.5: 2,
  1:   4,
  1.5: 6,
  2:   8,
  2.5: 10,
  3:   12,
  3.5: 14,
  4:   16,
  5:   20,
  6:   24,
  7:   28,
  8:   32,
  9:   36,
  10:  40,
  12:  48,
  14:  56,
  16:  64,
  20:  80,
  24:  96,
} as const;

// ─── Border Radius ────────────────────────────────────────────
export const Radius = {
  none: 0,
  sm:   4,
  md:   8,
  lg:   12,
  xl:   16,
  '2xl': 20,
  '3xl': 24,
  full:  9999,
} as const;

// ─── Sombras ─────────────────────────────────────────────────
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  brand: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  premium: {
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// ─── Tamaños de íconos ───────────────────────────────────────
export const IconSize = {
  xs:  14,
  sm:  16,
  md:  20,
  lg:  24,
  xl:  28,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

// ─── Alturas de componentes comunes ──────────────────────────
export const ComponentHeight = {
  tabBar:         72,
  header:         56,
  button:         52,
  buttonSm:       40,
  buttonLg:       60,
  input:          52,
  inputSm:        40,
  bottomSheet:    {
    snap1: '40%',
    snap2: '75%',
    full:  '95%',
  },
} as const;

// ─── Z-index ─────────────────────────────────────────────────
export const ZIndex = {
  base:       0,
  elevated:   10,
  dropdown:   20,
  modal:      30,
  toast:      40,
  overlay:    50,
  top:        99,
} as const;

// ─── Duración de animaciones (ms) ────────────────────────────
export const Duration = {
  instant:  0,
  fast:     150,
  normal:   250,
  slow:     400,
  slower:   600,
  slowest:  1000,
  countUp:  1500,  // AnimatedNumber count-up
} as const;

// ─── Easing presets (Reanimated compatible) ──────────────────
export const Easing = {
  // Se usan con Reanimated's Easing
  spring: { damping: 15, stiffness: 200 },
  springBouncy: { damping: 10, stiffness: 180 },
  springSnappy: { damping: 20, stiffness: 300 },
} as const;