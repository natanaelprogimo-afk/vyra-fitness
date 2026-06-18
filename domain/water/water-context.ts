import { getProfileContextMemory } from '@/lib/profile-context';
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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function readOptionalNumber(record: Record<string, unknown>, key: string): number | null {
  const parsed = Number(record[key]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getWaterContext(profile: UserProfile | null | undefined): WaterContextSettings {
  const memory = getProfileContextMemory(profile);
  if (!Object.keys(memory).length) {
    return DEFAULT_CONTEXT;
  }
  const context = asRecord(memory.water_context);
  const auto = asRecord(memory.water_context_auto);

  const climate = typeof context.climate === 'string' ? (context.climate as WaterClimate) : DEFAULT_CONTEXT.climate;
  const illness = typeof context.illness === 'string' ? (context.illness as WaterIllness) : DEFAULT_CONTEXT.illness;
  const sweatLevel = typeof context.sweatLevel === 'string' ? (context.sweatLevel as WaterSweatLevel) : DEFAULT_CONTEXT.sweatLevel;

  const autoEnabled = typeof auto.enabled === 'boolean' ? auto.enabled : DEFAULT_CONTEXT.auto.enabled;
  const autoClimate = typeof auto.climate === 'string' ? (auto.climate as WaterClimate) : null;
  const autoUpdatedAt = typeof auto.updated_at === 'string' ? (auto.updated_at as string) : null;
  const temperatureC = readOptionalNumber(auto, 'temperature_c');
  const humidityPct = readOptionalNumber(auto, 'humidity_pct');
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
  contextMemory: Record<string, unknown> | null | undefined,
  context: Pick<WaterContextSettings, 'climate' | 'illness' | 'sweatLevel'>,
): Record<string, unknown> {
  const memory = contextMemory ? contextMemory : {};
  const existingAuto = asRecord(memory.water_context_auto);

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
  contextMemory: Record<string, unknown> | null | undefined,
  auto: Partial<WaterAutoContext>,
): Record<string, unknown> {
  const memory = contextMemory ? contextMemory : {};
  const current = asRecord(memory.water_context_auto);

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
