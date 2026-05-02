export type TextScalePreference = 'normal' | 'large' | 'extraLarge';

const TEXT_SCALE_MULTIPLIER: Record<TextScalePreference, number> = {
  normal: 1,
  large: 1.15,
  extraLarge: 1.3,
};

export function getTextScaleMultiplier(preference: TextScalePreference): number {
  return TEXT_SCALE_MULTIPLIER[preference] ?? 1;
}

