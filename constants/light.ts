import { Colors } from './colors';

// Compatibilidad para pantallas legacy que siguen importando `LightColors`.
// El sistema visual oficial ya es oscuro; este alias evita romper esos usos
// mientras migramos el resto de las pantallas al nuevo naming.
export const LightColors = {
  bg: Colors.bgPrimary,
  card: Colors.bgSurface,
  border: Colors.border,
  borderStrong: Colors.borderStrong,
  text: Colors.textPrimary,
  muted: Colors.textSecondary,
  soft: Colors.surface3,
  shadow: 'rgba(0,0,0,0.24)',
  success: Colors.success,
  warning: Colors.warning,
  danger: Colors.error,
  info: Colors.info,
} as const;
