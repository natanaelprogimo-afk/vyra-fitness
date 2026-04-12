import type { UserProfile } from '@/types/user';

export type WaterClimate = 'normal' | 'warm' | 'hot' | 'humid' | 'dry';
export type WaterIllness = 'none' | 'cold' | 'fever';
export type WaterSweatLevel = 'low' | 'moderate' | 'high';

export interface WaterContextSettings {
  climate: WaterClimate;
  illness: WaterIllness;
  sweatLevel: WaterSweatLevel;
  auto: WaterAutoContext;
}

export interface WaterAutoContext {
  enabled: boolean;
  climate: WaterClimate | null;
  updatedAt: string | null;
  temperatureC: number | null;
  humidityPct: number | null;
  source: string | null;
}

export const WATER_CLIMATE_OPTIONS: Array<{ id: WaterClimate; label: string; hint: string }> = [
  { id: 'normal', label: 'Templado', hint: 'Clima neutro, sin calor extremo.' },
  { id: 'warm', label: 'Cálido', hint: 'Días tibios o con algo de calor.' },
  { id: 'hot', label: 'Muy caluroso', hint: 'Calor fuerte o sol directo prolongado.' },
  { id: 'humid', label: 'Húmedo', hint: 'Bochorno o humedad alta.' },
  { id: 'dry', label: 'Seco', hint: 'Ambiente seco o con calefacción constante.' },
];

export const WATER_ILLNESS_OPTIONS: Array<{ id: WaterIllness; label: string; hint: string }> = [
  { id: 'none', label: 'Sin síntomas', hint: 'Sin fiebre ni malestar.' },
  { id: 'cold', label: 'Resfrío leve', hint: 'Nariz tapada, garganta sensible.' },
  { id: 'fever', label: 'Fiebre / malestar', hint: 'Decaimiento, fiebre o sudor.' },
];

export const WATER_SWEAT_OPTIONS: Array<{ id: WaterSweatLevel; label: string; hint: string }> = [
  { id: 'low', label: 'Baja sudoración', hint: 'Entrenos suaves o poca actividad.' },
  { id: 'moderate', label: 'Moderada', hint: 'Actividad regular o cardio ligero.' },
  { id: 'high', label: 'Alta sudoración', hint: 'Entrenos intensos o mucho calor.' },
];

const DEFAULT_CONTEXT: WaterContextSettings = {
  climate: 'normal',
  illness: 'none',
  sweatLevel: 'moderate',
  auto: {
    enabled: false,
    climate: null,
    updatedAt: null,
    temperatureC: null,
    humidityPct: null,
    source: null,
  },
};

export function getWaterContext(profile: UserProfile | null | undefined): WaterContextSettings {
  if (!profile?.coach_memory_json || typeof profile.coach_memory_json !== 'object') {
    return DEFAULT_CONTEXT;
  }
  const memory = profile.coach_memory_json as Record<string, unknown>;
  const context = memory.water_context && typeof memory.water_context === 'object'
    ? (memory.water_context as Record<string, unknown>)
    : {};
  const auto = memory.water_context_auto && typeof memory.water_context_auto === 'object'
    ? (memory.water_context_auto as Record<string, unknown>)
    : {};

  const climate = typeof context.climate === 'string' ? (context.climate as WaterClimate) : DEFAULT_CONTEXT.climate;
  const illness = typeof context.illness === 'string' ? (context.illness as WaterIllness) : DEFAULT_CONTEXT.illness;
  const sweatLevel = typeof context.sweatLevel === 'string' ? (context.sweatLevel as WaterSweatLevel) : DEFAULT_CONTEXT.sweatLevel;

  const autoEnabled = typeof auto.enabled === 'boolean' ? (auto.enabled as boolean) : DEFAULT_CONTEXT.auto.enabled;
  const autoClimate = typeof auto.climate === 'string' ? (auto.climate as WaterClimate) : null;
  const autoUpdatedAt = typeof auto.updated_at === 'string' ? (auto.updated_at as string) : null;
  const temperatureC = Number.isFinite(Number((auto as any).temperature_c)) ? Number((auto as any).temperature_c) : null;
  const humidityPct = Number.isFinite(Number((auto as any).humidity_pct)) ? Number((auto as any).humidity_pct) : null;
  const source = typeof auto.source === 'string' ? (auto.source as string) : null;

  const climateValid = (WATER_CLIMATE_OPTIONS.find((option) => option.id === climate)?.id) ?? DEFAULT_CONTEXT.climate;
  const illnessValid = (WATER_ILLNESS_OPTIONS.find((option) => option.id === illness)?.id) ?? DEFAULT_CONTEXT.illness;
  const sweatValid = (WATER_SWEAT_OPTIONS.find((option) => option.id === sweatLevel)?.id) ?? DEFAULT_CONTEXT.sweatLevel;
  const autoClimateValid = (WATER_CLIMATE_OPTIONS.find((option) => option.id === autoClimate)?.id) ?? null;

  return {
    climate: climateValid,
    illness: illnessValid,
    sweatLevel: sweatValid,
    auto: {
      enabled: autoEnabled,
      climate: autoClimateValid,
      updatedAt: autoUpdatedAt,
      temperatureC,
      humidityPct,
      source,
    },
  };
}

export function withWaterContext(
  coachMemory: Record<string, unknown> | null | undefined,
  context: Pick<WaterContextSettings, 'climate' | 'illness' | 'sweatLevel'>,
): Record<string, unknown> {
  const memory = coachMemory ? coachMemory : {};
  const existingAuto =
    memory && (memory as any).water_context_auto && typeof (memory as any).water_context_auto === 'object'
      ? ((memory as any).water_context_auto as Record<string, unknown>)
      : {};

  return {
    ...memory,
    water_context: {
      climate: context.climate,
      illness: context.illness,
      sweatLevel: context.sweatLevel,
    },
    water_context_auto: existingAuto,
  };
}

export function withWaterAutoContext(
  coachMemory: Record<string, unknown> | null | undefined,
  auto: Partial<WaterAutoContext>,
): Record<string, unknown> {
  const memory = coachMemory ? coachMemory : {};
  const current =
    memory && (memory as any).water_context_auto && typeof (memory as any).water_context_auto === 'object'
      ? ((memory as any).water_context_auto as Record<string, any>)
      : {};

  const currentEnabled = typeof current.enabled === 'boolean' ? current.enabled : undefined;
  const currentClimate = typeof current.climate === 'string' ? (current.climate as WaterClimate) : null;

  return {
    ...memory,
    water_context_auto: {
      ...current,
      enabled: typeof auto.enabled === 'boolean' ? auto.enabled : (currentEnabled ?? false),
      climate: typeof auto.climate === 'string' ? auto.climate : (currentClimate ?? null),
      updated_at: auto.updatedAt ?? (current.updated_at ?? null),
      temperature_c: auto.temperatureC ?? (current.temperature_c ?? null),
      humidity_pct: auto.humidityPct ?? (current.humidity_pct ?? null),
      source: auto.source ?? (current.source ?? null),
    },
  };
}
