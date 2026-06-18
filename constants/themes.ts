// Available color themes with labels and descriptions
export const AVAILABLE_THEMES = [
  { id: 'system', label: 'Sistema', description: 'Sigue el tema del dispositivo' },
  { id: 'light', label: 'Claro', description: 'Blanco y tonos claros' },
  { id: 'dark', label: 'Oscuro', description: 'Gris oscuro y negro' },
  { id: 'midnight', label: 'Medianoche', description: 'Oscuro profundo con acentos azules' },
  { id: 'pastel', label: 'Pastel', description: 'Colores suaves y relajantes' },
  { id: 'forest', label: 'Bosque', description: 'Verdes naturales y tonos tierra' },
  { id: 'ocean', label: 'Océano', description: 'Azules profundos y calmantes' },
  { id: 'sunset', label: 'Atardecer', description: 'Naranjas, rosas y tonos cálidos' },
] as const;

export type ThemeId = typeof AVAILABLE_THEMES[number]['id'];

export function getThemeLabel(themeId: string): string {
  const theme = AVAILABLE_THEMES.find((t) => t.id === themeId);
  return theme?.label ?? 'Desconocido';
}

export function getThemeDescription(themeId: string): string {
  const theme = AVAILABLE_THEMES.find((t) => t.id === themeId);
  return theme?.description ?? '';
}
